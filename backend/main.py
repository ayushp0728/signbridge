import os
import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from firebase_config import create_user
import random, string
import firebase_admin
from firebase_admin import firestore, credentials, auth
from model import model_pipeline


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update this to match your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)

db = firestore.client()

class SignUpRequest(BaseModel):
    uid: str
    email: str
    name: str  # Add the name field

class FriendRequest(BaseModel):
    senderUid: str
    friendId: str

class AcceptRequest(BaseModel):
    acceptingUid: str
    requestingUid: str

@app.post("/api/signup/")
async def sign_up(sign_up_request: SignUpRequest):
    try:
        user = create_user(sign_up_request.email, sign_up_request.password)
        return {"message": "User created successfully", "uid": user.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.post("/api/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    # Ensure the uploaded file is a JPEG
    if file.content_type != "image/jpeg":
        raise HTTPException(status_code=400, detail="File must be a JPEG image.")

    # Save the image to the root folder
    try:
        result = model_pipeline(file)
        print(result)

        return {"status": 200, "letter": result[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Function to generate a unique friend ID
def createFriendID():
    numbers = ''.join(random.choices(string.digits, k=4))
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    return numbers + letters

# Endpoint to add user data to the database
@app.post("/api/database/")
async def add_to_database(sign_up_request: SignUpRequest):
    friend_id = createFriendID()
    
    # Here, replace this part with code to store `user_document` in your actual database.
    db.collection("users").document(sign_up_request.uid).set({
        "email": sign_up_request.email,
        "name": sign_up_request.name,
        "friend_id": friend_id
    })
    
    return {"message": "User added to the database successfully", "friend_id": friend_id}

@app.post("/api/send_friend_request/")
async def send_friend_request(request: FriendRequest):
    # Get the friend by friendId
    friend_query = db.collection('users').where('friend_id', '==', request.friendId).get()
    if not friend_query:
        raise HTTPException(status_code=404, detail="Friend ID not found.")

    friend_doc = friend_query[0]
    friend_uid = friend_doc.id

    # Add sender's uid to the friend's sentRequests subcollection
    db.collection('users').document(friend_uid).collection('friends').document('sentRequests').set({
        request.senderUid: True  # Mark as a pending request
    }, merge=True)

    return {"message": "Friend request sent successfully."}

@app.post("/api/accept_friend_request/")
async def accept_friend_request(request: AcceptRequest):
    # Add requesting user to accepting user's acceptedFriends
    db.collection('users').document(request.acceptingUid).collection('friends').document('acceptedFriends').set({
        request.requestingUid: True
    }, merge=True)

    # Add accepting user to requesting user's acceptedFriends
    db.collection('users').document(request.requestingUid).collection('friends').document('acceptedFriends').set({
        request.acceptingUid: True
    }, merge=True)

    # Remove from sentRequests
    db.collection('users').document(request.acceptingUid).collection('friends').document('sentRequests').update({
        request.requestingUid: firestore.DELETE_FIELD
    })

    return {"message": "Friend request accepted successfully."}


# Keep track of users in each room
rooms: Dict[str, List[WebSocket]] = {}

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    if room_id not in rooms:
        rooms[room_id] = []
    rooms[room_id].append(websocket)

    # Notify all clients in the room of the new user count
    await notify_user_count(room_id)

    try:
        while True:
            data = await websocket.receive_text()
            for client in rooms[room_id]:
                if client != websocket:
                    await client.send_text(data)
    except WebSocketDisconnect:
        rooms[room_id].remove(websocket)
        # Notify remaining clients of the updated user count
        await notify_user_count(room_id)

async def notify_user_count(room_id: str):
    user_count = len(rooms[room_id])
    for client in rooms[room_id]:
        await client.send_text(f'{{"type": "user_count", "count": {user_count}}}')