const EventEmitter = require('events');

const HomeKit = require('./homekit');
const storageAdapter = require('./storage');
let storage

const START_PORT = 52000;

module.exports = class HomeKitClass extends EventEmitter {
    /**
     * SmartNodeHomeKit contructor
     *
     * @author Julian Kern <mail@juliankern.com>
     *
     * @param  {object} data holds the data needed to init the plugin
     */
    constructor() {
        super();
    }

    async init({
        id,
        deviceName,
        model,
        service,
        serial = 'A2000001',
        manufacturer = 'juliankern.com',
    }) {
        storage = await storageAdapter()

        this.options = {
            id,
            model,
            serial
        };

        console.log('homekit device inited', deviceName, this.options);

        const uuid = HomeKit.uuid.generate(`homekit:${model}:${deviceName}:${serial}`);
        this.accessory = new HomeKit.Accessory(deviceName, uuid);

        this.accessory.getService(HomeKit.Service.AccessoryInformation)
            .setCharacteristic(HomeKit.Characteristic.Manufacturer, manufacturer)
            .setCharacteristic(HomeKit.Characteristic.Model, model)
            .setCharacteristic(HomeKit.Characteristic.SerialNumber, serial);

        this.service = service;
        this.accessory.addService(HomeKit.Service[service], deviceName);
        this.deviceName = deviceName;

        this.Characteristic = HomeKit.Characteristic;

        this.timer = {};
    }

    onIdentify(callback) {
        this.accessory.on('identify', callback);
    }

    _on(method, onCharacteristic, classCallback) {
        console.log('add listener for', method, onCharacteristic)

        this.accessory.getService(HomeKit.Service[this.service])
            .getCharacteristic(HomeKit.Characteristic[onCharacteristic])
            // .on(method, callback);
            .on(method, function (value, callback) {
                if (!callback) {
                    callback = value;
                }

                classCallback(value, callback);
            });
    }

    onBoth(characteristic, getCallback, setCallback) {
        this._on('get', characteristic, getCallback);
        this._on('set', characteristic, setCallback);
    }

    set(characteristic, value) {
        this.accessory.getService(HomeKit.Service[this.service])
            .setCharacteristic(HomeKit.Characteristic[characteristic], value);
    }

    async publish(properties) {
        let needsSave = false
        if (!properties) {
            if (!await storage.getItem(`${this.options.id}.${this.options.model}.${this.options.serial}`)) {
                properties = generateHomekitProperties(this.options.port);
                console.log('publish: couldnt find save, generating new HK properties for', this.deviceName, properties)
                needsSave = true
            } else {
                properties = await storage.getItem(`${this.options.id}.${this.options.model}.${this.options.serial}`);
                console.log('publish: found saved HK properties for', this.deviceName, properties)
            }
        }

        this.properties = properties;

        findPort(START_PORT, async (port) => {
            this.properties.port = port;
            console.log('Publishing HomeKit device with properties', this.deviceName, this.properties);

            if (needsSave) {
                await storage.setItem(`${this.options.id}.${this.options.model}.${this.options.serial}`, this.properties);
            }

            this.accessory.publish(this.properties);
        });
    }

    destroy() {
        this.accessory.destroy();
    }

    static get Characteristic() {
        return HomeKit.Characteristic;
    }

    static get EVENTS() {
        return {
            UPDATE_PIXEL: 'updatePixel',
        };
    }
};

function _randomLetterAtoF() {
    return ['A', 'B', 'C', 'D', 'E', 'F'][randomInt(0, 5)];
}

function findPort(start, cb) {
    var port = start
    start += 1

    var server = require('http').createServer()
    server.listen(port, function (err) {
        server.once('close', function () {
            cb(port)
        })
        server.close()
    })
    server.on('error', function (err) {
        findPort(start, cb)
    })
}

function generateHomekitProperties() {
    let pincode = '131-45-154';
    let username = '{l}{l}:{i}{i}:{i}{l}:{l}{i}:{l}{l}:{l}{i}'
        .replace(/{i}/g, () => { return randomInt(1, 6); })
        .replace(/{l}/g, () => { return _randomLetterAtoF(); });

    return {
        username,
        pincode
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * ((max - min) + 1)) + min;
}
