import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const LearningRoomB: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCamActive, setIsCamActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Store timeout reference
  const { index } = useParams(); // Destructure the `index` parameter
  const [apiLetter, setApiLetter] = useState<string | null>(null); // State to hold the letter from API
  const [hasResult, setHasResult] = useState<boolean>(false); // State to track if there's at least one result

  // Convert `index` to an integer and check the range
  const parsedIndex = index !== undefined ? parseInt(index, 10) : NaN;
  const validIndex =
    !isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex <= 38
      ? parsedIndex
      : 0;

  const characters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];

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
      setHasResult(false); // Reset hasResult when starting the webcam

      // Set timeout to capture and send frame to API
      intervalRef.current = setInterval(() => {
        captureAndSendFrame(); // Call the function to capture and send frame
      }, 100); // ms
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
              const jsonResponse = await response.json(); // Parse the JSON response
              const { letter } = jsonResponse; // Extract the letter
              setApiLetter(letter); // Update state with the letter
              setHasResult(true); // Set hasResult to true when a result is received
              console.log("Frame sent successfully!", letter);
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Clear the timeout
      intervalRef.current = null; // Reset timeout ref
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

  // Check if the API letter matches the character at validIndex
  const isMatch = apiLetter === characters[validIndex];

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-6">
      {/* Left Section with Text */}
      <div className="w-1/3 flex items-center justify-center p-4">
        <h1 className="text-9xl font-bold text-gray-800">
          {characters[validIndex]}
        </h1>
      </div>

      {/* Right Section with Webcam */}
      <div className="flex-1 flex items-center justify-center flex-col">
        <div
          className={`overflow-hidden rounded-lg w-3/4 h-3/5 max-w-2xl max-h-[70vh] mb-4 ${
            !isCamActive
              ? "bg-gray-300 shadow-none" // Grey background when the camera is off
              : hasResult
              ? isMatch
                ? "shadow-5xl shadow-green-400"
                : "shadow-5xl shadow-red-400"
              : "shadow-none" // No shadow until there's a result
          }`}
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

export default LearningRoomB;
