import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

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
      // Start the frame capture every 3 seconds once the user joins the room
      captureInterval = setInterval(captureAndSendFrame, 3000);
    }

    return () => {
      clearInterval(captureInterval); // Clear interval on component unmount
    };
  }, [isJoined]);

  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };

  const joinRoom = () => {
    if (roomId) {
      setIsJoined(true);
      webSocket.current = new WebSocket(`ws://localhost:8000/ws/${roomId}`);
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
        webSocket.current.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
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
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.current?.createAnswer();
        await peerConnection.current?.setLocalDescription(answer);
        webSocket.current?.send(JSON.stringify({ type: "answer", answer }));
        break;
      case "answer":
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
        break;
      case "candidate":
        if (data.candidate) {
          await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
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
            const response = await axios.post("http://localhost:8000/api/upload-image/", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
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

  return (
    <div className="video-container">
      {!isJoined ? (
        <div className="join-room">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={handleRoomIdChange}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <>
          <div className="user-count">Users in Room: {userCount}</div>
          <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
          <button onClick={createOffer} className="connect-button">Start Call</button>
        </>
      )}
    </div>
  );
};

export default PartnerMode;
