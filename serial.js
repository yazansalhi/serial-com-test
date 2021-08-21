let SerialPort = require('serialport');     // include the serialport library
let	portName =  process.argv[2];            // get the port name from the command line

let { ResultParser } = require('./result-parser');
let parsResult = new ResultParser();

let  {checksum}  = require('./checksumSerial');
let objCheck = new checksum();

let { TestOrder } = require('./setMessageTestOrder');
let objOrder = new TestOrder();

// results = objCheck.checksum8Mod('123');

const ENQ_BUFFER = new Buffer([5]);
const EOT_BUFFER =new Buffer([4]);
const EOT = 4;
const ACK = 6;


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
buffer[10] = 0x68;// h
buffer[11] = 0x6f; // o
buffer[12] = 0x73; // r
buffer[13] = 0x74;  // t  
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
// END Message Header 

let requestRecord
let resultRecord
let sampleId
let results
let measurementResult
let unitResult
let testCode

let isSendToSerial = false
let counter = 0;
let sendBufferHeader = false
let sendBufferOrder = false

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
    }

    function showError(error) {
        console.log('Serial port error: ' + error);
    }

    function showPortClose() {
        console.log('port closed.');
    }
      

    function readSerialData(data) {
        console.log('reading data ..');

        let char = ''
        let str = data.toString('ascii');

        if (str.length === 0) return;

        if (str.length > 2){

            char = str.charAt(2)

           if(char === 'Q'){
                 requestRecord = str
                 results = parsResult.parse(requestRecord);
                 sampleId = results.testResultList[0].sampleId

                 console.log('send to blazma sampleId ..',sampleId)

                 //API POST TAKE sampleId  to blazma
                 // testCode = response
                 
                 /*axios.post('blazmaUrl', {
                    sample_id: sampleId
                  })
                  .then(function (response) {
                    console.log(response);
                    testCode = response.data.data.test_code
                  })   
                  .catch(function (error) {
                    console.log(error);
                  });*/

                 //
            }
            else if(char === 'R'){
                resultRecord = str
                results = parsResult.parse(resultRecord);
                measurementResult = results.testResultList[0].measurementResult
                unitResult = results.testResultList[0].unit

                console.log('measurementResult',measurementResult)
                console.log('unitResult',unitResult)

                //API POST TAKE measurementResult and unitResult to blazma
                console.log('send to blazma ..',measurementResult,unitResult)
                /*axios.post('blazmaUrl', {
                   sample_result_measurement: measurementResult,
                   sample_result_unit:unitResult
                 })
                 .then(function (response) {
                   console.log(response);
                 })   
                 .catch(function (error) {
                   console.log(error);
                 });*/
                //
            }

        }

        if (str.charCodeAt(0) === EOT && !isSendToSerial) {
             isSendToSerial = true
             sendSerialData();
        }

        // JUST FOR READ AFTER WRITE 
        if (str.charCodeAt(0) === ACK && isSendToSerial) {

                counter++

            if(!sendBufferHeader){
                console.log('send buffer header ')
                myPort.write(buffer,"ascii");
                sendBufferHeader = true
            }
            if(!sendBufferOrder && counter > 1){

              //  bufferOrder = objOrder.setTestOrderMessage(sampleId,testCode)
                bufferOrder = objOrder.setTestOrderMessage(123455,'COV2G')
                myPort.write(bufferOrder,'ascii')
                console.log('send order info')
                sendBufferOrder = true
            }
            if(counter == 3){
                myPort.write(EOT_BUFFER,'ascii')
                console.log('send EOT')
            }

        }
    }

    function sendSerialData(){
        console.log('sending data .. to machine');
        myPort.write(ENQ_BUFFER,'ascii');
    }