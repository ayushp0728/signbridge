import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./partnermode.css"; // Import the new CSS file

const PartnerMode: React.FC = () => {
  const [roomId, setRoomId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const webSocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    let captureInterval: NodeJS.Timeout;
    if (isJoined) {
      captureInterval = setInterval(captureAndSendFrame, 3000);
    }
    return () => {
      clearInterval(captureInterval);
    };
  }, [isJoined]);

  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };

  const joinRoom = () => {
    if (roomId) {
      setIsJoined(true);
      webSocket.current = new WebSocket(`ws://10.74.132.230:8000/ws/${roomId}`);
      webSocket.current.onmessage = handleSignalingData;
      startLocalStream();
    }
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      initPeerConnection(stream);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const initPeerConnection = (stream: MediaStream) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    stream.getTracks().forEach((track) => {
      peerConnection.current?.addTrack(track, stream);
    });

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && webSocket.current) {
        webSocket.current.send(
          JSON.stringify({ type: "candidate", candidate: event.candidate })
        );
      }
    };
  };

  const handleSignalingData = async (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    if (data.type === "user_count") {
      setUserCount(data.count);
      return;
    }

    switch (data.type) {
      case "offer":
        await peerConnection.current?.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        const answer = await peerConnection.current?.createAnswer();
        await peerConnection.current?.setLocalDescription(answer);
        webSocket.current?.send(JSON.stringify({ type: "answer", answer }));
        break;
      case "answer":
        await peerConnection.current?.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        break;
      case "candidate":
        if (data.candidate) {
          await peerConnection.current?.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
        break;
    }
  };

  const captureAndSendFrame = async () => {
    if (!localVideoRef.current) return;

    const canvas = document.createElement("canvas");
    const video = localVideoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append("file", blob, "frame.jpg");

          try {
            const response = await axios.post(
              "http://10.74.132.230:8000/api/upload-image/",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );
            console.log(response.data.message); // Log the response message
          } catch (error) {
            console.error("Error uploading frame:", error);
          }
        }
      }, "image/jpeg");
    }
  };

  const createOffer = async () => {
    const offer = await peerConnection.current?.createOffer();
    await peerConnection.current?.setLocalDescription(offer);
    webSocket.current?.send(JSON.stringify({ type: "offer", offer }));
  };

  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;

    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());

    setIsJoined(false);
    setRoomId("");
    setUserCount(0);
  };

  return (
    <div className="video-container">
      {!isJoined ? (
        <div className="border border-violet-200 flex flex-col items-center p-6 bg-pastel-light-yellow rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Join a Room
          </h2>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={handleRoomIdChange}
            className="w-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-light-blue mb-4 text-center"
          />
          <button
            onClick={joinRoom}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition text-white`}
          >
            Join Room
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {/* User Count */}
            <div className="user-count text-2xl mb-6 font-semibold text-gray-700">
              Users in Room: {userCount}
            </div>

            {/* Video Container */}
            <div className="flex space-x-6 items-center justify-center mb-8">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-[500px] h-[300px] bg-gray-800 rounded-lg object-cover transform -scale-x-100" // Fixed size and unmirrored
              />
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-[500px] h-[300px] bg-gray-800 rounded-lg object-cover" // Fixed size and unmirrored
              />
            </div>

            {/* Button Container */}
            <div className="button-container flex space-x-6">
              <button
                onClick={createOffer}
                className="px-6 py-3 w-[200px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
              >
                Start Call
              </button>
              <button
                onClick={endCall}
                className="px-6 py-3 w-[200px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-lg"
              >
                End Call
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PartnerMode;
