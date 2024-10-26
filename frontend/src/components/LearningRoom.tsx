import React, { useEffect, useRef, useState } from "react";
// import * as mpHands from "@mediapipe/hands";
// import "@mediapipe/hands";
// import * as tf from "@tensorflow/tfjs";

const LearningRoom: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCamActive, setIsCamActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Store timeout reference

  // Start video stream
  const startVideo = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setIsCamActive(true);

      // Set timeout to capture and send frame to API
      timeoutRef.current = setInterval(() => {
        captureAndSendFrame(); // Call the function to capture and send frame
      }, 1000); // 3 seconds
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  // Function to capture and send the frame to the API
  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      // Set canvas dimensions to match the video feed
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append("file", blob, "webcam_capture.jpeg");

          try {
            // Send the capture to the API
            const response = await fetch(
              "http://localhost:8000/api/upload-image/",
              {
                method: "POST",
                body: formData,
              }
            );

            if (response.ok) {
              console.log("Frame sent successfully!");
            } else {
              console.error("Error sending frame:", response.statusText);
            }
          } catch (error) {
            console.error("Error sending frame:", error);
          }
        }
      }, "image/jpeg");
    }
  };

  // Cleanup function to stop the webcam and clear timeout
  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null; // Clear the video source
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Clear the timeout
      timeoutRef.current = null; // Reset timeout ref
    }
  };

  // Function to toggle the webcam
  const toggleWebcam = () => {
    if (isCamActive) {
      cleanup(); // Cleanup if the camera is active
    } else {
      startVideo(); // Start the webcam if it's not active
    }
    setIsCamActive(!isCamActive); // Toggle the camera state
  };

  useEffect(() => {
    return () => {
      cleanup(); // Cleanup on component unmount
    };
  }, []); // Empty dependency array to run cleanup only on unmount

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-6">
      {/* Left Section with Text */}
      <div className="w-1/3 p-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          This is some testing text
        </h1>
        <p className="text-gray-600">
          Here is some sample text on the left side of the page. You can add
          more details or instructions here if necessary.
        </p>
      </div>

      {/* Right Section with Webcam */}
      <div className="flex-1 flex items-center justify-center flex-col">
        <div
          className={`overflow-hidden shadow-lg rounded-lg w-3/4 h-3/5 max-w-2xl max-h-[70vh] mb-4 ${
            !isCamActive ? "bg-gray-700" : ""
          }`} // Conditional background color
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform -scale-x-100"
            style={{ height: "500px" }}
          ></video>
        </div>
        <button
          onClick={toggleWebcam}
          className="px-4 py-2 w-40 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          {isCamActive ? "Stop Webcam" : "Start Webcam"}
        </button>
        <canvas ref={canvasRef} style={{ display: "none" }} />{" "}
        {/* Hidden canvas */}
      </div>
    </div>
  );
};

export default LearningRoom;
