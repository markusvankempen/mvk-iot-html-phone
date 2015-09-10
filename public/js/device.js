/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
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
 * * Markus van Kempen - mvk@ca.ibm.com - some changes e.g subscbtion topic
 *******************************************************************************/
(function(window){
    var ax = 0, ay = 0, az = 0, oa = 0, ob = 0, og = 0;

	var client;
    var orgId;
	var clientId;
    var password;

	var topic = "iot-2/evt/sensorData/fmt/json";
    var isConnected = false;

	window.lat = 0;
	window.lng = 0;

    window.ondevicemotion = function(event) {
        ax = parseFloat((event.acceleration.x || 0));
        ay = parseFloat((event.acceleration.y || 0));
        az = parseFloat((event.acceleration.z || 0));

        document.getElementById("accx").innerHTML = ax.toFixed(2);
        document.getElementById("accy").innerHTML = ay.toFixed(2);
        document.getElementById("accz").innerHTML = az.toFixed(2);
    }

    window.ondeviceorientation = function(event){

        oa = (event.alpha || 0);
        ob = (event.beta || 0);
        og = (event.gamma || 0);

        if(event.webkitCompassHeading){
            oa = -event.webkitCompassHeading;
        }

        document.getElementById("alpha").innerHTML = oa.toFixed(2);
        document.getElementById("beta").innerHTML = ob.toFixed(2);
        document.getElementById("gamma").innerHTML = og.toFixed(2);
    }

	window.msgCount = 0;

	var updatePersonalLocation = function(position) {
		window.lat = position.coords.latitude;
		window.lng = position.coords.longitude;
		$("#lat").html(window.lat.toFixed(6));
		$("#lng").html(window.lng.toFixed(6));
	}

	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(updatePersonalLocation);
	}

	function getId() {
		window.deviceId = prompt("Enter a unique ID for your phone containing only letters and numbers:");
		if (window.deviceId) {
			$("#deviceId").html(window.deviceId);
			getDeviceCredentials();
		}
	}

    function publish() {
    	// We only attempt to publish if we're actually connected, saving CPU and battery
		if (isConnected) {
	    	var payload = {
	            "d": {
					"id": window.deviceId,
					"ts": (new Date()).getTime(),
					"lat": parseFloat(window.lat),
					"lng": parseFloat(window.lng),
					"ax": parseFloat(ax.toFixed(2)),
					"ay": parseFloat(ay.toFixed(2)),
					"az": parseFloat(az.toFixed(2)),
					"oa": parseFloat(oa.toFixed(2)),
					"ob": parseFloat(ob.toFixed(2)),
					"og": parseFloat(og.toFixed(2))
				}
	        };
	        var message = new Paho.MQTT.Message(JSON.stringify(payload));
	        message.destinationName = topic;
	       	try {
			     client.send(message);
				 window.msgCount++;
				 $("#msgCount").html(window.msgCount+"<br>MSG: "+JSON.stringify(payload));
			     //console.log("[%s] Published", new Date().getTime());
			}
			catch (err) {
				isConnected = false;
				changeConnectionStatusImage("/images/disconnected.svg");
				document.getElementById("connection").innerHTML = "Disconnected";
				setTimeout(connectDevice(client), 1000);
			}
		}
    }

    function onConnectSuccess(){
    	// The device connected successfully
        console.log("Connected Successfully!");
        isConnected = true;
        changeConnectionStatusImage("/images/connected.svg");
        document.getElementById("connection").innerHTML = "Connected";

client.subscribe('iot-2/cmd/+/fmt/json');
console.log("Subscribe to : "+'iot-2/cmd/+/fmt/json');


    }
    
    // called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.payloadString);



	$("#msgReceived").html(": "+message.payloadString);
	console.log("Hello Markus !");
				     
				     
  	myData = JSON.parse(message.payloadString);

	$("body").css("background", myData.d.Color);		
	if (myData.d.myName != null)
	{
		    console.log("Color = " + myData.d.Color);
		    $("body").css("background",'#00008B');
		    $("body").css("background",'#000000');
		    $("body").css("background", myData.d.Color);

		console.log("myName = " + myData.d.myName);
			$("#mvkid").html(": "+myData.d.myName);

	}else{
		console.log("not the right data" );
	}	

}

var x=1;
var set;
function myTimer() 
{
    set=1;
    if(x==0 && set==1) {
        document.bgColor='#00008B';
        x=1;
        set=0;
    }
    if(x==1 && set==1) {
        document.bgColor='#FFFFFF';
        x=0;
        set=0;
    }
}
var timerInterval;

 function startBlinking(){
   if(!timerInterval)
   {
       timerInterval = setInterval(myTimer, 500);

   }

}

 function stopBlinking(){
    if(timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
    }
}
	
    function onConnectFailure(){
    	// The device failed to connect. Let's try again in one second.
        console.log("Could not connect to IoT Foundation! Trying again in one second.");
        setTimeout(connectDevice(client), 1000);
    }

    function connectDevice(client){
    	changeConnectionStatusImage("/images/connecting.svg");
    	document.getElementById("connection").innerHTML = "Connecting";
    	console.log("Connecting device to IoT Foundation...");
		client.connect({
			onSuccess: onConnectSuccess,
			onFailure: onConnectFailure,
			userName: "use-token-auth",
			password: password
		});
    }

    function getDeviceCredentials() {
		$.ajax({
			url: "/credentials/"+window.deviceId,
			type: "GET",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(response){
				orgId = response.org;
				clientId = "d:"+orgId+":"+response.deviceType+":"+response.deviceId;
				password = response.token;

				client = new Paho.MQTT.Client(orgId+".messaging.internetofthings.ibmcloud.com", 1883, clientId);

				console.log("Attempting connect");


				client.onMessageArrived = onMessageArrived;
				connectDevice(client);


				setInterval(publish, 100);
			},
			error: function(xhr, status, error) {
				if (xhr.status==403) {
					// Authentication check succeeded and told us we're invalid
					alert("Incorrect code!");
				} else {
					// Something else went wrong
					alert("Failed to authenticate! "+error);
				}
			}
		});
    }

    $(document).ready(function() {
		// prompt the user for id
		getId();
    });

	function changeConnectionStatusImage(image) {
        document.getElementById("connectionImage").src=image;
    }

}(window));
