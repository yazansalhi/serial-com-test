const express = require('express');
const app = express();

let SerialPort = require('serialport');     // include the serialport library
let	portName =  process.argv[2];            // get the port name from the command line



// if they didn't give a port name, tell them so, then quit:
if (!portName) {
  giveInstructions();
}

var myPort = new SerialPort(portName, 9600);// open the port
var Readline = SerialPort.parsers.Readline; // make instance of Readline parser
var parser = new Readline();                // make a new parser to read ASCII lines
myPort.pipe(parser);                        // pipe the serial stream to the parser

// these are the definitions for the serial events:
myPort.on('open', showPortOpen);    // called when the serial port opens
myPort.on('close', showPortClose);  // called when the serial port closes
myPort.on('error', showError);      // called when there's an error with the serial port
parser.on('data', readSerialData);  // called when there's new data incoming

// these are the functions called when the serial events occur:
function showPortOpen() {
  console.log('port open. Data rate: ' + myPort.baudRate);
}

function readSerialData(data) {
  console.log(data);
}

function showPortClose() {
  console.log('port closed.');
}

function showError(error) {
  console.log('Serial port error: ' + error);
}

function giveInstructions() {
    console.log('you did not give a port name');
    console.log('To run this properly, type \n');
    console.log('node index.js portname\n');
    console.log('run node listPorts.js script to get a list of ports.\n');
    process.exit(0);
}

app.get('/', function (req, res) {

    return res.send('Working');
 
})

app.get('/:action', function (req, res) {
    
    var action = req.params.action || req.param('action');
     
     if(action == 'read'){
        myPort.write("w");
         return res.send('port write!');
     } 
     if(action == 'write') {
        myPort.read("t");
         return res.send("port read!");
     }
     
     return res.send('Action: ' + action);
  
 });
 app.listen(port, function () {
    console.log('Example app listening on port http://0.0.0.0:' + port + '!');
  });