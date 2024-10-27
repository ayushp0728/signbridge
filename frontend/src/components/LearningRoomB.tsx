import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const LearningRoomB: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCamActive, setIsCamActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { index } = useParams<{ index: string }>();
  const [apiLetter, setApiLetter] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null); // State for feedback message

  const parsedIndex = index !== undefined ? parseInt(index, 10) : NaN;
  const validIndex =
    !isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex <= 38
      ? parsedIndex
      : 0;

  const characters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3",
    "4", "5", "6", "7", "8", "9",
  ];

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
      setHasResult(false);
      setFeedbackMessage(null); // Reset feedback message

      intervalRef.current = setInterval(() => {
        captureAndSendFrame();
      }, 1000);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append("file", blob, "webcam_capture.jpeg");

          try {
            const response = await fetch(
              "http://localhost:8000/api/upload-image/",
              {
                method: "POST",
                body: formData,
              }
            );

            if (response.ok) {
              const jsonResponse = await response.json();
              const { letter } = jsonResponse;
              setApiLetter(letter);
              setHasResult(true);
              console.log("Frame sent successfully!", letter);
              
              // Check if the API letter matches the character at validIndex
              const isMatch = letter === characters[validIndex];
              if (isMatch) {
                setFeedbackMessage("Good Job!"); // Set feedback message on correct answer

                // Optionally, you can send this to your API
                await fetch("http://localhost:8000/api/log-correct-answer/${uid}", {
                  method: "POST",
                  body: JSON.stringify({ letter }), // Send the correct letter
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
              } else {
                setFeedbackMessage("Try Again!"); // Message for incorrect answer
              }
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

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleWebcam = () => {
    if (isCamActive) {
      cleanup();
    } else {
      startVideo();
    }
    setIsCamActive(!isCamActive);
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-6">
      <div className="w-1/3 flex items-center justify-center p-4">
        <h1 className="text-9xl font-bold text-gray-800">
          {characters[validIndex]}
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center flex-col">
        <div
          className={`overflow-hidden rounded-lg w-3/4 h-3/5 max-w-2xl max-h-[70vh] mb-4 ${
            !isCamActive
              ? "bg-gray-300 shadow-none"
              : hasResult
              ? apiLetter === characters[validIndex]
                ? "shadow-5xl shadow-green-400"
                : "shadow-5xl shadow-red-400"
              : "shadow-none"
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
        <canvas ref={canvasRef} style={{ display: "none" }} />
        
        {/* Feedback Message Popup */}
        {feedbackMessage && (
          <div className="mt-4 p-4 bg-green-200 text-green-800 rounded-md shadow-md">
            {feedbackMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningRoomB;
