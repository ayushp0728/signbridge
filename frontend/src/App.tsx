import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PartnerMode from "./components/PartnerMode";
import Learning from "./components/Learning";
import Navbar from "./components/Navbar";
import Lobby from "./components/Lobby";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Add the Navbar here */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/partner-mode" element={<PartnerMode />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/lobby" element={<Lobby />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
