## mvk-iot-html-phone

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)]
(https://bluemix.net/deploy?repository=https://github.com/markusvankempen/mvk-iot-html-phone)
### mvk iot html phone demo app
markus van kempen - mvk@ca.ibm.om

### base  on
https://github.com/IBM-Bluemix/IOT-HTML5-Phone-Application

Added Subscription Topic: iot-2/cmd/+/fmt/json

Send message to d.Color to change back ground color

### Payload Example
{"d":{
    "myName":"MarkusViaNodeRed",
    "Action" : 55,
    "Color" : col,
    "Special"  : "Breath",
    "MSGNO" : 2,
    "ts" : now
    }};
    
### Node-RED cmd function 
var now = ( new Date() ).getTime();
var col =  "#"+Math.random().toString(16).slice(-6);
var newMsg = {"d":{
    "myName":"MarkusViaNodeRed",
    "Action" : 55,
    "Color" : col,
    "Special"  : "Breath",
    "MSGNO" : 2,
    "ts" : now
    }};
var myMsg = {payload : JSON.stringify(newMsg)};
return  myMsg;
#### NR clipboard
[{"id":"e1efcc1a.1e103","type":"ibmiot in","authentication":"boundService","apiKey":"","inputType":"evt","deviceId":"desktop","applicationId":"","deviceType":"","eventType":"","commandType":"","format":"","name":"IBM IoT App In","service":"registered","allDevices":false,"allApplications":"","allDeviceTypes":true,"allEvents":true,"allCommands":"","allFormats":true,"x":147,"y":143,"z":"5dd9775a.a22688","wires":[["888399fd.777c68","b170bdbf.4e8f4"]]},{"id":"888399fd.777c68","type":"debug","name":"","active":false,"console":"false","complete":"false","x":329,"y":244,"z":"5dd9775a.a22688","wires":[]},{"id":"78b1a8ea.874e58","type":"ibmiot out","authentication":"boundService","apiKey":"","outputType":"cmd","deviceId":"desktop","deviceType":"iotphone","eventCommandType":"hello","format":"json","data":"msg.payload","name":"IBM IoT App Out","service":"registered","x":650,"y":161,"z":"5dd9775a.a22688","wires":[]},{"id":"84b844c4.7b47b8","type":"function","name":"make mqtt message","func":"var now = ( new Date() ).getTime();\nvar col =  \"#\"+Math.random().toString(16).slice(-6);\nvar newMsg = {\"d\":{\n    \"myName\":\"MarkusViaNodeRed\",\n    \"Action\" : 55,\n    \"Color\" : col,\n    \"Special\"  : \"Breath\",\n    \"MSGNO\" : 2,\n    \"ts\" : now\n    }};\nvar myMsg = {payload : JSON.stringify(newMsg)};\n\nreturn  myMsg;\n\n\n  ","outputs":1,"noerr":0,"x":406,"y":400,"z":"5dd9775a.a22688","wires":[["78b1a8ea.874e58","69bb48bf.9644b8"]]},{"id":"69bb48bf.9644b8","type":"debug","name":"","active":true,"console":"false","complete":"false","x":735,"y":517,"z":"5dd9775a.a22688","wires":[]},{"id":"b170bdbf.4e8f4","type":"delay","name":"","pauseType":"rate","timeout":"5","timeoutUnits":"seconds","rate":"30","rateUnits":"minute","randomFirst":"1","randomLast":"5","randomUnits":"seconds","drop":true,"x":207,"y":403,"z":"5dd9775a.a22688","wires":[["84b844c4.7b47b8"]]}]


  
    
