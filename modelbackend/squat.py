from flask import Flask, jsonify, Response
from flask_cors import CORS
import threading
import cv2
import mediapipe as mp
import numpy as np
import base64
from flask_socketio import SocketIO
import logging

# Set up logging - change to INFO level
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
socketio = SocketIO(app, cors_allowed_origins="*")

def calculate_angles(ankle, knee, hip):
    try:
        a = np.array(ankle)  
        b = np.array(knee)   
        c = np.array(hip)    

        ba = a - b
        bc = c - b
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.degrees(np.arccos(cosine_angle))
        return angle
    except Exception as e:
        logger.error(f"Error calculating angle: {e}")
        return 0

last_squat_count = 0
count_lock = threading.Lock()  
stop_flag = threading.Event() 
video_thread = None

def generate_frames():
    global last_squat_count, video_thread
    
    logger.info("Starting frame generation")
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose
    
    count = 0
    stage = "stand"
    
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
                    # Convert the frame to RGB
                    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    image.flags.writeable = False
                    results = pose.process(image)
                    image.flags.writeable = True
                    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

                    if results.pose_landmarks:
                        # Draw the pose landmarks
                        mp_drawing.draw_landmarks(
                            image,
                            results.pose_landmarks,
                            mp_pose.POSE_CONNECTIONS,
                            mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
                            mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2)
                        )

                        # Get landmarks
                        landmarks = results.pose_landmarks.landmark
                        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                                landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                        knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                               landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                              landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                        
                        angle = calculate_angles(ankle, knee, hip)
                        
                        # Visualize data on frame
                        cv2.putText(image, f"Angle: {angle:.2f}", 
                                  (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                        cv2.putText(image, f"Squats: {count}",
                                  (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                        cv2.putText(image, f"Stage: {stage}",
                                  (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

                        # Squat counter logic
                        if angle > 160 and stage == "squat":
                            logger.info(f"Rep completed. Count: {count + 1}")
                            stage = "stand"
                            count += 1
                            with count_lock:
                                last_squat_count = count
                                socketio.emit('count_update', {'count': count, 'stage': stage})
                        elif angle < 100 and stage == "stand":
                            logger.info("Squat position detected")
                            stage = "squat"

                    # Convert frame to JPEG
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
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/start-counting", methods=["GET"])
def start_counting():
    global stop_flag
    try:
        logger.info("Starting counting session")
        stop_flag.clear()
        return jsonify({"message": "Squat counter started"}), 200
    except Exception as e:
        logger.error(f"Error starting counter: {e}")
        return jsonify({"error": "Failed to start counter"}), 500

@app.route("/stop-counting", methods=["GET"])
def stop_counting():
    global stop_flag
    try:
        logger.info("Stopping counting session")
        stop_flag.set()
        return jsonify({"message": "Squat counter stopped"}), 200
    except Exception as e:
        logger.error(f"Error stopping counter: {e}")
        return jsonify({"error": "Failed to stop counter"}), 500

@app.route("/last-session", methods=["GET"])
def last_session():
    with count_lock:
        return jsonify({"last_squat_session": last_squat_count}), 200

if __name__ == '__main__':
    try:
        logger.info("Starting Flask-SocketIO server")
        socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
    except Exception as e:
        logger.error(f"Server error: {e}")