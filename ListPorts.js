let serialport = require('serialport');
console.log(serialport.list())

// list serial ports:
serialport.list().then (
  ports => ports.forEach(port =>console.log(port.path)),
  err => console.log(err)
)