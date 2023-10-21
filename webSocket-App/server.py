from flask import Flask
from flask_socketio import SocketIO, emit
import cv2
import base64
import time

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


@socketio.on("connect")
def connected():
    cap = cv2.VideoCapture("temp.mp4")
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        _, jpeg = cv2.imencode(".jpg", frame)
        b64_frame = base64.b64encode(jpeg.tobytes()).decode("utf-8")
        # print(b64_frame)
        emit("connect", {"frame": b64_frame})
    cap.release()
    # while True:
    #     with open("frame.jpg", "rb") as frame:
    #         b64_frame = base64.b64encode(frame.read()).decode("utf-8")
    #         print(b64_frame)
    #         # emit("connect", {"frame": b64_frame})
    #         emit("connect", {"frame": "aaaa"})

    #         time.sleep(1)


if __name__ == "__main__":
    socketio.run(app, debug=True, port=5002)
