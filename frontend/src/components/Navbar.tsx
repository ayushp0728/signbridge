import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Optional: for styling

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link to="/">Dashboard</Link>
                    <Link to="/learning">Learning</Link>
                    <Link to="/partner-mode">Partner Mode</Link>
                    <Link to="/lobby">Lobby</Link>
                    <Link to="/profile">Profile</Link>
                    <Link to="/friends">Friends</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
