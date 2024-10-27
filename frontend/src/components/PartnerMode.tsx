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
  const sentence1 = useRef<number>(-1);
  const sentence2 = useRef<number>(-1);
  const sentence = useRef<string>("");
  const isFirstCaller = useRef<boolean>(false);
  const [useless, setUseless] = useState<boolean>(false);

  useEffect(() => {
    let captureInterval: NodeJS.Timeout;
    if (isJoined) {
      captureInterval = setInterval(() => {
        captureAndSendLocalFrame(); // Capture local frame
        captureAndSendRemoteFrame(); // Capture remote frame
      }, 3000);
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
      webSocket.current = new WebSocket(
        `wss://b6cb-128-6-147-63.ngrok-free.app/ws/${roomId}`
      );
      webSocket.current.onmessage = handleSignalingData;
      startLocalStream();

      // Set the first caller flag when joining
      isFirstCaller.current = true;
    }
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
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
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );

          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);

          // Send the answer back to the signaling server
          webSocket.current?.send(JSON.stringify({ type: "answer", answer }));
        }
        break;
      case "answer":
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
        }
        break;
      case "candidate":
        if (data.candidate && peerConnection.current) {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
        break;

      case "sentence":
        // Receive the generated sentence and display it
        sentence.current = data.sentence;
        sentence1.current = -1;
        sentence2.current = -1;
        break;
    }
  };

  // Function to capture and send local video frame
  const captureAndSendLocalFrame = async () => {
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
          formData.append("file", blob, "local_frame.jpg"); // Differentiated file name

          try {
            const response = await axios.post(
              "https://b6cb-128-6-147-63.ngrok-free.app/api/upload-image/",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );
            console.log("Full sentence is:", sentence.current);
            console.log("currently gotten:", sentence1);

            if (response.status === 200) {
              const jsonResponse = await response.data;
              const { letter } = jsonResponse;

              const doneLetterCount = sentence1.current;
              if (doneLetterCount < sentence.current.length) {
                // Get the next letter needed
                const nextLetterNeeded = sentence.current[sentence1.current];
                if (letter === nextLetterNeeded) {
                  // Update sentence1 count since we found the next letter
                  sentence1.current += 1;
                  console.log("Updated letter count to:", sentence1.current);
                }
              }
              setUseless((prev) => !prev);
            } else {
              console.error(
                "Error in getting user1 progress:",
                response.statusText
              );
            }
          } catch (error) {
            console.error("Error uploading local frame:", error);
          }
        }
      }, "image/jpeg");
    }
  };

  // Function to capture and send remote video frame
  const captureAndSendRemoteFrame = async () => {
    if (!remoteVideoRef.current) return;

    const canvas = document.createElement("canvas");
    const video = remoteVideoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append("file", blob, "remote_frame.jpg"); // Differentiated file name

          try {
            const response = await axios.post(
              "https://b6cb-128-6-147-63.ngrok-free.app/api/upload-image/",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );
            console.log(response.data.message); // Log the response message

            if (response.status === 200) {
              const jsonResponse = await response.data;
              const { letter } = jsonResponse;

              const doneLetterCount = sentence2.current;
              if (doneLetterCount < sentence.current.length) {
                // Get the next letter needed
                const nextLetterNeeded = sentence.current[sentence2.current];
                if (letter === nextLetterNeeded) {
                  // Update sentence2 count since we found the next letter
                  sentence2.current += 1;
                  console.log("Updated letter count to:", sentence2.current);
                }
              }

              setUseless((prev) => !prev);
            } else {
              console.error(
                "Error in getting user2 progress:",
                response.statusText
              );
            }
          } catch (error) {
            console.error("Error uploading remote frame:", error);
          }
        }
      }, "image/jpeg");
    }
  };

  const createOffer = async () => {
    if (!peerConnection.current) return;

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    // Send the offer to the signaling server
    webSocket.current?.send(JSON.stringify({ type: "offer", offer }));

    // Trigger sentence generation after a short delay
    if (isFirstCaller.current) {
      setTimeout(() => {
        const generatedSentence = "Your generated sentence goes here!";
        sentence.current = generatedSentence;
        // Send the sentence to the other caller
        webSocket.current?.send(
          JSON.stringify({ type: "sentence", sentence: generatedSentence })
        );
      }, 3000); // 3-second delay (adjust as needed)
    }
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

            <h1>Sentence: {sentence.current}</h1>
            <h1>User 1: {sentence1.current}</h1>
            <h1>User 2: {sentence2.current}</h1>
            
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
                muted
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
