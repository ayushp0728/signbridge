// Popup.tsx
import React, { useState } from 'react';
import './Popup.css';

interface Slide {
    title: string;
    content: string | React.ReactNode;
}

const slides: Slide[] = [
    {
        title: "Welcome to SignBridge!",
        content: "We are an American Sign Language learning website that helps people learn sign language in an easy and understandable manner. Please click the next button to continue!",
    },
    {
        title: "Purpose",
        content: "Our website aims to provide an engaging and accessible platform for learning American Sign Language, empowering individuals to communicate effectively and connect with the Deaf community!",
    },
    {
        title: "Modes",
        content: (
            <>
                Learning: Master the fundamentals of sign language in Learning Mode!
                <br />
                Partner: Challenge your friends in Partner Mode to sharpen your sign language skills while learning! 
            </>
        ),
    },
    {
        title: "View Current Page",
        content: "To check your current page, simply look at the popup bar at the top of the screen!",
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
