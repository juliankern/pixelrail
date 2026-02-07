const storage = require('node-persist');
const path = require('path');

let storageLaunched = false

module.exports = async () => {
    if (!storageLaunched) {
        const storagecfg = await storage.init({
            dir: path.join(__dirname, '../persist/storage'),
        });

        console.log('launch new storage, config:', storagecfg)
        storageLaunched = true
    }

    return storage
}