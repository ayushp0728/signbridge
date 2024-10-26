import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const Lobby = () => {
  const [roomLink, setRoomLink] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const createRoom = () => {
    const roomId = uuidv4();
    const link = `http://localhost:3000/room/${roomId}`;
    setRoomLink(link);

    setTimeout(() => {
      window.open(link, "_blank");
    }, 1000);
  };

  const joinRoom = () => {
    const link = `http://localhost:3000/room/${joinRoomId}`;
    window.open(link, "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-10 text-pastel-light-blue">
        Create or Join a Room
      </h1>

      <div className="flex space-x-10 bg-white p-10 rounded-lg shadow-lg">
        
        {/* Create Room Section */}
        <div className="flex flex-col justify-center items-center p-6 bg-pastel-light-pink rounded-lg shadow-md">
          <button
            onClick={createRoom}
            className="px-6 py-3 bg-pastel-light-blue text-white rounded-lg hover:bg-blue-400 transition font-semibold"
          >
            Create New Room
          </button>
          {roomLink && (
            <div className="mt-6 text-center">
              <p className="font-semibold text-gray-700">Room Link:</p>
              <a
                href={roomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {roomLink}
              </a>
            </div>
          )}
        </div>

        {/* Join Room Section */}
        <div className="flex flex-col items-center p-6 bg-pastel-light-yellow rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Join a Room
          </h2>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className="w-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-light-blue mb-4 text-center"
          />
          <button
            onClick={joinRoom}
            disabled={!joinRoomId}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
              !joinRoomId ? "bg-gray-300" : "bg-pastel-light-green hover:bg-green-400"
            } text-white`}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
