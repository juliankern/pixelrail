var dgram = require('dgram');

var client = dgram.createSocket('udp4');

const message = [
  2,
  1,
  [
    255,
    0,
    0
  ],
  [
    255,
    0,
    0
  ],
  [
    255,
    0,
    0
  ],
]

client.send(Buffer.from(message.flat(Infinity)), 21324, 'wled-pixelrail.local', function(err, bytes) {
	client.close();
});
