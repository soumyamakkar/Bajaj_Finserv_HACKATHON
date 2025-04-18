from flask import Flask, jsonify
from flask_cors import CORS
import threading
import cv2
import mediapipe as mp
import numpy as np

app = Flask(__name__)
CORS(app)

def calculate_angles(wrist, elbow, shoulder):
    a = np.array(wrist)
    b = np.array(elbow)
    c = np.array(shoulder)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.degrees(np.arccos(cosine_angle))
    return angle

last_curl_count = 0
count_lock = threading.Lock()
stop_flag = threading.Event()

def bicep_curl_detection():
    global last_curl_count
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose

    count = 0
    stage = None
    cap = cv2.VideoCapture(0)

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened() and not stop_flag.is_set():
            ret, frame = cap.read()
            if not ret:
                break

            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = pose.process(image)
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            try:
                landmarks = results.pose_landmarks.landmark
                wrist = [
                    landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y,
                ]
                elbow = [
                    landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y,
                ]
                shoulder = [
                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y,
                ]
                angle = calculate_angles(wrist, elbow, shoulder)

                cv2.putText(
                    image,
                    f"Curls: {count}",
                    (50, 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (0, 255, 0),
                    2,
                    cv2.LINE_AA,
                )

                if angle > 160:
                    stage = "down"
                if angle < 30 and stage == "down":
                    stage = "up"
                    count += 1
                    with count_lock:
                        last_curl_count = count

            except Exception as e:
                print(f"Error in bicep curl detection: {e}")

            mp_drawing.draw_landmarks(
                image,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
                mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2),
            )

            cv2.imshow("Bicep Curl Counter", image)

            if cv2.waitKey(10) & 0xFF == ord("q") or cv2.getWindowProperty("Bicep Curl Counter", cv2.WND_PROP_VISIBLE) < 1:
                break

    cap.release()
    cv2.destroyAllWindows()

@app.route("/start-counting", methods=["GET"])
def start_counting():
    global stop_flag
    stop_flag.clear()
    thread = threading.Thread(target=bicep_curl_detection, daemon=True)
    thread.start()
    return jsonify({"message": "Bicep curl counter started"}), 200

@app.route("/stop-counting", methods=["GET"])
def stop_counting():
    stop_flag.set()
    return jsonify({"message": "Bicep curl counter stopped"}), 200

@app.route("/last-session", methods=["GET"])
def last_session():
    with count_lock:
        return jsonify({"last_curl_session": last_curl_count}), 200

if __name__ == "__main__":
    app.run(debug=True)
