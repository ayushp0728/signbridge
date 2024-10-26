import React from "react";
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
import Lobby from "./components/Lobby";
import { useAuth } from "./components/AuthContext";

const App: React.FC = () => {
  const { user, loading } = useAuth();

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
            element={user ? <Dashboard /> : <Navigate to="/signin" />}
          />
          <Route
            path="/partner-mode"
            element={user ? <PartnerMode /> : <Navigate to="/signin" />}
          />
          <Route
            path="/learning"
            element={user ? <Learning /> : <Navigate to="/signin" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/signin" />}
          />
          <Route
            path="/lobby"
            element={user ? <Lobby /> : <Navigate to="/signin" />}
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/:roomid" element={<LearningRoom />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
