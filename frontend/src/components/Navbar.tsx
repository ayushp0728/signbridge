import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Optional: for styling

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link to="/">Dashboard</Link>
                    <Link to="/partner-mode">Partner Mode</Link>
                    <Link to="/lobby">Learning Rooms</Link>
                    <Link to="/friends">Friends</Link>
                    <Link to="/profile">Profile</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
