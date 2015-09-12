# mvk-iot-html-phone

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)]
(https://bluemix.net/deploy?repository=https://github.com/markusvankempen/mvk-iot-html-phone)
### mvk iot html phone demo app
markus van kempen - mvk@ca.ibm.om

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
