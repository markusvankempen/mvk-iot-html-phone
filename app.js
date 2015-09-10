/*******************************************************************************
 * Copyright (c) 2014 IBM Corp.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v1.0 which accompany this distribution.
 *
 * The Eclipse Public License is available at
 *   http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at
 *   http://www.eclipse.org/org/documents/edl-v10.php.
 *
 * Contributors:
 *   Bryan Boyd - Initial implementation 
 *******************************************************************************/

var http = require('http');
var express = require('express'),
    path = require('path'),
    http = require('http'),
    https = require('https');
var app = express();
var Cloudant = require('cloudant');

if (process.env.VCAP_SERVICES) {
	var env = JSON.parse(process.env.VCAP_SERVICES);
	console.log(env);

	if (env["cloudantNoSQLDB"])
	{
		db_props = env['cloudantNoSQLDB'][0]['credentials'];
		console.log(db_props);
	}
	else {
		console.log('You must bind the Cloudant DB to this application');
	}

	if (env["iotf-service"])
	{
		iot_props = env['iotf-service'][0]['credentials'];
		console.log(iot_props);
	}
	else
	{
		console.log('You must bind the Internet of Things service to this application');
	}
}

var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");

var iot_server = iot_props["mqtt_host"];
var iot_org = iot_props["org"];
var iot_port = iot_props["mqtt_u_port"];
var iot_username = "use-token-auth";

var device_type = "iotphone";

// all environments
app.set('port', process.env.PORT || 3001);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var device_credentials = null;
Cloudant({account:db_props.username, password:db_props.password}, function(err, cloudant) {
	console.log('Connected to Cloudant')

	cloudant.db.list(function(err, all_dbs) {
		if (all_dbs.length == 0) {
			// first time -- need to create the iotzone-devices database
			cloudant.db.create('device_credentials', function() {
				device_credentials = cloudant.use('device_credentials');
				console.log("created DB device_credentials");
			});
		} else {
			console.log("found DB device_credentials");
			device_credentials = cloudant.use('device_credentials');
		}
	})
})

app.get('/credentials/:deviceId', function(req, res) {
	var deviceId = req.params.deviceId;
	var token = getUserCredentials(deviceId, (function(_req, _res) {
		return function(json) {
			_res.json(json);
		}
	})(req, res));
});

function getUserCredentials(deviceId, callback) {
	// check to see if this device exists in the DB
	device_credentials.get(deviceId, function(err, body) {
		if (!err) {
			//console.log("Found doc: ", body, body.token);
			callback({ deviceType: device_type, deviceId: deviceId, token: body.token, org: iot_org });
		} else {
			// register with IoT Foundation, return credentials
			var options = {
				host: 'internetofthings.ibmcloud.com',
				port: 443,
				method: 'POST',
				headers: {
					"content-type" : "application/json"
				},
				path: 'api/v0001/organizations/'+iot_props.org+'/devices',
				auth: iot_props.apiKey + ':' + iot_props.apiToken
			};
			var iot_req = https.request(options, function(iot_res) {
				var str = '';
				iot_res.on('data', function(chunk) {
					str += chunk;
					//console.log("on data ", chunk);
				});
				iot_res.on('end', function() {
					var creds = JSON.parse(str); 
					console.log("on end", creds);
					if (creds.id) {
						device_credentials.insert({ token: creds.password }, creds.id, function(err, body) {
							console.log(creds);
							if (!err) {
								callback({ deviceType: device_type, deviceId: creds.id, token: creds.password, org: iot_org });
							} else {
								callback({ error: err.code });
							}
						});
					}
				});
			}).on('error', function(e) { console.log ("got error, " + e); });
			iot_req.write(JSON.stringify({ type: device_type, id: deviceId }));
			iot_req.end();
		}
	});
}

function clean(res) {
	// destroy and recreate database
	Cloudant({account:db_props.username, password:db_props.password}, function(err, cloudant) {
		cloudant.db.destroy('device_credentials', function() {
			cloudant.db.create('device_credentials', function() {
				console.log("cleaned db device_credentials");
			});
		});
	})

	// delete all registered devices
	var options = {
		host: 'internetofthings.ibmcloud.com',
		port: 443,
		method: 'GET',
		headers: {
			"content-type" : "application/json"
		},
		path: 'api/v0001/organizations/'+iot_props.org+'/devices',
		auth: iot_props.apiKey + ':' + iot_props.apiToken
	};
	var iot_req = https.request(options, function(iot_res) {
		var str = '';
		iot_res.on('data', function (chunk) {
			str += chunk;
			console.log("on data ", chunk);
		});
		iot_res.on('end', function () {
			var devices = JSON.parse(str); 
			for (var i in devices) {
				var dId = devices[i].id;
				console.log("deleting " + dId);
				var deleteRequest = https.request({
					host: 'internetofthings.ibmcloud.com',
					port: 443,
					method: 'DELETE',
					headers: {
						"content-type" : "application/json"
					},
					path: 'api/v0001/organizations/'+iot_props.org+'/devices/'+dId.split("-")[0]+'/' + dId,
					auth: iot_props.apiKey + ':' + iot_props.apiToken
				}, function (deleteResponse) { console.log(deleteResponse.statusCode); });
				deleteRequest.end();
			}
			if (res) { res.end(); }
		});
	}).on('error', function(e) { console.log ("got error, " + e); });
	iot_req.end();
}

app.get('/clean', function(req, res) {
	clean(res);
});

//////////////////

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
