const EventEmitter = require('events');
const gameloop = require('node-gameloop');

const PORT = 3030;
let id;
let tick = 0;

module.exports = class WebsocketAdapter extends EventEmitter {
    constructor() {
        super();

        const server = require('http').createServer();
        this.io = require('socket.io')(server, { 
            cors: {
                origin: '*',
                methods: ["GET", "POST"],
            },
        });
        this.io.on('connection', client => {
            console.log('Client connected!');

            client.on('event', data => { /* … */ });
            client.on('disconnect', () => { /* … */ });

            client.on('data', (data) => this.emit('data', data));
            client.on('data-fade', (data) => this.emit('data-fade', data));
            
            client.on('test', (data) => {
		console.log('called event test!');
                tick = 0;
                id = gameloop.setGameLoop((delta) => {
                    // `delta` is the delta time from the last frame
                    // console.log('Hi there! (frame=%s, delta=%s)', frameCount++, delta);
                    testSequence.call(this, tick % 150);
                    tick++;
                }, 1000 / 30);
            });

            client.on('stop', (data) => {
		console.log('called event STOP!');
                gameloop.clearGameLoop(id);
            });
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

function black() {
  return Array(300).fill(1).map(_ => [0, 0, 0])
}

function testSequence(tick) {
    // console.log('DELTAAA', delta);
    const data = black.call(this)

    // console.log('testSequence tick', tick)

    if (data[tick - 1]) {
        data[tick - 1][2] = 125
        data[tick - 1 + 150][2] = 125
    }

    data[tick][2] = 255
    data[tick + 150][2] = 255

    if (data[tick + 1 + 150]) {
        data[tick + 1][2] = 125
        data[tick + 1 + 150][2] = 125
    }

    this.emit('data', data)
}
