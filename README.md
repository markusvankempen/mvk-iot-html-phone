# mvk-iot-html-phone

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)]
(https://bluemix.net/deploy?repository=https://hub.jazz.net/project/mvk/mvkphone)

## base  on
https://github.com/IBM-Bluemix/IOT-HTML5-Phone-Application
##

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
