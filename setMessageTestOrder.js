class TestOrder{



 buf2hex(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  }
  

setTestOrderMessage(id,code){
    let  {checksum}  = require('./checksumSerial');
    let objCheck = new checksum();

    const defultLength = 17
    let sampleId = id.toString().split('')
    let testCode = code.toString().split('')
    let l1 = sampleId.length
    let l2 = testCode.length
    let bufferLength = defultLength+l1+l2
    let bufferString
    let bufferOrder =  new Buffer(bufferLength);
    let counterSample = 0
    let counterCode = 0
    let length = bufferOrder.length
    let stopInsert = false
    let stopInsertTwo = false
    let c1Set = false
    let c2Set = false
    let cSum
    bufferOrder[0] = 0x02;
    bufferOrder[1] = 0x33; // LF
    bufferOrder[2] = 0x4F; // LF
    bufferOrder[3] = 0x7C; // LF  //3O|1|
    bufferOrder[4] = 0x31; // LF
    bufferOrder[5] = 0x7C; // LF
  
    
    
    for(let i = 0;i < length;i++){
        if(i>=6 && counterSample < l1){
            bufferOrder[i] = "0x" + sampleId[counterSample].charCodeAt(0).toString(16)
            counterSample++
        }
        if(i>=6+l1  && !stopInsert){
            bufferOrder[i] = 0x7C; // LF // 
            bufferOrder[i+1] = 0x7C; // LF  ||^^^
            bufferOrder[i+2] = 0x5E; // LF
            bufferOrder[i+3] = 0x5E; // LF
            bufferOrder[i+4] = 0x5E; // LF //
            stopInsert = true
        }
        if( i < length-6 && i>=6+l1+5 && counterCode<l2){
            bufferOrder[i] = "0x" + testCode[counterCode].charCodeAt(0).toString(16)
            counterCode++
        }
        if(i>6+l1+5+l2 && !stopInsertTwo){
            bufferOrder[i-1] = 0x0D; // CR
            bufferOrder[i] = 0x03; // ETX
            bufferOrder[i+3] = 0x0D; // CR
            bufferOrder[i+4] = 0x0A; // LF
            stopInsertTwo = true
        }
        if(i < length-2 && i>=6+l1+5+l2+2 && !c1Set && stopInsertTwo && stopInsert){
            bufferString  = this.buf2hex(bufferOrder).toString().slice(2,-12)
            cSum = objCheck.checksum8Mod(bufferString);
            bufferOrder[i] = '0x'+cSum.c2.charCodeAt(0).toString(16)
            c1Set =  true
        }
        if(i < length-2 && i>=6+l1+5+l2+3 && !c2Set && stopInsertTwo && stopInsert){
            bufferString  = this.buf2hex(bufferOrder).toString().slice(2,-12)
            cSum = objCheck.checksum8Mod(bufferString);
            bufferOrder[i] = '0x'+cSum.c1.charCodeAt(0).toString(16)
            c2Set =  true
        }
    
    }
    return bufferOrder
  }



}

exports.TestOrder = TestOrder;

