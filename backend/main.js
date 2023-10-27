const Stream = require('node-rtsp-stream')
const WebSocket = require('ws');
const net = require('net');
const express = require('express')
const bodyParser = require("body-parser");


const app = express()
const port = 9996

// AI Parameters
let SmaplingPeriod = 10
let temp_threshold = 40
let streamVideo = true

let expConfig = {
  temp: 0,
  accW: 0,
  cat1W: 0,
  cat2W: 0,
  resinW: 0
}
let roomTempHistory = [22]
let sampleIndex = 0
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('hello world')
})

app.get('/finish', (req, res) => {
  // TODO AI
  // score =  10 * (1 - sigma over thresh / sigma total )
  let sumOverThres = 0;
  let totalSum = 0;
  for (let t of roomTempHistory) {
    if (t > temp_threshold) {
      sumOverThres += t - temp_threshold
    }
    totalSum += t
  }
  const score = 10 * (1 - sumOverThres / totalSum)
  roomTempHistory = [22]
  res.send({ score: score.toFixed(1) })
})

app.post('/initiate', (req, res) => {
  // TODO AI
  const resinW = req.body.resinW
  const temp = roomTempHistory[roomTempHistory.length - 1]
  const accW = (resinW / 24.0) * (-3 * temp + 210)
  const cat2W = (resinW / 24.0) * (-15 * temp + 690)
  const cat1W = (resinW / 24.0) * (15 * temp - 210)
  expConfig = {
    temp,
    resinW,
    accW: accW.toFixed(2),
    cat2W: cat2W.toFixed(2),
    cat1W: cat1W.toFixed(2)
  }
  res.send(expConfig)
})

app.post('/start', (req, res) => {
  // expConfig = req.body.resin
  // console.log(req.body)
  res.send({ id: 0 })
})

app.get('/weights', (req, res) => {
  res.send(expConfig)
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
    console.log(data.toString());
    if (sampleIndex == 0) {
      const newTemp = parseFloat(data.toString().replace(/\r/g, ' ').replace(/[a-zA-Z\n]/g, '').split(' ')[0])
      if (newTemp) roomTempHistory.push(newTemp)
      // console.log('new!');
    }
    sampleIndex += 1
    sampleIndex = sampleIndex % SmaplingPeriod
    // console.log(roomTempHistory);
    // console.log('sent sensor data:', data.toString());
  });
});

if (streamVideo) {

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
}