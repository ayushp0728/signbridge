import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import "./SignIn.css";
import { auth } from "./FirebaseConfig";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // New state for the user's name
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up
  const navigate = useNavigate();

  // Function to handle sign-in
  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed in:", userCredential.user);
      navigate("/"); // Redirect to the dashboard after successful sign-in
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  // Function to handle sign-up
  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', userCredential.user);

      // Send user data to FastAPI backend
      const response = await fetch('https://b6cb-128-6-147-63.ngrok-free.app/api/database/', { // FastAPI endpoint with trailing slash
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: name, // Include name in the request body
        }),
      });

      if (!response.ok) {
        throw new Error(`Error from backend: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Data from FastAPI backend:", data); // Log the response from FastAPI

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
    <div className="sign-in-container"> {/* Add a class for centering */}
      <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
      <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
        {isSignUp && ( // Only show the name field during sign-up
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
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
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="toggle-button-container"> {/* New container for centering */}
        <button onClick={toggleSignUp} className="toggle-button">
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default SignIn;
