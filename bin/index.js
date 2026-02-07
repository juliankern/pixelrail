const dgram = require('dgram');
const bonjour = require('bonjour')()

const LED_COUNT = 100;
const UPDATE_FPS = 20;

const dataPackage = Array.from({ length: LED_COUNT }, e => Array(3).fill(0));
let allOffFirst = false;
let wledAddress = 'wled-bett.local';
let wledName = 'wled-bett';

console.log()

function allLightsOff() {
    const ledsOffPackage = Array.from({ length: LED_COUNT * 3 }).fill(0);
    return dataPackage.flat().every((value, index) => value === ledsOffPackage[index])
}

if (process.argv[2] === 'test') {
    console.log(`TEST mode activated, sending random LED values at ${UPDATE_FPS}fps`);
} else {
    const HomeKitAdapter = require('../lib/Adapters/HomeKit');

    const hkAdapter = new HomeKitAdapter();

    hkAdapter.on('data', ({ pixel, rgb, oldRgb }) => {
        console.log('updatePixel triggered', pixel, oldRgb, rgb);

        colorFade(
            [oldRgb.r, oldRgb.g, oldRgb.b],
            [rgb.r, rgb.g, rgb.b],
            1000,
            ({ r, g, b }) => {
                // console.log('color fade', r,g,b);
                pixel.forEach(p => dataPackage[p] = [r, g, b]);

                if (r === 0 && g === 0 && b === 0) {
                    if (allLightsOff()) {
                        allOffFirst = true
                    }
                }
            }
        );
    });

}

const randomValue = (min, max) => Math.floor(Math.random() * (+max - +min)) + +min;

(async () => {
    initWLED();
})();


function initWLED() {
    let start = Date.now();
    const client = dgram.createSocket('udp4');

    // browse for all http services
    bonjour.find({ type: 'wled' }, function (service) {
        console.log('Found WLED service:', service)
        if (service.name === wledName) {
            console.log('selected service', service.host)
            wledAddress = service.addresses[0];
        }
    })

    setTimeout(() => {
        console.log('Using WLED address:', wledAddress);

        client.on('error', (err) => {
            console.log(`client error:\n${err.stack}`);
            client.close();
        });

        client.on('message', (msg, rinfo) => {
            console.log(`client got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        });

        sendDatastream();
    }, 1000 * 5)


    async function sendDatastream() {
        // console.log('send datastream...', Date.now() - start);
        start = Date.now();
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

        if (!allLightsOff() || allOffFirst) {
            const message = [2, 1, ...dataPackage]
            allOffFirst = false;

            client.send(Buffer.from(message.flat()), 21324, wledAddress, (err) => {
                if (err) console.error('ERROR', err)
            });
        } else {
            // console.log('sending nothing for now')
        }

        setTimeout(_ => {
            sendDatastream();
        }, 1000 / UPDATE_FPS);
    }
}

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

