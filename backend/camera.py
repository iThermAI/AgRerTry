import cv2


def play_rtsp_stream(rtsp_url):
    # Create a VideoCapture object
    cap = cv2.VideoCapture(rtsp_url)

    # Check if video opened successfully
    if not cap.isOpened():
        print("Error: Could not open video stream.")
        return

    # Loop to read and display frames
    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame.")
            break

        # Display the frame
        frame = cv2.resize(frame, (640, 480))
        cv2.imshow("RTSP Stream", frame)

        # Press 'q' to exit the loop and close the video stream
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    # Release the video capture object and clospipe all windows
    cap.release()
    cv2.destroyAllWindows()


# Replace 'your_rtsp_url_here' with your RTSP URL
rtsp_url = "rtsp://admin:qwe%21%40%23123@127.0.0.1:554/Streaming/Channels/101"
play_rtsp_stream(rtsp_url)
