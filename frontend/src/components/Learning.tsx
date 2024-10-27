import React from 'react';
import './Learning.css'; // Import the CSS file for styles

const Learning: React.FC = () => {
    return (
        <div className="learning-container">
            <h1 className="learning-title">Learning Sign Language</h1>
            <p className="learning-description">
                This is where you’ll find sign language lessons and tutorials!
            </p>
            <div className="learning-tree">
                <h2>Learning Steps</h2>
                <ul className="tree">
                    <li>
                        <div className="step">Basics</div>
                        <ul>
                            <li className="sub-node">Alphabet</li>
                            <li className="sub-node">Numbers</li>
                            <li className="sub-node">Common Phrases</li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Learning;
