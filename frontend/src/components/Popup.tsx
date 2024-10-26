// Popup.tsx
import React, { useState } from 'react';
import './Popup.css'; // Import the CSS file for styles (optional)

interface Slide {
    title: string;
    content: string;
}

const slides: Slide[] = [
    {
        title: "Welcome to Our Dashboard!",
        content: "You are currently on: Your Website Name",
    },
    {
        title: "Purpose",
        content: "This website is designed to help you manage your schedule effectively.",
    },
    {
        title: "Modes",
        content: "Here are the modes available:",
    },
    {
        title: "View Mode",
        content: "See your current schedule.",
    },

];

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    if (!isOpen) return null;

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
        <div className="popup" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <span className="close-btn" onClick={onClose}>&times;</span>
                <h2>{slides[currentSlide].title}</h2>
                <p>{slides[currentSlide].content}</p>
                <div className="navigation">
                    <button onClick={prevSlide} disabled={currentSlide === 0}>&lt;</button>
                    <button onClick={nextSlide} disabled={currentSlide === slides.length - 1}>&gt;</button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
