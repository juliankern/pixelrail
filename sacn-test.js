// const dns = require('dns');

// dns.lookup('wled-pixelrail.local', function(err, result) {
  // console.log('wled-pixelrail.local', result)
  
  const ACNSender = require('stagehack-sACN').Sender;
  
  ACNSender.Start({
    // interfaces: [sender.getPossibleInterfaces()[1]]
    source: 'SACN TEST'
  });
  
  
  var sender = new ACNSender.Universe(1, 1);
  // console.log('INTERFÄZES', sender.getPossibleInterfaces())
  
  sender.on("ready", function(){
    console.log('READY', sender.toString())
      // send as an array
    this.send([255, 0, 0, 255]);
  
    // or send as key-value pairs
    this.send({
      1: 255,
      4: 255,
      7: 255
    });
    console.log('READY22222', sender.toString())
  });

// })
