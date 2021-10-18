let SerialPort = require("serialport"); // include the serialport library
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout')
let { ResultParser } = require("./result-parser");
//let { TestOrder } = require("./setMessageTestOrder");
let { TestOrder } = require('./testorder');
const axios = require('axios');

let portName = process.argv[2]; // get the port name from the command line
let parsResult = new ResultParser();
let objOrder = new TestOrder();

const ENQ_BUFFER = new Buffer([5]);
const ACK_BUFFER = new Buffer([6]);
const EOT_BUFFER =new Buffer([4]);

const EOT = 4;
const ACK = 6;
const NAK = 21;

let message = {
  RequestInformation: null,
  TestOrderInformation: null,
  ResultRecord: null,
};

let results;
let samples;
let sampleId;
let writeStep = 0;
let bufferOrder = null;
// Message Header buffer
// 1H|\^&|||ACCESS^500001|||||LIS||P|1|20111010131522
var buffer = new Buffer(37);
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
buffer[10] = 0x41; // A
buffer[11] = 0x43; // C
buffer[12] = 0x43; // C
buffer[13] = 0x45; // E
buffer[14] = 0x53; // S
buffer[15] = 0x53; // S
buffer[16] = 0x5e; // ^
buffer[17] = 0x35; // 5
buffer[18] = 0x30; // 0
buffer[19] = 0x30; // 0
buffer[20] = 0x30; // 0
buffer[21] = 0x30; // 0
buffer[22] = 0x31; // 1
buffer[23] = 0x7c; // |
buffer[24] = 0x7c; // |
buffer[25] = 0x7c; // |
buffer[26] = 0x7c; // |
buffer[27] = 0x7c; // |
buffer[28] = 0x4c; // L
buffer[29] = 0x49; // I
buffer[30] = 0x53; // S
/*buffer[31] = 0x7c; // |
buffer[32] = 0x7c; // |
buffer[33] = 0x50; // P
buffer[34] = 0x7c; // |
buffer[35] = 0x31; // 1
buffer[36] = 0x7c; // |
buffer[37] = 0x32; // 2
buffer[38] = 0x30; // 0
buffer[39] = 0x31; // 1
buffer[40] = 0x31; // 1
buffer[41] = 0x31; // 1
buffer[42] = 0x32; // 2
buffer[43] = 0x33; // 3
buffer[44] = 0x31; // 1
buffer[45] = 0x32; // 2
buffer[46] = 0x33; // 3
buffer[47] = 0x35; // 5
buffer[48] = 0x39; // 9
buffer[49] = 0x35; // 5
buffer[50] = 0x39; // 9*/
buffer[31] = 0x0d; // CR
buffer[32] = 0x03; // ETX
buffer[33] = 0x45; // E
buffer[34] = 0x33; // 3
buffer[35] = 0x0d; // CR
buffer[36] = 0x0a; // LF
// END Message Header

// Patient Information
bufferPatient = new Buffer(21);
bufferPatient[0] = 0x02;
bufferPatient[1] = 0x32;
bufferPatient[2] = 0x50;
bufferPatient[3] = 0x7c;
bufferPatient[4] = 0x31;
bufferPatient[5] = 0x7c;
bufferPatient[6] = 0x30;
bufferPatient[7] = 0x39;
bufferPatient[8] = 0x38;
bufferPatient[9] = 0x37;
bufferPatient[10] = 0x36;
bufferPatient[11] = 0x35;
bufferPatient[12] = 0x36;
bufferPatient[13] = 0x37;
bufferPatient[14] = 0x38;
bufferPatient[15] = 0x0d; // CR
bufferPatient[16] = 0x03; // ETX
bufferPatient[17] = 0x41; // B
bufferPatient[18] = 0x33; // B
bufferPatient[19] = 0x0d; // CR
bufferPatient[20] = 0x0a; // LF
// End Patient Information

// Message Terminator Record
terminatorBuffer = new Buffer(13);
terminatorBuffer[0] = 0x02;
terminatorBuffer[1] = 0x34;
terminatorBuffer[2] = 0x4c;
terminatorBuffer[3] = 0x7c;
terminatorBuffer[4] = 0x31;
terminatorBuffer[5] = 0x7c;
terminatorBuffer[6] = 0x46;
terminatorBuffer[7] = 0x0d; // CR
terminatorBuffer[8] = 0x03; // ETX
terminatorBuffer[9] = 0x46; // B
terminatorBuffer[10] = 0x46; // B
terminatorBuffer[11] = 0x0d; // CR
terminatorBuffer[12] = 0x0a; // LF
// Message Terminator Record

var myPort = new SerialPort(portName, {
  baudRate: 9600,
  databits: 8,
  parity: "none",
}); // open the port
//var Readline = SerialPort.parsers.Readline; // make instance of Readline parser
//var parser = new Readline();                // make a new parser to read ASCII lines
//myPort.pipe(parser);                        // pipe the serial stream to the parser

const parser = myPort.pipe(new InterByteTimeout({interval: 30}))

// these are the definitions for the serial events:
myPort.on("open", showPortOpen); // called when the serial port opens
myPort.on("close", showPortClose); // called when the serial port closes
myPort.on("error", showError); // called when there's an error with the serial port
parser.on("data", readSerialData); // called when there's new data incoming

// these are the functions called when the serial events occur:
function showPortOpen() {
  console.log("port open. Data rate: " + myPort.baudRate);
}


function showError(error) {
  console.log("Serial port error: " + error);
}

function showPortClose() {
  console.log("port closed.");
}

async function readSerialData(data) {
  console.log("reading data ..", data);

  let char = "";
  let str = data.toString("ascii");

  if (str.length === 0) return;

  if (str.length > 2) {
    char = str.charAt(2);

    if (char === "Q") {
      message.RequestInformation = str;
    }
    if (char === "O") {
      message.TestOrderInformation = str;
    }
    if (char === "R") {
      message.ResultRecord = str;
    }
  }

  if (str.charCodeAt(0) == EOT) {
    console.log("set message");
   await setMessage();
  } else if (str.charCodeAt(0) != ACK && str.charCodeAt(0) != NAK) {
    console.log("send ACK");
    myPort.write(ACK_BUFFER, "ascii");
  }else if (str.charCodeAt(0) == ACK){
    writeOnMachine(bufferOrder);
  }
}

async function setMessage() {
  console.log('message.RequestInformation',message)
  if (message.RequestInformation) {
    samples = parsResult.parse(message.RequestInformation);
    sampleId = samples.testResultList[0].sampleId;

   await sendSampleIdToBlazma(sampleId).then((testCode)=>{
 
        bufferOrder = objOrder.setTestOrderMessage(sampleId, testCode);
        writeOnMachine(bufferOrder);

    });
    
 
    

  } else if (message.ResultRecord && message.TestOrderInformation) {
    samples = parsResult.parse(message.TestOrderInformation);
    sampleId = samples.testResultList[0].sampleId;

    results = parsResult.parse(message.ResultRecord);
    let measurementResult = results.testResultList[0].measurementResult;
    let unitResult = results.testResultList[0].unit;

   sendResultsToBlazma(sampleId, measurementResult, unitResult);

    clearMessage()
  }
}

function sendResultsToBlazma(sampleId, measurementResult, unitResult) {
  //API POST TAKE sample id, measurementResult and unitResult to blazma
  console.log(
    "send results to blazma.. sampleId :" +
      sampleId +
      " measurementResult:" +
      measurementResult +
      " unitResult:" +
      unitResult
  );
  let profileId = 4;
  axios.post('https://staging.blazma.com/api/v1/terminal/'+profileId+'/samples/'+sampleId+'/result',{
            sample_result_measurement: measurementResult,
            sample_result_unit:unitResult
          },
          {
                headers: {'api-key': 'ce3a252deb3deaebb2ace5de1','profile-id':profileId}
          })
          .then(function (response) {
            console.log('response send result api ',response);
          })   
          .catch(function (error) {
            console.log('error',error.response.data);
          });
  //
}

async function sendSampleIdToBlazma(sampleId) {
  console.log("send sampleId to blazma.. sampleId:", sampleId);

  //API POST TAKE sampleId  to blazma
  let  testCode = '';
  let profileId = 4;
  testCode = await axios.get('https://staging.blazma.com/api/v1/terminal/'+profileId+'/samples/'+sampleId, {
                headers: {'api-key': 'ce3a252deb3deaebb2ace5de1','profile-id':profileId},
            })
       .then(function (response) {
         console.log('response',response.data.response.sample_code);
         testCode = response.data.response.sample_code
         return testCode;
       })  
       .catch(function (error) {
         console.log('error',error.response.data);
         return "COV2G";
       }); 
  return testCode;
}

function writeOnMachine(messageOrder) {
  console.log("write on machine");
  console.log(writeStep);
  switch(writeStep){
    case 0:writeStep++;myPort.write(ENQ_BUFFER, "ascii");break;
    case 1:writeStep++;myPort.write(buffer, "ascii");break;
    case 2:writeStep++;myPort.write(bufferPatient, "ascii");break;
    case 3:writeStep++;myPort.write(messageOrder, "ascii");break;
    case 4:writeStep++;myPort.write(terminatorBuffer, "ascii");break;
    case 5:clearMessage();myPort.write(EOT_BUFFER,'ascii');break;
  }
}

function clearMessage(){
    console.log('clear message')
    message = {
        RequestInformation: null,
        TestOrderInformation: null,
        ResultRecord: null,
      };
      bufferOrder = null;
      writeStep = 0;
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
