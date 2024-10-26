import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Optional: for styling

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link to="/">Dashboard</Link>
                </li>
                <li>
                    <Link to="/partner-mode">Partner Mode</Link>
                </li>
                <li>
                    <Link to="/learning">Learning</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
