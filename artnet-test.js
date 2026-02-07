const { ArtNet } = require('artnode');

const artnet = new ArtNet({ isController: true });

artnet.on('device', (device) => {
    console.log(`New device: ${device.shortName} @ ${device.ip}`);
});

artnet.on('deviceOffline', (device) => {
    console.log(`Device ${device.shortName} @ ${device.ip} went offline.`);
});

const universe = artnet.getUniverse(1);

universe.on('data', ({ data, changed }) => {
    changed.forEach(({ address, value }) => {
        console.log(`DMX ${address} set to ${value}.`);
    });

    data.forEach((value, address) => {
        console.log(`DMX ${address} is ${value}`);
    });
});

artnet.start();
