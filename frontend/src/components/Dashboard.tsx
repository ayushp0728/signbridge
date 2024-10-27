// Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Popup from './Popup';
import PartitionedProgressBar from './PartitionedProgressBar';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [topicProgress, setTopicProgress] = useState([
    { label: 'Alphabet', percentage: 50 },
    { label: 'Numbers', percentage: 75 },
    { label: 'Common Phrases', percentage: 40 },
  ]);

  useEffect(() => {
    const hasShownPopup = localStorage.getItem('hasShownPopup');
    if (!hasShownPopup) {
      setPopupOpen(true);
      localStorage.setItem('hasShownPopup', 'true');
    }
  }, []);

  const handlePopupClose = () => {
    setPopupOpen(false);
  };

  return (
    <div className="dashboard">
 <div className="dashboard-header">
  <h1 className="dashboard-title">Welcome to SignBridge!</h1>
  <div className="profile-section">
    <div className="profile-picture">
      <img src="path/to/profile-picture.jpg" alt="User Profile" />
      <div className="profile-text-overlay">User Profile</div>
    </div>
  </div>
</div>

      <p>Select a mode to get started:</p>
      <div className="dashboard-links">
      <button onClick={() => navigate('/learning')}>Learning</button>
      <button onClick={() => navigate('/partner-mode')}>Partner Mode</button>
      </div>

      {/* Add the PartitionedProgressBar component */}
      <PartitionedProgressBar topics={topicProgress} />

      <Popup isOpen={isPopupOpen} onClose={handlePopupClose} />
    </div>
  );
};

export default Dashboard;
