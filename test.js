const { crc16kermit } = require('crc');


// Patient Information record // CRC-16-CCITT

// example let ascii = '2P|1|0987656789|||Smith^Tom^A^Jr.^Mr.||19631124|M|||||Jones'

const CRC16CCITT = crc16kermit(str).toString(16);
let x1 = CRC16CCITT.charAt(2).toUpperCase()
let x2 = CRC16CCITT.charAt(3).toUpperCase()
console.log('x1',x1)
console.log('x2',x2)
//

// Message Header record  & Test Order record  //  use CheckSum8Modulo25  function
// example let hex = '31487C5C5E267C7C7C4C49537C7C7C7C7C7C7C507C317C3230313131323331323335393539' 
// CheckSum8Modulo25(str)

function nextLetter(s){
    return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function(a){
        var c= a.charCodeAt(0);
        switch(c){
            case 90: return 'A';
            case 122: return 'a';
            default: return String.fromCharCode(++c);
        }
    });
}

function CheckSum8Modulo25(hexstring) {
     var s = hexstring.match(/../g); var sum = 0;
     s.forEach(function (hexbyte) { 
        var n = 1 * ('0x' + hexbyte);  sum += n; 
        }); sum = (sum & 255).toString(16);
        if (sum.length % 2) sum = '0' + sum; return sum; 
    }

    let firstValue = CheckSum8Modulo25('31487C5C5E267C7C7C4C49537C7C7C7C7C7C7C507C317C3230313131323331323335393539').charAt(0)
    let secondValue = CheckSum8Modulo25('31487C5C5E267C7C7C4C49537C7C7C7C7C7C7C507C317C3230313131323331323335393539').charAt(1)

    let c1 = (/[a-zA-Z]/).test(firstValue)
    let c2 = (/[a-zA-Z]/).test(secondValue)
    let sum = 0 

    if(!c1 && !c2){
        sum = parseInt(firstValue)+parseInt(secondValue) + 10
        sum = sum.toString();
        c1 = sum.charAt(1)
        c2 =  sum.charAt(0)
    }else{
        if(nextLetter(firstValue) == 'g'){
            c1 = 0
            c2 = nextLetter(secondValue).toUpperCase()
        }else{
            c1 = nextLetter(firstValue).toUpperCase()
            c2 = secondValue.toUpperCase()
        }
    }
    console.log('c1',c1)
    console.log('c2',c2)

//






 