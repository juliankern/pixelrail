const EventEmitter = require('events');

const SerialPort = require('serialport');

const defaultPort = '/dev/tty.usbserial-1450';
const defaultConfig = {
    serialport: {
        baudRate: 2000000,
        // databits: 8,
        // parity: 'none'
    },
    chunkSize: 5,
    ledCount: 150,
};

const SIGNAL_READY = '1';

const EVENTS = {
    CONNECTION_OPEN: 'open',
};

let starttime;

module.exports = class Datastream extends EventEmitter {
    constructor(port, config = {}) {
        super();

        this.dataToBeSent = [];
        this.config = Object.assign(defaultConfig, config);
        this.serialport = new SerialPort(defaultPort, defaultConfig.serialport, function (err) {
            if (err) {
                return console.log('Error: ', err)
            }
        });

        let open = false;

        const that = this;
        this.serialport.on('data', function (data) {

            console.log(data.toString().split(/\r?\n/));

            if (!open) {
                open = true;

                return that.emit(EVENTS.CONNECTION_OPEN);
            }

            that.onSerialData(data);
        });
    }

    onSerialData(data) {
        // console.log('onSerialData', data.toString());
        if (data.toString().split(/\r?\n/).includes(SIGNAL_READY)) {
            // console.log('got ready');
            this._sendNextChunk();
            // if (this._readyTimeout) clearTimeout(this._readyTimeout);
            // this._readyTimeout = setTimeout(_ => this._sendNextChunk(), 1000);
        }
    }

    start() {
        // console.log('start stream');
        if (this.started) {
            return console.error('Already started stream');
        }

        this.started = true;

        this._sendNextChunk();
    }

    stop() {
        this.started = false;
    }

    setData(data) {
        this.nextDataToBeSent = splitInChunks(data, this.config.chunkSize);
        // this.dataToBeSent = [];
        // this.setControlSignal(1);
        this.started = false;
        this.serialport.close(_ => {
            this.serialport.open(_ => {
                this.started = true;
            });
        });
        console.log('setData');
        // if (!this.dataToBeSent.length) this._sendNextChunk();
    }

    setControlSignal(signal) {
        this.nextControlSignal = signal;
    }

    _sendNextChunk() {
        if (!this.started) return;
        // console.log('send next chunk...', this.dataToBeSent.length);
        
        if (!this.dataToBeSent.length) {
            // if (!this.nextDataToBeSent.length) return;
            // console.log('done in ms:', Date.now() - starttime);
            starttime = Date.now();
            this.dataToBeSent = [...this.nextDataToBeSent];
            // console.log('...no current chunks...', this.dataToBeSent.length);
            // this.nextDataToBeSent = [];
        }

        const nextChunk = this.dataToBeSent.shift();
        // nextChunk.forEach(_ => _.unshift(0));
        
        // if (this.nextControlSignal) {
        //     nextChunk[0][0] = this.nextControlSignal;
        //     this.nextControlSignal = null;
        // }

        if (nextChunk[0][0] === 0) {
            // console.log('this.dataToBeSent', nextChunk);
        }

        // console.log('sending data...', this.dataToBeSent.length)

        this._serialSend(nextChunk.flat());
    }

    _serialSend(data) {
        // console.log('Sending data:');
        // console.log(data.length);
        // console.log('');
        // sendtime = Date.now();
        this.serialport.write(data);
    }
}
module.exports.EVENTS = EVENTS;

function splitInChunks(arr, chunkSize) {
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize)
        R.push(arr.slice(i, i + chunkSize));
    return R;
}