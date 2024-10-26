import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Popup from './Popup'; // Adjust the path if necessary


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isPopupOpen, setPopupOpen] = useState(true); // Control the popup state

    const handlePopupClose = () => {
        setPopupOpen(false);
    };

  return (
    <div className="dashboard">
      <h1>Welcome to the Dashboard</h1>
      <p>Select a mode to get started:</p>
      <div className="dashboard-links">
        <button onClick={() => navigate('/partner-mode')}>Partner Mode</button>
        <button onClick={() => navigate('/learning')}>Learning</button>
      </div>
      <Popup isOpen={isPopupOpen} onClose={handlePopupClose} />
    </div>
  );
};

export default Dashboard;
