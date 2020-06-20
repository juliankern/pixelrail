const EventEmitter = require('events');
const HomeKit = require('./HomeKit.class');
const HKDeviceHandler = require('./rgb.class');

let deviceCounter = 0;

module.exports = class HomeKitReceiver extends EventEmitter {
    constructor() {
        super();

        this.hkDevices = [
            _createDevice({
                ledArray: [0, 2, 4, 6, 8, 10],
                // switchType: d.switchType || 'render'
            }),
            _createDevice({
                ledArray: [1, 3, 5, 7, 9, 11],
                // startLed: 6,
                // ledCount: 6,
                // switchType: d.switchType || 'render'
            })
        ];

        this.hkDevices.forEach(device =>
            device.on(HomeKit.EVENTS.UPDATE_PIXEL, (data) => super.emit('data', data))
        )
    }
}

function _createDevice(config) {
    deviceCounter++;

    return new HKDeviceHandler({
        id: 'homekitPixelrail',
        deviceName: `Pixeltest${deviceCounter}`,
        model: 'Pixelrail',
        service: 'Lightbulb',
        serial: `A100000${deviceCounter}`,
    }, config);
}