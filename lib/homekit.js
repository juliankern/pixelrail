let HomeKit;

try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies, import/no-unresolved
    HomeKit = require('hap-nodejs');
    HomeKit.init();
    console.log('> real HomeKit loaded');
} catch (e) {
    console.log('> HomeKit fake loaded');

    HomeKit = new HKFake();
}

module.exports = HomeKit;

function HKFake() {
    const functions = {
        on: () => { },
        addService: () => functions,
        getService: () => functions,
        setCharacteristic: () => functions,
        getCharacteristic: () => functions,
        publish: () => functions,
        destroy: () => functions,
    };

    this.uuid = { generate: () => 1 };
    this.Accessory = class Accessory {
        constructor() {
            Object.assign(this, functions);
        }
    };

    this.AccessoryEventTypes = {
        ["IDENTIFY"]: "identify",
        ["LISTENING"]: "listening",
        ["SERVICE_CONFIGURATION_CHANGE"]: "service-configurationChange",
        ["SERVICE_CHARACTERISTIC_CHANGE"]: "service-characteristic-change",
        ["PAIRED"]: "paired",
        ["UNPAIRED"]: "unpaired",
    }

    this.Service = {};
    this.Characteristic = {
        TemperatureDisplayUnits: {
            CELSIUS: 0,
            FAHRENHEIT: 1,
        },
        TargetHeatingCoolingState: {
            OFF: 0,
            HEAT: 1,
            COOL: 2,
            AUTO: 3,
        },
        CurrentHeatingCoolingState: {
            OFF: 0,
            HEAT: 1,
            COOL: 2,
        },
    };
}
