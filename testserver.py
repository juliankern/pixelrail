import eventlet
import socketio
import serial
import numpy
import time
from serial.tools import list_ports
from queue import Queue
from threading import Thread

defaultPort = '/dev/tty.usbserial-1430'
baudRate = 1000000

io = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(io)
serialport = serial.Serial(defaultPort, baudRate)

serialmessage = ''
activePatterns = []


def waitForSerial(returndata):
    serialmessage = ''
    # start = time.time()
    while (serialmessage == ''):
        # time.sleep(0.1)
        tmpmessage = serialport.readline()
        if (tmpmessage and tmpmessage == b'1\r\n'):
            serialmessage = tmpmessage
            # print('received message NOW:', serialmessage)
            # print('done with everything in s:', time.time() - start)
            # print('current fps: ', round(1/(time.time() - start)))
            # io.emit('state', returndata)


def serial_ports():
    result = []
    for device in list_ports.comports():
        if (device.vid != None or device.pid != None):
            if (device.vid == '6790'):
                result.append(serial.Serial(device.device, baudRate))

    return result


def ledBlackBase():
    # return [[[0] * 3] * 150] * 2
    return [[[0, 0, 0] for i in range(150)] for j in range(len(serialDevices))]


def socket_server():
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)


@io.event
def connect(sid, environ):
    print('connect ', sid)


@io.event
def activate_pattern(sid, data):
    print('received event activate_pattern ', data)
    if data.get('name') not in activePatterns:
        activePatterns.append(data.get('name'))
    print('now active patterns:', activePatterns)
    io.emit('state', {'activePatterns': activePatterns})


@io.event
def deactivate_pattern(sid, data):
    print('received event deactivate_pattern ', data)
    activePatterns.remove(data.get('name'))
    print('now active patterns:', activePatterns)
    io.emit('state', {'activePatterns': activePatterns})


@io.event
def test(sid, data):
    print('received event test ', data)
    serialport.write(numpy.array(basicData).flat)
    waitForSerial(data)
    print('after wait')


@io.event
def disconnect(sid):
    print('disconnect ', sid)


def writeAndWait(data):
    for i, device in enumerate(serialDevices):
        device.write(numpy.array(data[i]).flat)


def render_loop():
    startTime = time.time()

    while True:
        image = ledBlackBase()
        elapsedMs = round((time.time() - startTime) * 1000)

        if len(activePatterns) > 0:
            if 'test' in activePatterns:
                for i in [0, 1]:
                    tick = round(elapsedMs / (1000 / 60)) % 150
                    image[i][tick][2] = 255
                # Get some data
                # data = in_q.get()
                # Process the data
                # print('CONSUMER - get data:', activePatterns)
                # print('CONSUMER - elapsed ms:', round((time.time() - startTime) * 1000))

            serialport.write(numpy.array(image).flat)
            waitForSerial(image)


serialDevices = serial_ports()

t1 = Thread(target=socket_server)
t2 = Thread(target=render_loop)
t1.start()
t2.start()
