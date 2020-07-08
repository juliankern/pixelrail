const HomeKit = require('./HomeKit.class');

module.exports = class rgbLight extends HomeKit {
    constructor(device, { ledArray = [], startLed, ledCount, switchType = 'render' } = {}) {
        super(device);

        this.ledArray = ledArray;
        this.startLed = startLed;
        this.ledCount = ledCount;

        this.values = {
            h: 0,
            s: 0,
            l: 0,
            on: false
        };

        this.oldValues = {
            h: 0,
            s: 0,
            l: 0,
            on: false
        };

        // this.switchType = switchType;

        this.init();
    }

    init() {
        super.onBoth('On', (callback) => {
            // console.log('HK Get On:', this.values.on);
            callback(null, this.values.on);
        }, (value, callback) => {
            // console.log('HK Set On:', value);
            this.values.on = !!value;

            if (!this.values.on) {
                this.updatePixel(true);
            } else {
                this.updatePixel();
            }
            callback();
        });

        super.onBoth('Hue', (callback) => {
            // console.log('HK Get Hue:', this.values.h);
            callback(null, this.values.h);
        }, (value, callback) => {
            // console.log('HK Set Hue:', +value);
            this.values.h = +value;
            this.updatePixel(!this.values.on);
            callback();
        });

        super.onBoth('Saturation', (callback) => {
            // console.log('HK Get Saturation:', this.values.s);
            callback(null, this.values.s);
        }, (value, callback) => {
            // console.log('HK Set Saturation:', +value);
            this.values.s = +value;
            this.updatePixel(!this.values.on);
            callback();
        });

        super.onBoth('Brightness', (callback) => {
            // console.log('HK Get Brightness:', this.values.l);
            callback(null, this.values.l);
        }, (value, callback) => {
            // console.log('HK Set Brightness:', +value);
            this.values.l = +value;
            this.updatePixel(!this.values.on);
            callback();
        });

        super.publish();
    }

    updatePixel(zero) {
        const oldRgb = hsvToRgb(this.oldValues.h, this.oldValues.s, this.oldValues.l);
        let rgb = hsvToRgb(this.values.h, this.values.s, this.values.l);
        if (zero) rgb = { r: 0, g: 0, b: 0 };

        let pixel = [];

        if (this.ledArray.length) {
            this.ledArray.forEach(l => pixel.push(l));
        } else {
            for (let i = this.startLed; i < this.startLed + this.ledCount; i++) {
                pixel.push(i);
            }
        }

        super.emit(HomeKit.EVENTS.UPDATE_PIXEL, { pixel, rgb, oldRgb });

        this.oldValues = this.values;

        // data[this.channels.r] = zero ? 0 : rgb.r;
        // data[this.channels.g] = zero ? 0 : rgb.g;
        // data[this.channels.b] = zero ? 0 : rgb.b;

        // global.d2HK.DMX
        //     .set(data)
        //     [this.switchType]();
    }
}

function hsvToRgb(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;
     
    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
     
    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;
     
    if(s == 0) {
        // Achromatic (grey)
        r = g = b = v;

        return {
            r: Math.round(r * 255), 
            g: Math.round(g * 255), 
            b: Math.round(b * 255)
        };
    }
     
    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
     
    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
     
        case 1:
            r = q;
            g = v;
            b = p;
            break;
     
        case 2:
            r = p;
            g = v;
            b = t;
            break;
     
        case 3:
            r = p;
            g = q;
            b = v;
            break;
     
        case 4:
            r = t;
            g = p;
            b = v;
            break;
     
        default: // case 5:
            r = v;
            g = p;
            b = q;
    }

    return {
        r: Math.round(r * 255), 
        g: Math.round(g * 255), 
        b: Math.round(b * 255)
    };
}
