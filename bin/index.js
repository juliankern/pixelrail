const Datastream = require('../lib/Datastream.class');
const SerialPort = require('serialport');
// const { init } = require('hap-nodejs');

const LED_COUNT = 300;
const UPDATE_FPS = 30;

const dataPackage = Array.from({ length: LED_COUNT }, e => Array(3).fill(0));

// const dataPackage = Array.from({ length: LED_COUNT }, e => Array(4).fill(0));
// dataPackage.forEach((arr, i) => arr[0] = i);

if (process.argv[2] === 'test') {
    console.log(`TEST mode activated, sending random LED values at ${UPDATE_FPS}fps`);
} else if (process.argv[2] === 'list') {
    return (async () => {
        console.log(await SerialPort.list());
    })();
} else {
    const HomeKitAdapter = require('../lib/Adapters/HomeKit');
    // const ArtNetAdapter = require('../lib/Adapters/ArtNet');
    const WebsocketAdapter = require('../lib/Adapters/Websocket');

    const hkAdapter = new HomeKitAdapter();
    // const anAdapter = new ArtNetAdapter();
    const wsAdapter = new WebsocketAdapter();

    hkAdapter.on('data', ({ pixel, r, g, b }) => {
        console.log('updatePixel triggered', pixel, r, g, b);
        pixel.forEach(i => {
            const oldRGB = [
                dataPackage[i][0],
                dataPackage[i][1],
                dataPackage[i][2]
            ];
            // dataPackage[i] = [r,g,b];
            colorFade(oldRGB, [r, g, b], 1000, ({ r, g, b }) => {
                // console.log('color fade', r,g,b);
                dataPackage[i] = [r, g, b];
            });
        });
    });

    // anAdapter.on('data', (data) => {
    //     dataPackage.map((d, i) => data[i]);
    // });

    wsAdapter.on('data', (data) => {
        dataPackage.map((d, i) => data[i]);
    });

    wsAdapter.on('data-fade', (data) => {
        const oldData = [...dataPackage];

        dataPackage.forEach((pixel, i) => {
            colorFade(oldData[i], data[i], 1000, ({ r, g, b }) => {
                // console.log('color fade', i, [r,g,b]);
                dataPackage[i] = [r, g, b];
            });
        });
    });
}

let useablePorts = [];

(async () => {
    const availablePorts = await SerialPort.list();
    useablePorts = availablePorts.filter(_ => _.vendorId === '1a86');
    useablePorts.sort((a, b) => +a.locationId - +b.locationId);

    init();
})();


function init() {
    let openPorts = 0;

    useablePorts.forEach(port => {
        port.stream = new Datastream(port.path);
        
        port.stream.on(Datastream.EVENTS.CONNECTION_OPEN, _ => {
            console.log('open! sending data...');
            openPorts++;
            // port.stream.start();
            portOpened();
        });
    });

    function portOpened() {
        if (openPorts === useablePorts.length) {
            sendDatastream();
            useablePorts.forEach(_ => _.stream.start());
        }
    }
}

async function sendDatastream() {
    if (process.argv[2] === 'test') {
        for (let i = 0; i < LED_COUNT; i++) {
            dataPackage[i] = [
                // i,
                randomValue(0, 5) * 10,
                randomValue(0, 5) * 10,
                randomValue(0, 5) * 10
            ];
        }
    }

    const splitData = splitInChunks(dataPackage, useablePorts.length);

    useablePorts.forEach((port, i) => {
        port.stream.setData(splitData[i]);
    });

    starttime = Date.now();

    setTimeout(_ => {
        sendDatastream();
    }, 1000 / UPDATE_FPS);
}

async function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    })
}


const randomValue = (min, max) => Math.floor(Math.random() * (+max - +min)) + +min;


function colorFade(start, end, duration, callback) {
    var interval = 25;
    var steps = duration / interval;
    var step_u = 1.0 / steps;
    var u = 0.0;
    var theInterval = setInterval(function () {
        if (u >= 1.0) {
            clearInterval(theInterval);
        }
        var r = Math.round(lerp(start[0], end[0], u));
        var g = Math.round(lerp(start[1], end[1], u));
        var b = Math.round(lerp(start[2], end[2], u));
        callback({ r, g, b });
        u += step_u;
    }, interval);
}

function lerp(a, b, u) {
    return (1 - u) * a + u * b;
}

function splitInChunks(arr, chunkSize) {
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize)
        R.push(arr.slice(i, i + chunkSize));
    return R;
}