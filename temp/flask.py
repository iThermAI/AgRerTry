# pip install Flask Flask-SocketIO opencv-python-headless
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import cv2
import base64

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # For cross-origin requests

camera_url = "rtsp://your_camera_url_here"


def get_processed_frame(frame):
    # TODO: Call your AI model here and return the processed frame
    return frame


@app.route("/")
def index():
    return render_template("index.html")


@socketio.on("connect", namespace="/video")
def video_feed():
    cap = cv2.VideoCapture(camera_url)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame = get_processed_frame(frame)
        _, jpeg = cv2.imencode(".jpg", frame)
        b64_frame = base64.b64encode(jpeg.tobytes()).decode("utf-8")
        emit("frame", {"image": b64_frame}, namespace="/video")
    cap.release()


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
