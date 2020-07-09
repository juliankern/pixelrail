const EventEmitter = require('events');

const PORT = 3030;

module.exports = class WebsocketAdapter extends EventEmitter {
    constructor() {
        super();

        const server = require('http').createServer();
        this.io = require('socket.io')(server);
        this.io.on('connection', client => {
            client.on('event', data => { /* … */ });
            client.on('disconnect', () => { /* … */ });
            
            client.on('data', (data) => this.emit('data', data));
            client.on('data-fade', (data) => this.emit('data-fade', data));
        });

        try {
            server.listen(PORT, () => {
                console.log(`[Websocket] listening on port ${PORT}`)
            });
        } catch(e) {
            console.error('[WEBSOCKET ERR]', e);
        }
    }
}