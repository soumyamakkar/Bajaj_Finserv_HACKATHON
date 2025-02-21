import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

const BicepCurlCounter = () => {
  const [curlCount, setCurlCount] = useState(0);
  const [lastSessionCount, setLastSessionCount] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const stageRef = useRef(null);

  // Calculate angle between wrist, elbow, and shoulder
  const calculateAngle = (wrist, elbow, shoulder) => {
    const vectorBA = [wrist.x - elbow.x, wrist.y - elbow.y];
    const vectorBC = [shoulder.x - elbow.x, shoulder.y - elbow.y];

    const dotProduct = vectorBA[0] * vectorBC[0] + vectorBA[1] * vectorBC[1];
    const magnitudeBA = Math.sqrt(vectorBA[0] ** 2 + vectorBA[1] ** 2);
    const magnitudeBC = Math.sqrt(vectorBC[0] ** 2 + vectorBC[1] ** 2);

    const cosineAngle = dotProduct / (magnitudeBA * magnitudeBC);
    const angle = Math.acos(cosineAngle) * (180 / Math.PI);
    return angle;
  };

  // Initialize MoveNet detector
  const initializeDetector = async () => {
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );
    detectorRef.current = detector;
  };

  // Process pose detection results
  const detectPose = async () => {
    if (!detectorRef.current || !webcamRef.current) return;

    const video = webcamRef.current.video;
    const poses = await detectorRef.current.estimatePoses(video);

    if (poses.length > 0) {
      const keypoints = poses[0].keypoints;
      const leftWrist = keypoints.find((point) => point.name === "left_wrist");
      const leftElbow = keypoints.find((point) => point.name === "left_elbow");
      const leftShoulder = keypoints.find((point) => point.name === "left_shoulder");

      if (leftWrist && leftElbow && leftShoulder) {
        const angle = calculateAngle(leftWrist, leftElbow, leftShoulder);

        // Update curl count logic
        if (angle > 160) {
          stageRef.current = "down";
        }
        if (angle < 30 && stageRef.current === "down") {
          stageRef.current = "up";
          setCurlCount((prevCount) => prevCount + 1);
        }
      }
    }
  };

  // Start pose detection
  const startDetection = async () => {
    if (isDetecting) return;

    setIsDetecting(true);
    setCurlCount(0);
    stageRef.current = null;

    try {
      await initializeDetector();

      const interval = setInterval(() => {
        if (isDetecting) {
          detectPose();
        }
      }, 100);

      return () => clearInterval(interval);
    } catch (err) {
      console.error("Error starting camera:", err);
      setCameraError("Failed to access camera. Please ensure permissions are granted.");
      setIsDetecting(false);
    }
  };

  // Stop pose detection
  const stopDetection = () => {
    setIsDetecting(false);
    setLastSessionCount(curlCount);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      setIsDetecting(false);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "640px", margin: "auto" }}>
      <Webcam
        ref={webcamRef}
        style={{
          transform: "scaleX(-1)",
          display: "block",
          width: "100%",
          height: "auto",
        }}
        autoPlay
        playsInline
        muted // Required for autoplay in some browsers
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        width={640}
        height={480}
      />
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "#00ff00",
          fontSize: "24px",
          fontWeight: "bold",
          textShadow: "2px 2px 4px #000000",
        }}
      >
        Curls: {curlCount}
      </div>
      <div style={{ marginTop: "10px" }}>
        <button onClick={startDetection} disabled={isDetecting}>
          Start Counting
        </button>
        <button onClick={stopDetection} disabled={!isDetecting}>
          Stop Counting
        </button>
      </div>
      {cameraError && (
        <div style={{ color: "red", marginTop: "10px" }}>{cameraError}</div>
      )}
      <div style={{ marginTop: "10px" }}>
        Last Session Count: {lastSessionCount}
      </div>
    </div>
  );
};

export default BicepCurlCounter;