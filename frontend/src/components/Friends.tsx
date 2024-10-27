import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './Friends.css';

const Friends: React.FC = () => {
    const [friendId, setFriendId] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [incomingRequests, setIncomingRequests] = useState<string[]>([]);
    const [sentRequests, setSentRequests] = useState<string[]>([]);
    const [friends, setFriends] = useState<string[]>([]);
    const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
    const [displayFriendId, setDisplayFriendId] = useState<string | null>(null);
    const [userNames, setUserNames] = useState<{ [uid: string]: string }>({}); // Store user names
    

    useEffect(() => {
        const fetchCurrentUserId = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                setCurrentUserUid(user.uid);
                const db = getFirestore();
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const { friend_id } = userDoc.data();
                    setDisplayFriendId(friend_id || 'No Friend ID');
                } else {
                    console.error("User document does not exist.");
                }
            }
        };

        fetchCurrentUserId();
    }, []);

    useEffect(() => {
        const fetchFriendData = async () => {
            if (!currentUserUid) return;

            try {
                const requestsResponse = await fetch(`https://b6cb-128-6-147-63.ngrok-free.app/api/get_incoming_requests/${currentUserUid}`);
                const requestsData = await requestsResponse.json();
                setIncomingRequests(requestsData);

                const sentResponse = await fetch(`https://b6cb-128-6-147-63.ngrok-free.app/api/get_sent_requests/${currentUserUid}`);
                const sentData = await sentResponse.json();
                setSentRequests(sentData);

                const friendsResponse = await fetch(`https://b6cb-128-6-147-63.ngrok-free.app/api/get_friends/${currentUserUid}`);
                const friendsData = await friendsResponse.json();
                setFriends(friendsData);

                // Fetch user names for incoming requests and friends
                const allUids = [...requestsData, ...sentData, ...friendsData];
                const namesPromises = allUids.map(async (uid) => {
                    const userDocRef = doc(getFirestore(), 'users', uid);
                    const userDoc = await getDoc(userDocRef);
                    return { uid, name: userDoc.exists() ? userDoc.data()?.name : uid }; // Replace 'name' with the actual field name
                });

                const names = await Promise.all(namesPromises);
                const namesMap = names.reduce((acc, { uid, name }) => {
                    acc[uid] = name;
                    return acc;
                }, {} as { [uid: string]: string });

                setUserNames(namesMap);

            } catch (error) {
                console.error('Error fetching friend data:', error);
            }
        };

        fetchFriendData();
    }, [currentUserUid]);

    const handleSendRequest = async () => {
        if (!friendId) return;

        try {
            const response = await fetch('https://b6cb-128-6-147-63.ngrok-free.app/api/send_friend_request/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ senderUid: currentUserUid, friendId }),
            });

            const data = await response.json();
            if (response.ok) {
                setStatusMessage(`Friend request sent to ${userNames[friendId] || friendId}`);
                setFriendId('');
                setSentRequests((prev) => [...prev, friendId]);
            } else {
                setStatusMessage(data.detail || 'An error occurred.');
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
            setStatusMessage('Failed to send friend request.');
        }
    };

    const handleAcceptRequest = async (requestingUid: string) => {
        try {
            const response = await fetch('https://b6cb-128-6-147-63.ngrok-free.app/api/accept_friend_request/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ acceptingUid: currentUserUid, requestingUid }),
            });

            if (response.ok) {
                setStatusMessage('Friend request accepted.');
                setIncomingRequests((prev) => prev.filter(uid => uid !== requestingUid));
                setFriends((prev) => [...prev, requestingUid]);
            } else {
                const data = await response.json();
                setStatusMessage(data.detail || 'An error occurred.');
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
            setStatusMessage('Failed to accept friend request.');
        }
    };

    const handleDeclineRequest = async (requestingUid: string) => {
        try {
            const response = await fetch('https://b6cb-128-6-147-63.ngrok-free.app/api/decline_friend_request/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ acceptingUid: currentUserUid, requestingUid }),
            });

            if (response.ok) {
                setStatusMessage('Friend request declined.');
                setIncomingRequests((prev) => prev.filter(uid => uid !== requestingUid));
            } else {
                const data = await response.json();
                setStatusMessage(data.detail || 'An error occurred.');
            }
        } catch (error) {
            console.error('Error declining friend request:', error);
            setStatusMessage('Failed to decline friend request.');
        }
    };

    return (
        <div className="friends-page"> {/* Add the class here */}
            <h2>Friends</h2>
            <p>Your Friend ID: {displayFriendId}</p>
            <div>
                <input
                    type="text"
                    placeholder="Enter friend ID to send request"
                    value={friendId}
                    onChange={(e) => setFriendId(e.target.value)}
                />
                <button onClick={handleSendRequest}>Send Friend Request</button>
            </div>
            <p>{statusMessage}</p>
    
            <h3>Incoming Friend Requests</h3>
            <ul>
                {incomingRequests.map((uid) => (
                    <li key={uid}>
                        {userNames[uid] || uid} 
                        <button onClick={() => handleAcceptRequest(uid)}>Accept</button>
                        <button onClick={() => handleDeclineRequest(uid)}>Decline</button>
                    </li>
                ))}
            </ul>
    
            <h3>Sent Friend Requests</h3>
            <ul>
                {sentRequests.map((uid) => (
                    <li key={uid}>{userNames[uid] || uid}</li>
                ))}
            </ul>
    
            <h3>Friends</h3>
            <ul>
                {friends.map((uid) => (
                    <li key={uid}>{userNames[uid] || uid}</li>
                ))}
            </ul>
        </div>
    );
    
};

export default Friends;
