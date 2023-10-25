const Stream = require('node-rtsp-stream')
const WebSocket = require('ws');
const net = require('net');

const server = new WebSocket.Server({ port: 9997 });


const sensor_ip = 'localhost';  // replace with the server's IP address
const sensor_port = 25555;       // replace with the server's port number

const client = new net.Socket();

client.connect(sensor_port, sensor_ip, () => {
  console.log('Connected to the sensor.');
});


server.on('connection', (ws) => {
  console.log('front connected');
  // ws.send sensor info
  client.on('data', (data) => {
    // ws.emit('data',data)
    ws.send(data.toString())
    console.log('sent sensor data:', data.toString());
  });
  

//   ws.on('message', (message) => {
//     console.log('Received:', message);
//     ws.send('Echo: ' + message);
//   });

//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
});

// console.log('WebSocket server is running on ws://localhost:8080');

new Stream({
  name: 'name',
  streamUrl: 'rtsp://admin:qwe%21%40%23123@127.0.0.1:554/Streaming/Channels/101',
  wsPort: 9998,
  ffmpegOptions: { // options ffmpeg flags
    '-stats': '', // an option with no neccessary value uses a blank string
    '-r': 30 // options with required values specify the value after the key
  }
})

// new Stream({
//     name: 'name',
//     streamUrl: 'rtsp://admin:qwe%21%40%23123@localhost:554/Streaming/Channels/102',
//     wsPort: 9999,
//     ffmpegOptions: { // options ffmpeg flags
//       '-stats': '', // an option with no neccessary value uses a blank string
//       '-r': 30 // options with required values specify the value after the key
//     }
//   })