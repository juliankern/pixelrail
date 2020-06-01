const Datastream = require('./lib/Datastream.class');

const LED_COUNT = 150;
const UPDATE_FPS = 30;
const dataPackage = Array.from({ length: LED_COUNT }, e => Array(3).fill(0));
// const dataPackage = Array.from({ length: LED_COUNT }, e => Array(4).fill(0));
// dataPackage.forEach((arr, i) => arr[0] = i);

if (process.argv[2] === 'test') {
    console.log(`TEST mode activated, sending random LED values at ${UPDATE_FPS}fps`);
}

if (process.argv[2] !== 'test') {
    const HomeKit = require('./lib/HomeKit.class');
    const HKDeviceHandler = require('./lib/rgb.class');
    
    let HKDevices = [
        new HKDeviceHandler({
            id: 'homekitPixelrail',
            deviceName: `Pixeltest`,
            model: 'Pixelrail',
            service: 'Lightbulb',
            serial: 'A1000001',
        }, {
            startLed: 0,
            ledCount: 6,
            // switchType: d.switchType || 'render'
        }),
        new HKDeviceHandler({
            id: 'homekitPixelrail',
            deviceName: `Pixeltest2`,
            model: 'Pixelrail',
            service: 'Lightbulb',
            serial: 'A1000002',
        }, {
            startLed: 6,
            ledCount: 6,
            // switchType: d.switchType || 'render'
        })
    ];

    HKDevices.forEach(device =>
        device.on(HomeKit.EVENTS.UPDATE_PIXEL, ({pixel, r, g, b}) => {
            console.log('updatePixel triggered', pixel, r,g,b);
            pixel.forEach(i => {
                const oldRGB =[
                    dataPackage[i][0],
                    dataPackage[i][1],
                    dataPackage[i][2]
                ];
                // dataPackage[i] = [r,g,b];
                colorFade(oldRGB, [r,g,b], 1000, ({ r, g, b }) => {
                    // console.log('color fade', r,g,b);
                    dataPackage[i] = [
                        // i, 
                        r, g, b
                    ];
                });
            });
        })
    )
}

const stream = new Datastream();
stream.on(Datastream.EVENTS.CONNECTION_OPEN, _ => {
    console.log('open! sending data...');
    sendDatastream();
    stream.start();
})


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

    stream.setData(dataPackage);

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
        callback({r,g,b});
        u += step_u;
    }, interval);
}

function lerp (a, b, u) {
    return (1 - u) * a + u * b;
}