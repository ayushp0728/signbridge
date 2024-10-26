import React, { useEffect, useRef, useState } from "react";

const PartnerMode: React.FC = () => {
  const [roomId, setRoomId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const webSocket = useRef<WebSocket | null>(null);

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
          <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
          <button onClick={createOffer} className="connect-button">Start Call</button>
        </>
      )}
    </div>
  );
};

export default PartnerMode;
