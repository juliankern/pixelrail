const { ArtNet } = require('artnode');

const artnet = new ArtNet({ isController: true });

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