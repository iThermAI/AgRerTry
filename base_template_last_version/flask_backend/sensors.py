import asyncio
import base64
import threading
from abc import ABC, abstractmethod
import time
from globals import StartRun
import cv2
from db import add_record

temp = 0
index = 0
frameThermal = 0
FlagStart = 1
lastTime = 0


def reset():
    global index, FlagStart, lastTime
    index = 0
    FlagStart = 1
    lastTime = 0


class Camera(ABC):
    def __init__(self, url, loop):
        self.cap = cv2.VideoCapture(url)
        if self.cap.isOpened():
            print("cammera connection made")
        self.loop = loop

    def start(self):
        threading.Thread(target=self.update, args=()).start()
        return self

    def update(self):
        while StartRun:
            ret, frame = self.cap.read()
            if ret:
                asyncio.run_coroutine_threadsafe(self.handle_frame(frame), self.loop)

    @abstractmethod
    async def handle_frame(self, frame):
        pass


class CameraThermal(Camera):
    def __init__(self, url, loop):
        self.cap = cv2.VideoCapture(url)
        if self.cap.isOpened():
            print("cammera connection made")
        self.loop = loop

    async def handle_frame(self, frame):
        # Handle the frame here
        # cv2.imshow(frame)
        global frameThermal
        frameThermal = frame


class CameraRGB(Camera):
    def __init__(self, url, loop):
        self.cap = cv2.VideoCapture(url)
        if self.cap.isOpened():
            print("cammera connection made")
        self.loop = loop

    async def handle_frame(self, frame):
        # Handle the frame here
        # cv2.imshow(frame)
        global lastTime, FlagStart, index, frameThermal
        Time = time.time()
        TimeData = 0
        if FlagStart == 1:
            lastTime = Time
            FlagStart = 0
            TimeData = 0
        else:
            TimeData = Time - lastTime

        ## Base64 Encoding Suggested by frontend
        ### RGB frame
        resized_frame = cv2.resize(frame, (672, 380))
        _, jpeg_rgb = cv2.imencode(".jpg", resized_frame)
        encoded_image_rgb = base64.b64encode(jpeg_rgb.tobytes()).decode("utf-8")

        ### Thermal frame
        resized_frameThermal = cv2.resize(frameThermal, (672, 380))
        _, jpeg_thermal = cv2.imencode(".jpg", resized_frameThermal)
        encoded_image_thermal = base64.b64encode(jpeg_thermal.tobytes()).decode("utf-8")

        ## Insert to database
        data_doc = {
            "index": index,
            "Time": TimeData,
            "resinTemp": temp,
            "cureTemp": temp,
            "image_rgb": encoded_image_rgb,
            "image_th": encoded_image_thermal,
        }
        index = index + 1
        add_record(data_doc)

        print("Time", TimeData, type(frame), "temprature data", temp)
        print("Data is recording")


## Necessary Classes
class SensorClientProtocol(asyncio.Protocol):
    def __init__(self, on_con_lost):
        self.on_con_lost = on_con_lost

    def connection_made(self, transport):
        self.transport = transport
        print("Sensor connection made")

    def data_received(self, data):
        global temp
        message = data.decode()
        temp = message
        # print('Sensor data received:',message)

    def connection_lost(self, exc):
        print("Sensor connection lost:", exc)
        self.on_con_lost.set_result(True)  # signal that we're done
