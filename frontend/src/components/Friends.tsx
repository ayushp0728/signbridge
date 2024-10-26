import React, { useState } from 'react';

const Friends: React.FC = () => {
    const [friendId, setFriendId] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleSendRequest = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/send_friend_request/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ senderUid: 'currentUserUid', friendId }),
            });

            const data = await response.json();
            if (response.ok) {
                setStatusMessage(`Friend request sent to ${friendId}`);
            } else {
                setStatusMessage(data.error || 'An error occurred.');
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
            setStatusMessage('Failed to send friend request.');
        }
    };

    const handleAcceptRequest = async (requestingUid: string) => {
        try {
            const response = await fetch(`http://localhost:8000/api/accept_friend_request/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ acceptingUid: 'currentUserUid', requestingUid }),
            });

            if (response.ok) {
                setStatusMessage('Friend request accepted.');
            } else {
                const data = await response.json();
                setStatusMessage(data.error || 'An error occurred.');
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
            setStatusMessage('Failed to accept friend request.');
        }
    };

    return (
        <div>
            <h2>Friends</h2>
            <input
                type="text"
                placeholder="Enter friend ID"
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
            />
            <button onClick={handleSendRequest}>Send Friend Request</button>
            <p>{statusMessage}</p>
            {/* Logic to list received requests and allow accepting them */}
        </div>
    );
};

export default Friends;
