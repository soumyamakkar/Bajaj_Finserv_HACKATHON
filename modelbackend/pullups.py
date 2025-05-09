import cv2
import mediapipe as mp
import numpy as np
import threading
from flask import Flask, jsonify, Response
from flask_cors import CORS
from flask_socketio import SocketIO
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})
socketio = SocketIO(app, cors_allowed_origins="*")

def calculate_angles(wrist, elbow, shoulder):
    try:
        a = np.array(wrist)
        b = np.array(elbow)
        c = np.array(shoulder)
        ba = a - b
        bc = c - b
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.degrees(np.arccos(cosine_angle))
        return angle
    except Exception as e:
        logger.error(f"Error calculating angle: {e}")
        return 0

pullup_count = 0
count_lock = threading.Lock()
stop_flag = threading.Event()
video_thread = None

def generate_frames():
    global pullup_count, video_thread
    
    logger.info("Starting frame generation for pull-ups")
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose
    
    count = 0
    stage = "down"
    
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            logger.error("Failed to open webcam")
            return

        logger.info("Webcam opened successfully")
        
        with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
            while cap.isOpened() and not stop_flag.is_set():
                ret, frame = cap.read()
                if not ret:
                    logger.error("Failed to read frame")
                    break

                try:
                    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    image.flags.writeable = False
                    results = pose.process(image)
                    image.flags.writeable = True
                    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

                    if results.pose_landmarks:
                        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

                        landmarks = results.pose_landmarks.landmark
                        wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                                 landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                                 landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]

                        angle = calculate_angles(wrist, elbow, shoulder)
                        
                        # Display angle and count on frame
                        cv2.putText(image, f"Angle: {angle:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                        cv2.putText(image, f"Pull-ups: {count}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                        cv2.putText(image, f"Stage: {stage}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

                        # Pull-up counting logic
                        if angle < 40 and stage == "down":
                            logger.info(f"Rep completed. Count: {count + 1}")
                            stage = "up"
                            count += 1
                            with count_lock:
                                pullup_count = count
                                socketio.emit('pullup_count_update', {'count': count, 'stage': stage})
                        elif angle > 160 and stage == "up":
                            logger.info("Pull-up position detected")
                            stage = "down"

                    # Encode frame and send it as bytes
                    ret, buffer = cv2.imencode('.jpg', image)
                    if not ret:
                        logger.error("Failed to encode frame")
                        continue

                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                    
                except Exception as e:
                    logger.error(f"Error in frame processing: {e}")
                    continue

    except Exception as e:
        logger.error(f"Error in generate_frames: {e}")
    finally:
        logger.info("Cleaning up camera")
        if cap is not None and cap.isOpened():
            cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/start-counting", methods=["GET"])
def start_counting():
    global stop_flag
    try:
        logger.info("Starting pull-up counting session")
        stop_flag.clear()
        return jsonify({"message": "Pull-up counter started"}), 200
    except Exception as e:
        logger.error(f"Error starting pull-up counter: {e}")
        return jsonify({"error": "Failed to start pull-up counter"}), 500

@app.route("/stop-counting", methods=["GET"])
def stop_counting():
    global stop_flag
    try:
        logger.info("Stopping pull-up counting session")
        stop_flag.set()
        return jsonify({"message": "Pull-up counter stopped"}), 200
    except Exception as e:
        logger.error(f"Error stopping pull-up counter: {e}")
        return jsonify({"error": "Failed to stop pull-up counter"}), 500

@app.route("/last-session", methods=["GET"])
def last_session():
    with count_lock:
        return jsonify({"last_pullup_session": pullup_count}), 200

if __name__ == '__main__':
    try:
        logger.info("Starting Flask-SocketIO server")
        socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
    except Exception as e:
        logger.error(f"Server error: {e}")
