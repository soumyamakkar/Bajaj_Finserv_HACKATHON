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

def calculate_angles(landmark1, landmark2, landmark3):
    try:
        a = np.array(landmark1)  
        b = np.array(landmark2)   
        c = np.array(landmark3)    

        ba = a - b
        bc = c - b
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.degrees(np.arccos(cosine_angle))
        return angle
    except Exception as e:
        logger.error(f"Error calculating angle: {e}")
        return 0

exercise_counters = {
    "squat": 0,
    "pushup": 0,
    "pullup": 0,
    "crunch": 0
}
count_lock = threading.Lock()  
stop_flag = threading.Event() 
video_thread = None

def generate_frames(exercise):
    global exercise_counters, video_thread
    
    logger.info(f"Starting frame generation for {exercise}")
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose
    
    count = 0
    stage = "start"
    
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
                        if exercise == "squat":
                            ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                                    landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                            knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                                   landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                            hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                                  landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                            angle = calculate_angles(ankle, knee, hip)

                        elif exercise == "pushup":
                            elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                                    landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                            shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                                       landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                            wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                                    landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                            angle = calculate_angles(wrist, elbow, shoulder)

                        elif exercise == "pullup":
                            elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                                    landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                            shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                                       landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                            wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                                    landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                            angle = calculate_angles(wrist, elbow, shoulder)

                        elif exercise == "crunch":
                            knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                                   landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                            hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                                  landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                            shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                                       landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                            angle = calculate_angles(knee, hip, shoulder)
                        
                        # Visualize data on frame
                        cv2.putText(image, f"Angle: {angle:.2f}", 
                                  (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                        cv2.putText(image, f"{exercise.capitalize()} Count: {count}",
                                  (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                        cv2.putText(image, f"Stage: {stage}",
                                  (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

                        # Counter logic
                        if exercise == "squat" and angle > 160 and stage == "squat":
                            stage = "stand"
                            count += 1
                        elif exercise == "pushup" and angle > 160 and stage == "down":
                            stage = "up"
                            count += 1
                        elif exercise == "pullup" and angle > 160 and stage == "down":
                            stage = "up"
                            count += 1
                        elif exercise == "crunch" and angle > 90 and stage == "down":
                            stage = "up"
                            count += 1

                        # Emit updated count
                        with count_lock:
                            exercise_counters[exercise] = count
                            socketio.emit(f'{exercise}_count_update', {'count': count, 'stage': stage})

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

@app.route('/video_feed/<exercise>')
def video_feed(exercise):
    if exercise in exercise_counters:
        return Response(generate_frames(exercise),
                       mimetype='multipart/x-mixed-replace; boundary=frame')
    else:
        return jsonify({"error": "Invalid exercise type"}), 400

@app.route("/start-counting/<exercise>", methods=["GET"])
def start_counting(exercise):
    global stop_flag
    try:
        if exercise not in exercise_counters:
            return jsonify({"error": "Invalid exercise type"}), 400
        logger.info(f"Starting {exercise} counting session")
        stop_flag.clear()
        return jsonify({"message": f"{exercise.capitalize()} counter started"}), 200
    except Exception as e:
        logger.error(f"Error starting {exercise} counter: {e}")
        return jsonify({"error": f"Failed to start {exercise} counter"}), 500

@app.route("/stop-counting/<exercise>", methods=["GET"])
def stop_counting(exercise):
    global stop_flag
    try:
        if exercise not in exercise_counters:
            return jsonify({"error": "Invalid exercise type"}), 400
        logger.info(f"Stopping {exercise} counting session")
        stop_flag.set()
        return jsonify({"message": f"{exercise.capitalize()} counter stopped"}), 200
    except Exception as e:
        logger.error(f"Error stopping {exercise} counter: {e}")
        return jsonify({"error": f"Failed to stop {exercise} counter"}), 
