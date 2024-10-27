import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PartnerMode from "./components/PartnerMode";
import Learning from "./components/Learning";
import Navbar from "./components/Navbar";
import SignIn from "./components/SignIn";
import LearningRoom from "./components/LearningRoom";
import Lobby from "./components/Lobby2";
import { useAuth } from "./components/AuthContext";
import Profile from "./components/Profile";
import Friends from "./components/Friends";
import LearningRoomB from "./components/LearningRoomB";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import './global.css';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [points, setPoints] = useState<string>('0'); // State to store user points
  const [userName, setUserName] = useState<string>(''); // State to store user name

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const auth = getAuth();
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid); // Assuming `user.uid` exists
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const { points, name } = userDoc.data();
          setPoints(points || '0'); // Set points from Firestore or fallback to '0'
          setUserName(name || "No Name"); // Set name from Firestore or fallback
        }
      }
    };

    fetchUserData();
  }, [user]); // Fetch user data when the user changes

  if (loading) {
    return <div>Loading...</div>; // You can show a loading spinner here
  }

  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Add the Navbar here */}
        <Routes>
          <Route
            path="/"
            element={user ? <Dashboard points={points} userName={userName} /> : <Navigate to="/signin" />}
          />
          <Route
            path="/partner-mode"
            element={user ? <PartnerMode /> : <Navigate to="/signin" />}
          />
          <Route
            path="/learning"
            element={user ? <Learning /> : <Navigate to="/signin" />}
          />
          <Route path="/learning/:index/" element={<LearningRoomB />} />

          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/signin" />}
          />
          <Route
            path="/lobby"
            element={user ? <Lobby /> : <Navigate to="/signin" />}
          />
          <Route
            path="/friend"
            element={user ? <Friends /> : <Navigate to="/signin" />}
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/friends" element={<Friends />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
