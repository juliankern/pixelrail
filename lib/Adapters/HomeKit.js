const EventEmitter = require('events');
const HomeKit = require('../HomeKit.class');
const HKDeviceHandler = require('../rgb.class');

let deviceCounter = 0;

module.exports = class HomeKitAdapter extends EventEmitter {
    constructor() {
        super();

        this.hkDevices = [];

        /* for (let i = 0; i < 30; i++) {
            this.hkDevices.push(_createDevice({
                startLed: i * 10,
                ledCount: 10,
                // switchType: d.switchType || 'render'
            }));
        } */

        this.hkDevices.push(_createDevice({ startLed: 0, ledCount: 8, name: 'links' }))
        this.hkDevices.push(_createDevice({ startLed: 8, ledCount: 43, name: 'oben' }))
        this.hkDevices.push(_createDevice({ startLed: 51, ledCount: 8, name: 'rechts' }))
        this.hkDevices.push(_createDevice({ startLed: 59, ledCount: 8, name: 'NachtR' }))
        this.hkDevices.push(_createDevice({ startLed: 67, ledCount: 12, name: 'innenR' }))
        this.hkDevices.push(_createDevice({ startLed: 79, ledCount: 12, name: 'innenL' }))
        this.hkDevices.push(_createDevice({ startLed: 91, ledCount: 8, name: 'NachtL' }))

        this.hkDevices.forEach(device => device.on(HomeKit.EVENTS.UPDATE_PIXEL, (data) => super.emit('data', data)))
    }
}

function _createDevice(config) {
    deviceCounter++;

    return new HKDeviceHandler({
        id: 'homekitPixelbett',
        deviceName: `Bett ${config.name}`,
        model: 'Pixelbett',
        service: 'Lightbulb',
        serial: `A200001${deviceCounter}`,
    }, config);
}
