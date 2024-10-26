import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import PartnerMode from './components/PartnerMode';
import Learning from './components/Learning';
import Navbar from './components/Navbar';
import SignIn from './components/SignIn';

// Your Firebase configuration
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

const App: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // You can show a loading spinner here
    }

    return (
        <Router>
            <div className="App">
                {/* Render Navbar only if user is authenticated */}
                {user && <Navbar />}
                <Routes>
                    <Route path="/" element={user ? <Dashboard /> : <Navigate to="/signin" />} />
                    <Route path="/partner-mode" element={user ? <PartnerMode /> : <Navigate to="/signin" />} />
                    <Route path="/learning" element={user ? <Learning /> : <Navigate to="/signin" />} />
                    <Route path="/signin" element={<SignIn />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
