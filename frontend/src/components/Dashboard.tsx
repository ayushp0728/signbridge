// Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Popup from './Popup';
import PartitionedProgressBar from './PartitionedProgressBar';

interface DashboardProps {
  points: string; // Accept points as a prop
}

const Dashboard: React.FC<DashboardProps> = ({ points }) => {
  const navigate = useNavigate();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [topicProgress, setTopicProgress] = useState([
    { label: 'Alphabet', percentage: 50 },
    { label: 'Numbers', percentage: 75 },
    { label: 'Common Phrases', percentage: 40 },
  ]);
  const username = "John Doe"; // Example username
  const individualLesson = "Alphabet"; // Example current lesson
  const partnerLesson = "Numbers"; // Example partner lesson

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
        <h1 className="dashboard-title">Welcome to SignBridge, {username}!</h1>
      </div>

      <div className="user-points">Points: {points}</div> {/* Use points from props */}

      <div className="lesson-section">
        <div className="lesson-card">
          <h2>Individual Lesson</h2>
          <p>Current Lesson: {individualLesson}</p>
        </div>
        <div className="lesson-card">
          <h2>Partner Lesson</h2>
          <p>Current Lesson: {partnerLesson}</p>
        </div>
      </div>

      <div className="dashboard-links">
        <button onClick={() => navigate('/learning')}>Learning</button>
        <button onClick={() => navigate('/partner-mode')}>Partner Mode</button>
      </div>

      <PartitionedProgressBar topics={topicProgress} />

      <Popup isOpen={isPopupOpen} onClose={handlePopupClose} />
    </div>
  );
};

export default Dashboard;
