import React, { useState } from 'react';
import './Quickstart.css'; // Optional: Include CSS for styling

const Quickstart: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const slides = [
    {
      title: "Welcome to SignBridge!",
      content: "This platform helps you learn American Sign Language (ASL) through fun and interactive lessons.",
    },
    {
      title: "Navigating the Dashboard",
      content: "Use the navigation buttons to access Learning and Partner Mode features.",
    },
    {
      title: "Tracking Your Progress",
      content: "Your points and progress are displayed at the bottom of the dashboard.",
    },
    {
      title: "Starting Lessons",
      content: "Click on 'Learning' to begin your ASL lessons and improve your skills.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="quickstart-popup">
      <h2>{slides[currentSlide].title}</h2>
      <p>{slides[currentSlide].content}</p>

      <div className="quickstart-controls">
        <button onClick={prevSlide} disabled={currentSlide === 0}>
          Previous
        </button>
        <button onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
          Next
        </button>
      </div>

      <button className="close-button" onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default Quickstart;
