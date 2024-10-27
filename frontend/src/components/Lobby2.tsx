import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import "./Lobby2.css"; // Import the CSS file

// Define a type for the achievements hashmap
type AchievementsMap = { [key: string]: number };

const Lobby = () => {
  const [userAchieved, setUserAchieved] = useState<AchievementsMap>({});
  const { user } = useAuth();

  useEffect(() => {
    const getUserAchievements = async () => {
      try {
        const response = await fetch(
          `https://b6cb-128-6-147-63.ngrok-free.app/api/get-user-achievements/${user?.uid}`,
          {
            method: "GET",
          }
        );

        if (response.ok) {
          const jsonResponse = await response.json();
          const { achievements } = jsonResponse;
          setUserAchieved(achievements);
        } else {
          console.error(
            "Error in getting user achievements:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error in getting user achievements:", error);
      }
    };

    getUserAchievements();
  }, []);

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Welcome to the Learning Rooms!</h1>
      <p className="lobby-description">
        Access your learning from our given categories!
      </p>

      {/* Characters Section */}
      <div className="lobby-section">
        <h2 className="lobby-subtitle">Characters</h2>
        <div className="lobby-grid">
          {Array.from({ length: 26 }, (_, i) => {
            const letter = String.fromCharCode(65 + i); // Convert index to letter (A-Z)
            const isGreen = userAchieved[letter] && userAchieved[letter] > 0;

            return (
              <a
                key={i}
                href={`/learning/${i}`}
                className={`lobby-button ${isGreen ? "green-button" : ""}`} // Apply green-button class conditionally
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {letter}
              </a>
            );
          })}
        </div>
      </div>

      {/* Digits Section */}
      <div className="lobby-section">
        <h2 className="lobby-subtitle">Digits</h2>
        <div className="lobby-grid">
          {Array.from({ length: 10 }, (_, i) => {
            const digit = i.toString();
            const isGreen = userAchieved[digit] && userAchieved[digit] > 0;

            return (
              <a
                key={i + 26}
                href={`/learning/${i + 26}`}
                className={`lobby-button ${isGreen ? "green-button" : ""}`} // Apply green-button class conditionally
                style={{ animationDelay: `${(i + 26) * 0.1}s` }}
              >
                {digit}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
