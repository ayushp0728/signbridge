import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import "./SignIn.css";
import { auth } from "./FirebaseConfig";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User signed up:', userCredential.user);
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
        <div>
            <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
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
            <button onClick={toggleSignUp} className="toggle-button">
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
        </div>
    );
};

export default SignIn;
