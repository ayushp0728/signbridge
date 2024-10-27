import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { firestore } from "./FirebaseConfig";
import { collection, doc, getDoc } from "firebase/firestore";
import './Lobby2.css'; // Import the CSS file

const Lobby = () => {
  const [roomLink, setRoomLink] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Welcome to the Learning Rooms!</h1>
      <p className="lobby-description">Access your learning from our given categories!</p>

      {/* Characters Section */}
      <div className="lobby-section">
        <h2 className="lobby-subtitle">Characters</h2>
        <div className="lobby-grid">
          {Array.from({ length: 26 }, (_, i) => (
            <a
              key={i}
              href={`/learning/${i}`}
              className="lobby-button"
              style={{ animationDelay: `${i * 0.1}s` }} // Staggering animation
            >
              {String.fromCharCode(65 + i)}
            </a>
          ))}
        </div>
      </div>

      {/* Digits Section */}
      <div className="lobby-section">
        <h2 className="lobby-subtitle">Digits</h2>
        <div className="lobby-grid">
          {Array.from({ length: 10 }, (_, i) => (
            <a
              key={i + 26}
              href={`/learning/${i + 26}`}
              className="lobby-button"
              style={{ animationDelay: `${(i + 26) * 0.1}s` }} // Staggering animation
            >
              {i}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
