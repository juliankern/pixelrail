const EventEmitter = require('events');

const HomeKit = require('./homekit');
const storage = require('node-persist');
storage.initSync();

const START_PORT = 51880;

module.exports = class HomeKitClass extends EventEmitter {
    /**
     * SmartNodeHomeKit contructor
     *
     * @author Julian Kern <mail@juliankern.com>
     *
     * @param  {object} data holds the data needed to init the plugin
     */
    constructor({
        id,
        deviceName,
        model,
        service,
        serial = 'A1000001',
        manufacturer = 'juliankern.com',
    }) {
        super();

        this.options = {
            id,
            model,
            serial
        };

        console.log('homekit device inited', this.options);

        const uuid = HomeKit.uuid.generate(`homekit:${model}:${deviceName}:${serial}`);
        this.accessory = new HomeKit.Accessory(deviceName, uuid);

        this.accessory.getService(HomeKit.Service.AccessoryInformation)
            .setCharacteristic(HomeKit.Characteristic.Manufacturer, manufacturer)
            .setCharacteristic(HomeKit.Characteristic.Model, model)
            .setCharacteristic(HomeKit.Characteristic.SerialNumber, serial);

        this.service = service;
        this.accessory.addService(HomeKit.Service[service], deviceName);

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

    publish(properties) {
        if (!properties) {
            if (!storage.getItemSync(`${this.options.id}.${this.options.model}.${this.options.serial}`)) {
                properties = generateHomekitProperties(this.options.port);
            } else {
                properties = storage.getItemSync(`${this.options.id}.${this.options.model}.${this.options.serial}`);
            }
        }

        this.properties = properties;

        findPort(START_PORT, (port) => {
            this.properties.port = port;
            console.log('Publishing HomeKit device with properties', this.properties);
            
            this.accessory.on('identify', (paired, callback) => {
                console.log('identify!', paired);
                if (paired) storage.setItemSync(`${this.options.id}.${this.options.model}.${this.options.serial}`, this.properties);
                callback(null, true);
            });
            
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

function findPort (start, cb) {
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
        .replace(/{i}/g, () => { return randomInt(1,6); })
        .replace(/{l}/g, () => { return _randomLetterAtoF(); });

    return {
        username,
        pincode
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * ((max - min) + 1)) + min;
}
