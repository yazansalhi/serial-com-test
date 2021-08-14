const express = require('express');
const app = express();

let SerialPort = require('serialport');     // include the serialport library
let	portName =  process.argv[2];            // get the port name from the command line
let sendBufferHeader = false
let sendPatientInfo = false
let sendBufferOrder = false
const ACK_BUFFER =new Buffer([6]);
const EOT_BUFFER =new Buffer([4]);

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
const NAK = 21;
let counter = 0;

// Message Header 
  var buffer = new Buffer(32);
  buffer[0] = 0x02; // STX
  buffer[1] = 0x31; // 1
  buffer[2] = 0x48; // H
  buffer[3] = 0x7c; // |
  buffer[4] = 0x5c; // \
  buffer[5] = 0x5e; // ^
  buffer[6] = 0x26; // &
  buffer[7] = 0x7c; // |
  buffer[8] = 0x7c; // |
  buffer[9] = 0x7c; // |

  // END Message Header 

  // SENDER 
  buffer[10] = 0x68;// h
  buffer[11] = 0x6f; // o
  buffer[12] = 0x73; // r
  buffer[13] = 0x74;  // t  
  //buffer[14] = 0x4d;  // M
 // buffer[15] = 0x41; // A
  // END SENDER

  buffer[14] = 0x5e; // ^
  buffer[15] = 0x31; // 1 

  buffer[16] = 0x7c; // |
  buffer[17] = 0x7c; // |
  buffer[18] = 0x7c; // |
  buffer[19] = 0x7c; // |
  buffer[20] = 0x7c; // |
  buffer[21] = 0x7c; // |
  buffer[22] = 0x7c; // |

  buffer[23] = 0x50; // P
  buffer[24] = 0x7c; // |
  buffer[25] = 0x31; // 1

  buffer[26] = 0x0D; // CR
  buffer[27] = 0x03; // ETX
  buffer[28] = 0x30; // 0
  buffer[29] = 0x37; // 7
  buffer[30] = 0x0D; // CR
  buffer[31] = 0x0A; // LF
  /*
  // SYSTEM ID 
  buffer[15] = 0x35; // 5 
  buffer[16] = 0x30; // 0 

  buffer[19] = 0x30; // 0 
  buffer[20] = 0x30; // 0 
  buffer[21] = 0x30; // 0 
 
  //

 

  // Receiver ID
  buffer[28] = 0x44;// D
  buffer[29] = 0x45; // E
  buffer[30] = 0x4C; // L
  buffer[31] = 0x54;  // T  
  buffer[32] = 0x41;  // A
  // END  Receiver ID

  buffer[33] = 0x7c; // |
  buffer[34] = 0x7c; // |
 */
  // Patient Information

 bufferPatient = new Buffer(12);
 bufferPatient[0] = 0x02;
 bufferPatient[1] = 0x32;
 bufferPatient[2] = 0x50;
 bufferPatient[3] = 0x7c;
 bufferPatient[4] = 0x31;
 bufferPatient[5] = 0x7c;
 bufferPatient[6] = 0x0D; // CR
 bufferPatient[7] = 0x03; // ETX
 bufferPatient[8] = 0x42; // B
 bufferPatient[9] = 0x42; // B
 bufferPatient[10] = 0x0D; // CR
 bufferPatient[11] = 0x0A; // LF

  //
 
// END Message Header 

// Patient Information 

// END Patient Information 

// Test Order
bufferOrder =  new Buffer(20);
bufferOrder[0] = 0x02;
bufferOrder[1] = 0x33; // LF
bufferOrder[2] = 0x4F; // LF
bufferOrder[3] = 0x7C; // LF
bufferOrder[4] = 0x31; // LF
bufferOrder[5] = 0x7C; // LF
bufferOrder[6] = 0x53; // LF
bufferOrder[7] = 0x50; // LF
bufferOrder[8] = 0x45; // LF
bufferOrder[9] = 0x43; // LF
bufferOrder[10] = 0x31; // LF

bufferOrder[11] = 0x32; // LF
bufferOrder[12] = 0x33; // LF
bufferOrder[13] = 0x34; // LF
// bufferOrder[14] = 0x7C; // LF
// bufferOrder[15] = 0x7C; // LF
// bufferOrder[16] = 0x5E; // LF
// bufferOrder[17] = 0x5E; // LF
// bufferOrder[18] = 0x46; // LF
// bufferOrder[19] = 0x65; // LF
// bufferOrder[20] = 0x72; // LF
// bufferOrder[21] = 0x72; // LF
// bufferOrder[22] = 0x69; // LF
// bufferOrder[23] = 0x74; // LF
// bufferOrder[24] = 0x69; // LF
// bufferOrder[25] = 0x6E; // LF
bufferOrder[14] = 0x0D; // CR
bufferOrder[15] = 0x03; // ETX
bufferOrder[16] = 0x42; // 0
bufferOrder[17] = 0x30; // 5
bufferOrder[18] = 0x0D; // CR
bufferOrder[19] = 0x0A; // LF
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

      counter++

    if(!sendBufferHeader){
      console.log('send header message')
      myPort.write(buffer,"ascii");
      sendBufferHeader = true
    }
    if(!sendPatientInfo && counter > 1 ){
      myPort.write(bufferPatient,'ascii')
      console.log('send patient info')
      sendPatientInfo = true
    }

    if(!sendBufferOrder && counter > 2 ){
      myPort.write(bufferOrder,'ascii')
      console.log('send patient info')
      sendBufferOrder = true
    }
   if(counter >= 3){
    myPort.write(EOT_BUFFER,'ascii')
    console.log('send EOT')
   }
  }
  console.log('str.charCodeAt(0)',str.charCodeAt(0))
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
            if(char.charCodeAt(0) === NAK && counter < 4){
              //myPort.write(buffer,"ascii");
              counter++
            }
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
