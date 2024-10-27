import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "./Profile.css";

interface UserInfo {
  name: string;
  email: string;
  points: string;
  friend_id: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid); // Still referencing 'users' collection
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Get data from Firestore or fallback to auth data
          const { name, points, friend_id } = userDoc.data();
          setUserInfo({
            name: name || user.displayName || "No Name",
            email: user.email || "No Email",
            points: points || "0",
            friend_id: friend_id || "No Friend ID",
          });
        } else {
          // Fallback to just auth data if Firestore data doesn't exist
          setUserInfo({
            name: user.displayName || "No Name",
            email: user.email || "No Email",
            points: "0",
            friend_id: "No Friend ID",
          });
        }
      }
    };

    fetchUserInfo();
  }, [auth, db]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/signin");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className="container">
      <div className="profile-container">
        <h1>Profile</h1>
        {userInfo ? (
          <div className="profile-info">
            <p>
              <strong>Name:</strong> {userInfo.name}
            </p>
            <p>
              <strong>Email:</strong> {userInfo.email}
            </p>
            <p>
              <strong>Points:</strong> {userInfo.points}
            </p>
            <p>
              <strong>Friend ID:</strong> {userInfo.friend_id}
            </p>
          </div>
        ) : (
          <p className="loading-message">Loading user information...</p>
        )}
        <button className="button" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
