
/*let { ResultParser } = require('./result-parser');

let parser = new ResultParser();
let stringSample = '2Q|1|^122451||ALL|||||||O493L|1|FFE';
let stringResult = '3R|1|^^^TSH^1|0.18|uIU/mL||N||F||||20111010113536';
let results = parser.parse(stringSample);
console.log(results.testResultList[0])*/

let { TestOrder } = require('./setMessageTestOrder');
let objOrder = new TestOrder();
console.log(objOrder.setTestOrderMessage(123455,'COV2G'))