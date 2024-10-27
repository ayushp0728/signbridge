import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Popup from './Popup';
import PartitionedProgressBar from './PartitionedProgressBar';

interface DashboardProps {
  points: string; // Receive points as a prop
  userName: string; // Receive user name as a prop
}

const Dashboard: React.FC<DashboardProps> = ({ points, userName }) => {
  const navigate = useNavigate();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [topicProgress, setTopicProgress] = useState([
    { label: 'Alphabet', percentage: 50 },
    { label: 'Numbers', percentage: 75 },
    { label: 'Common Phrases', percentage: 40 },
  ]);
  const individualLesson = "Alphabet"; // Example current lesson
  const partnerLesson = "Numbers"; // Example partner lesson
  const [percentage, setPercentage] = useState(0); // State for progress bar percentage
  const MAX_POINTS = 3600;

  useEffect(() => {
    const hasShownPopup = localStorage.getItem('hasShownPopup');
    if (!hasShownPopup) {
      setPopupOpen(true);
      localStorage.setItem('hasShownPopup', 'true');
    }

    // Convert points to a number and set the percentage
    const currentPoints = Number(points);
    const calculatedPercentage = (currentPoints / MAX_POINTS) * 100;

    // Animate fill-up by setting a timeout
    setPercentage(0); // Reset to 0 for animation
    setTimeout(() => {
      setPercentage(calculatedPercentage);
    }, 100); // Short delay before animation starts
  }, [points]); // Dependency on points to trigger animation when points change

  const handlePopupClose = () => {
    setPopupOpen(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to SignBridge, {userName}!</h1>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }} // Use percentage state for width
        />
      </div>
      <p>{Number(points)} / {MAX_POINTS} Points</p>

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
