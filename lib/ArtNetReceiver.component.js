const EventEmitter = require('events');
const dmxlib = require('dmxnet');

let deviceCounter = 0;

module.exports = class HomeKitReceiver extends EventEmitter {
    constructor() {
        super();

        this.dmxnet = new dmxlib.dmxnet({
            sName: 'homekitPixelrail',
            lName: 'Pixelrail made for HomeKit',
            // listen: 6455,
        });

        this.receiver = this.dmxnet.newReceiver({
            subnet: 0,
            universe: 0,
            net: 0,
        });

        this.receiver.on('data', function (data) {
            console.log('artnet data!', data);
            super.emit('data', splitInChunks(data, 3))
        });
    }
}

function splitInChunks(arr, chunkSize) {
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize)
        R.push(arr.slice(i, i + chunkSize));
    return R;
}