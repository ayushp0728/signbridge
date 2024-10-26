import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    const handleSignOut = () => {
        signOut(auth)
            .then(() => {
                // Sign-out successful, redirect to the sign-in page
                navigate("/signin");
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            });
    };

    return (
        <div>
            <h1>Profile</h1>
            <p>Here, you'll be able to manage your profile.</p>
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    );
};

export default Profile;
