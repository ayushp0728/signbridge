import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const Lobby = () => {
  const [roomLink, setRoomLink] = useState("");
  const [joinRoomId, setJoinRoomId] = useState(""); // State for joining room ID

  const createRoom = () => {
    const roomId = uuidv4(); // Generate a random room ID
    const link = `http://localhost:3000/room/${roomId}`; // Change the base URL as needed
    setRoomLink(link); // Set the room link in state

    // Open the new room link in a new tab after a delay
    setTimeout(() => {
      window.open(link, "_blank"); // Opens the link in a new tab
    }, 1000); // 1 second delay
  };

  const joinRoom = () => {
    const link = `http://localhost:3000/room/${joinRoomId}`; // Create the link with the entered ID
    window.open(link, "_blank"); // Open the link in a new tab
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={createRoom}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Create New Room
      </button>
      {roomLink && (
        <div className="mt-5 text-center">
          <p className="font-semibold">Room Link:</p>
          <a
            href={roomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {roomLink}
          </a>
        </div>
      )}

      <h2 className="mt-10 text-xl font-bold">Join a Room</h2>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={joinRoomId}
        onChange={(e) => setJoinRoomId(e.target.value)} // Update state on input change
        className="mt-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
      />
      <button
        onClick={joinRoom}
        disabled={!joinRoomId}
        className={`mt-2 px-4 py-2 rounded transition ${
          !joinRoomId ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
        } text-white`}
      >
        Join Room
      </button>
    </div>
  );
};

export default Lobby;
