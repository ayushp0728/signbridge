import React, { useEffect, useRef, useState } from "react";

const LearningRoom: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCamActive, setIsCamActive] = useState<boolean>(false); // State to track if the webcam is active

  // Start video stream
  const startVideo = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setStream(newStream); // Store the stream in state
      if (videoRef.current) {
        videoRef.current.srcObject = newStream; // Set the video source
      }
      setIsCamActive(true); // Set the camera state to active
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup function to stop the stream on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]); // Dependency on stream to ensure cleanup occurs

  // Function to toggle the webcam
  const toggleWebcam = () => {
    if (isCamActive) {
      // If the camera is active, stop it
      if (stream) {
        stream.getTracks().forEach((track) => track.stop()); // Stop each track
        setStream(null); // Clear the stream from state
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null; // Clear the video source
      }
    } else {
      // If the camera is not active, start it
      startVideo();
    }
    setIsCamActive(!isCamActive); // Toggle the camera state
  };

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
            className="w-full h-full object-cover transform -scale-x-100" // Flip horizontally to avoid mirroring
            style={{ height: "500px" }} // Fixed height for consistent size
          ></video>
        </div>

        <button
          onClick={toggleWebcam}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          {isCamActive ? "Stop Webcam" : "Start Webcam"}
        </button>
      </div>
    </div>
  );
};

export default LearningRoom;
