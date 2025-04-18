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

def calculate_angles(hip, knee, shoulder):
    try:
        a = np.array(hip)
        b = np.array(knee)
        c = np.array(shoulder)
        ba = a - b
        bc = c - b
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.degrees(np.arccos(cosine_angle))
        return angle
    except Exception as e:
        logger.error(f"Error calculating angle: {e}")
        return 0

crunch_count = 0
count_lock = threading.Lock()
stop_flag = threading.Event()
video_thread = None

def generate_frames():
    global crunch_count, video_thread
    
    logger.info("Starting frame generation for crunches")
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
                        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                               landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                        knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                                landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]

                        angle = calculate_angles(hip, knee, shoulder)
                        
                        # Display angle and count on frame
                        cv2.putText(image, f"Angle: {angle:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                        cv2.putText(image, f"Crunches: {count}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                        cv2.putText(image, f"Stage: {stage}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

                        # Crunch counting logic
                        if angle < 50 and stage == "down":
                            logger.info(f"Rep completed. Count: {count + 1}")
                            stage = "up"
                            count += 1
                            with count_lock:
                                crunch_count = count
                                socketio.emit('crunch_count_update', {'count': count, 'stage': stage})
                        elif angle > 160 and stage == "up":
                            logger.info("Crunch position detected")
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
        logger.info("Starting crunch counting session")
        stop_flag.clear()
        return jsonify({"message": "Crunch counter started"}), 200
    except Exception as e:
        logger.error(f"Error starting crunch counter: {e}")
        return jsonify({"error": "Failed to start crunch counter"}), 500

@app.route("/stop-counting", methods=["GET"])
def stop_counting():
    global stop_flag
    try:
        logger.info("Stopping crunch counting session")
        stop_flag.set()
        return jsonify({"message": "Crunch counter stopped"}), 200
    except Exception as e:
        logger.error(f"Error stopping crunch counter: {e}")
        return jsonify({"error": "Failed to stop crunch counter"}), 500

@app.route("/last-session", methods=["GET"])
def last_session():
    with count_lock:
        return jsonify({"last_crunch_session": crunch_count}), 200

if __name__ == '__main__':
    try:
        logger.info("Starting Flask-SocketIO server")
        socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
    except Exception as e:
        logger.error(f"Server error: {e}")
