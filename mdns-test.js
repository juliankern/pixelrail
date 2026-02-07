var bonjour = require('bonjour')()

// browse for all http services
bonjour.findOne({ type: 'wled2' }, function (service) {
    if (
        !service.name.includes('Pixel')
        && !service.type.includes('airplay')
        && !service.name.includes('LED')
        && !service.host.includes('zimmer')
    ) {
        console.log('Found an HTTP server:', service)
    }
})

// import the module
// const mdns = require('mdns');
 
// // watch all http servers
// const browser = mdns.createBrowser(mdns.udp('wled'));

// browser.on('serviceUp', service => {
//   console.log("service up: ", service);
// });
// browser.on('serviceDown', service => {
//   console.log("service down: ", service);
// });

// browser.start();

const dataPackage = Array.from({ length: 300 }, e => Array(3).fill(0));
const testVar = [2, 1, ...dataPackage]
console.log(testVar.flat());