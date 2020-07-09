const EventEmitter = require('events');
const HomeKit = require('../HomeKit.class');
const HKDeviceHandler = require('../rgb.class');

let deviceCounter = 0;

module.exports = class HomeKitAdapter extends EventEmitter {
    constructor() {
        super();

        this.hkDevices = [];

        for (let i = 0; i < 30; i++) {
            this.hkDevices.push(_createDevice({
                startLed: i * 10,
                ledCount: 10,
                // switchType: d.switchType || 'render'
            }));
        }

        this.hkDevices.forEach(device =>
            device.on(HomeKit.EVENTS.UPDATE_PIXEL, (data) => super.emit('data', data))
        )
    }
}

function _createDevice(config) {
    deviceCounter++;

    return new HKDeviceHandler({
        id: 'homekitPixelrail',
        deviceName: `Pixel ${deviceCounter}`,
        model: 'Pixelrail',
        service: 'Lightbulb',
        serial: `A100000${deviceCounter}`,
    }, config);
}