import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import { useAuth } from "./AuthContext";

const LearningRoomB: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCamActive, setIsCamActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { index } = useParams<{ index: string }>();
  const [apiLetter, setApiLetter] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isAnswerLogged, setIsAnswerLogged] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize navigate

  const parsedIndex = index !== undefined ? parseInt(index, 10) : NaN;
  const validIndex =
    !isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex <= 38
      ? parsedIndex
      : 0;

  const characters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3",
    "4", "5", "6", "7", "8", "9"
  ];

  const links = [
    "/f.png", "/e.png", "/d.png", "/c.png", "/b.png", "/a.png"
  ];

  // Handle navigation to next or previous character
  const goToPrevious = () => {
    if (validIndex > 0) {
      navigate(`/learning/${validIndex - 1}`);
    }
  };

  const goToNext = () => {
    if (validIndex < characters.length - 1) {
      navigate(`/learning/${validIndex + 1}`);
    }
  };

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
    if (isProcessing || !videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);

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
              "https://b6cb-128-6-147-63.ngrok-free.app/api/upload-image/",
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

              const isMatch = letter === characters[validIndex];
              setFeedbackMessage(isMatch ? "Good Job!" : "Try Again!");

              if (isMatch && user?.uid && !isAnswerLogged) {
                await fetch(
                  `https://b6cb-128-6-147-63.ngrok-free.app/api/log-correct-answer/${user?.uid}`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ letter }),
                  }
                );
                setIsAnswerLogged(true);
              } else {
                setFeedbackMessage("Try Again!");
              }
            } else {
              console.error("Error sending frame:", response.statusText);
            }
          } catch (error) {
            console.error("Error sending frame:", error);
          } finally {
            setIsProcessing(false);
          }
        } else {
          setIsProcessing(false);
        }
      }, "image/jpeg");
    } else {
      setIsProcessing(false);
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
      setIsAnswerLogged(false);
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
          <img
            src={`${process.env.PUBLIC_URL}${links[validIndex]}`} // Access image in public folder
            alt={characters[validIndex]} // Alt text
            className="mb-4 w-48 h-48"
          />
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

        {/* Navigation Arrows */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={goToPrevious}
            disabled={validIndex === 0}
            className={`px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold ${
              validIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Previous
          </button>
          <button
            onClick={goToNext}
            disabled={validIndex === characters.length - 1}
            className={`px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold ${
              validIndex === characters.length - 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningRoomB;
