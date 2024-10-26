import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/test/")
            .then((response) => {
                setMessage(response.data.message);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, []);

    return (
        <div className="App">
            <h1>{message}</h1>
        </div>
    );
};

export default App;
