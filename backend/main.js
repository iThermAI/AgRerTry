const Stream = require('node-rtsp-stream')
const WebSocket = require('ws');
const net = require('net');
const express = require('express')
const bodyParser = require("body-parser");

const app = express()
const port = 9996

let currentRatio = 0

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('hello world')
})

app.get('/finish', (req, res) => {
  // TODO AI
  res.send({ score: 8.5 })
})

app.get('/initiate', (req, res) => {
  // TODO AI
  res.send({ catRatio: 10 })
})

app.post('/start', (req, res) => {
  currentRatio = req.body.ratio
  // console.log(req.body)
  res.send({ id: 0 })
})

app.get('/ratio', (req, res) => {
  res.send({ ratio: currentRatio })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


const server = new WebSocket.Server({ port: 9997 });


const sensor_ip = '192.168.1.186';
const sensor_port = 25555;

const client = new net.Socket();

client.connect(sensor_port, sensor_ip, () => {
  console.log('Connected to the sensor.');
});


server.on('connection', (ws) => {
  console.log('front connected');
  client.on('data', (data) => {
    ws.send(data.toString())
    // console.log('sent sensor data:', data.toString());
  });
});


new Stream({
  name: 'name',
  streamUrl: 'rtsp://admin:qwe%21%40%23123@192.168.1.64:554/Streaming/Channels/101',
  wsPort: 9998,
  ffmpegOptions: { // options ffmpeg flags
    '-stats': '', // an option with no neccessary value uses a blank string
    '-r': 30 // options with required values specify the value after the key
  }
})

new Stream({
  name: 'name',
  streamUrl: 'rtsp://admin:qwe%21%40%23123@192.168.1.64:554/Streaming/Channels/201',
  wsPort: 9999,
  ffmpegOptions: { // options ffmpeg flags
    '-stats': '', // an option with no neccessary value uses a blank string
    '-r': 30 // options with required values specify the value after the key
  }
})