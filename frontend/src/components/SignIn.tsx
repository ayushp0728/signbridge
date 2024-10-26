import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import './SignIn.css';

// Firebase configuration (consider moving this to a separate config file)
const firebaseConfig = {
    apiKey: process.env.REACT_APP_PUBLIC_API_KEY,
    authDomain: process.env.REACT_APP_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up
    const navigate = useNavigate();

    // Function to handle sign-in
    const handleSignIn = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User signed in:', userCredential.user);
            navigate('/'); // Redirect to the dashboard after successful sign-in
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unknown error occurred.');
            }
        }
    };

    // Function to handle sign-up
    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User signed up:', userCredential.user);

            // Send user data to FastAPI backend
            await fetch('http://localhost:8000/api/database', { // Replace with your FastAPI endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                }),
            });

            navigate('/'); // Redirect to the dashboard after successful sign-up
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unknown error occurred.');
            }
        }
    };

    // Toggle between Sign In and Sign Up
    const toggleSignUp = () => {
        setIsSignUp(!isSignUp);
        setError(null); // Clear errors when toggling
    };

    return (
        <div className="container">
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
                <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
                {error && <p className="error-message">{error}</p>}
                <button onClick={toggleSignUp} className="toggle-button">
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
            </form>
        </div>
    );    
};

export default SignIn;
