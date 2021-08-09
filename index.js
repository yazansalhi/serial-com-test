const express = require('express');
const app = express();

let SerialPort = require('serialport');     // include the serialport library
let	portName =  process.argv[2];            // get the port name from the command line

const ACK_BUFFER =new Buffer([6]);
let ENQ_BUFFER = new Buffer([5]);
let STX_BUFFER = new Buffer([2]);
let ETX_BUFFER = new Buffer([3]);
const ACK = 6;
const ENQ = 5;
const STX = 2;
const ETX = 3;
const LF = 10;
const CR = 13;
const EOT = 4;

// Message Header 
  var buffer = new Buffer(16);
  buffer[0] = 0x02; // STX
  buffer[1] = 0x31; // 1
  buffer[2] = 0x48; // H
  buffer[3] = 0x7c; // !
  buffer[4] = 0x5c; // \
  buffer[5] = 0x5e; // ^
  buffer[6] = 0x26; // &
  buffer[7] = 0x7c; // !
  buffer[8] = 0x32; // 2
  buffer[9] = 0x30; // 0  // test year 2023 as date
  buffer[10] = 0x32; // 2
  buffer[11] = 0x33; // 3
  buffer[12] = 0x13; // CR
// END Message Header 

// Patient Information 

// END Patient Information 

// Test Order

// END Test Order

let transmission = [];
let statement = {
  hasStarted: false,
  hasEnded: false,
  dataMessage: '',
  checksum: ''
};



// if they didn't give a port name, tell them so, then quit:
if (!portName) {
  giveInstructions();
}

var myPort = new SerialPort(portName,{
  baudRate: 9600,
  databits: 8,
  parity: 'none'
});// open the port
var Readline = SerialPort.parsers.Readline; // make instance of Readline parser
var parser = new Readline();                // make a new parser to read ASCII lines
myPort.pipe(parser);                        // pipe the serial stream to the parser

// these are the definitions for the serial events:
myPort.on('open', showPortOpen);    // called when the serial port opens
myPort.on('close', showPortClose);  // called when the serial port closes
myPort.on('error', showError);      // called when there's an error with the serial port
myPort.on('data', readSerialData);  // called when there's new data incoming



// these are the functions called when the serial events occur:
function showPortOpen() {

  console.log('port open. Data rate: ' + myPort.baudRate);
 
  sendToSerial();
 
}



  
function readSerialData(data) {
  console.log('reading data ..',data);

  let str = data.toString('ascii');
  
  if (str.length === 0) return;

  if (str.charCodeAt(0) === ACK) {
    console.log('send header message')
    myPort.write(buffer);
  }
  if (str.charCodeAt(0) === ENQ) {
    myPort.write(ACK_BUFFER);
    console.log(' send ACK_BUFFER')

  } else if (str.charCodeAt(0) === EOT) {
    // console.log('this.transmission', this.transmission);
   
    logTrans(this.transmission);
    this.__log('transmission: \n', summarizeTransmission(this.transmission));
    this.transmission = [];

  } else {
    for (let char of str.split('')) {
      // console.log(char, char.charCodeAt(0));

      if (char.charCodeAt(0) === STX) {
        statement = {
          hasStarted: false,
          hasEnded: false,
          dataMessage: '',
          checksum: ''
        }
        statement.hasStarted = true;

      } else if (char.charCodeAt(0) === ETX) {
      
        if (!statement.hasStarted) {
          console.log("this.statement ended before it was started.");
          return;
        }
        statement.hasEnded = true;

      } else if (char.charCodeAt(0) === LF) {
        if (!statement.hasStarted) {
          console.log("LF before this.statement was started.");
          return;
        }
        if (!statement.hasEnded) {
          console.log("LF before this.statement was ended.");
          return;
        }
        this.transmission.push(statement);
        myPort.write(ACK_BUFFER);

      } else {
        if (!statement.hasStarted) {
          console.log(`Unkown character received before this.statement was started, ${char}, ${char.charCodeAt()}`);
          return;
        }
        if (char.charCodeAt(0) !== CR) {
          if (!statement.hasEnded) {
            statement.dataMessage += char;
          } else {
            statement.checksum += char;
          }
        }
      }
    }

  }
}
function summarizeTransmission(transmission) {
  let text = '';
  for (let statement of transmission) {
    let dataMessage = statement.dataMessage;
    if (dataMessage.length > 0) {
      dataMessage = dataMessage.substr(1, dataMessage.length);
    }
    text += dataMessage + '\n';
  }
  return text;
}
function logTrans(data){
  console.log('log trans data ',data)
}
function sendToSerial() {
 
  myPort.write(ENQ_BUFFER,'ascii');
 // myPort.read()
}

function showPortClose() {
  console.log('port closed.');
}

function showError(error) {
  console.log('Serial port error: ' + error);
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
