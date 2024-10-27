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
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # Update this to match your frontend's URL
#     allow_credentials=True,
#     allow_methods=["*"],  # Allows all HTTP methods (GET, POST, OPTIONS, etc.)
#     allow_headers=["*"],  # Allows all headers
# )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for tighter security if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


db = firestore.client()

class CompletedLessonRequest(BaseModel):
    letter: str

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
    print("Called")
    friend_id = createFriendID()
    print(friend_id)
    # Here, replace this part with code to store `user_document` in your actual database.
    db.collection("users").document(sign_up_request.uid).set({
        "email": sign_up_request.email,
        "name": sign_up_request.name,
        "friend_id": friend_id,
        "points": 0
    })
    
    return {"message": "User added to the database successfully", "friend_id": friend_id}

class FriendRequest(BaseModel):
    senderUid: str
    friendId: str

class AcceptRequest(BaseModel):
    acceptingUid: str
    requestingUid: str

@app.post("/api/send_friend_request/")
async def send_friend_request(request: FriendRequest):
    # Get the friend by friend_id
    friend_query = db.collection('users').where('friend_id', '==', request.friendId).get()
    if not friend_query:
        raise HTTPException(status_code=404, detail="Friend ID not found.")

    friend_doc = friend_query[0]
    friend_uid = friend_doc.id

    # Add sender's UID to the friend's incomingRequests subcollection
    db.collection('users').document(friend_uid).collection('friends').document('incomingRequests').set({
        request.senderUid: True  # Mark as a pending request
    }, merge=True)

    # Add friend's UID to sender's sentRequests subcollection
    db.collection('users').document(request.senderUid).collection('friends').document('sentRequests').set({
        friend_uid: True  # Mark as a sent request
    }, merge=True)

    return {"message": "Friend request sent successfully."}

@app.post("/api/accept_friend_request/")
async def accept_friend_request(request: AcceptRequest):
    # Move requesting user from incomingRequests to friends for accepting user
    db.collection('users').document(request.acceptingUid).collection('friends').document('friends').set({
        request.requestingUid: True
    }, merge=True)

    # Move accepting user from sentRequests to friends for requesting user
    db.collection('users').document(request.requestingUid).collection('friends').document('friends').set({
        request.acceptingUid: True
    }, merge=True)

    # Remove from incomingRequests for accepting user
    db.collection('users').document(request.acceptingUid).collection('friends').document('incomingRequests').update({
        request.requestingUid: firestore.DELETE_FIELD
    })

    # Remove from sentRequests for requesting user
    db.collection('users').document(request.requestingUid).collection('friends').document('sentRequests').update({
        request.acceptingUid: firestore.DELETE_FIELD
    })

    return {"message": "Friend request accepted successfully."}

@app.get("/api/get_incoming_requests/{user_uid}")
async def get_incoming_requests(user_uid: str):
    # Fetch incoming friend requests for the user
    incoming_requests = db.collection('users').document(user_uid).collection('friends').document('incomingRequests').get()
    return list(incoming_requests.to_dict().keys()) if incoming_requests.exists else []

@app.get("/api/get_sent_requests/{user_uid}")
async def get_sent_requests(user_uid: str):
    # Fetch sent friend requests for the user
    sent_requests = db.collection('users').document(user_uid).collection('friends').document('sentRequests').get()
    return list(sent_requests.to_dict().keys()) if sent_requests.exists else []

@app.get("/api/get_friends/{user_uid}")
async def get_friends(user_uid: str):
    # Fetch accepted friends for the user
    friends = db.collection('users').document(user_uid).collection('friends').document('friends').get()
    return list(friends.to_dict().keys()) if friends.exists else []

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

@app.post("/api/log-correct-answer/{uid}")
async def log_correct_answer(uid: str, completed_lesson: CompletedLessonRequest):
    # Reference to the user document in Firestore
    user_ref = db.collection("users").document(uid)

    # Fetch the user document
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    # Get the existing hashmap for completed lessons, or initialize an empty one
    user_data = user_doc.to_dict()
    completed_lessons = user_data.get("completed_lessons", {})
    points = user_data.get("points", 0)

    # Increment the count for the lesson letter
    letter = completed_lesson.letter
    if letter in completed_lessons:
        completed_lessons[letter] += 1
    else:
        completed_lessons[letter] = 1
        points += 100  # Increment points if it's a new key


    # Update the document in Firestore with the updated hashmap
    user_ref.update({
        "completed_lessons": completed_lessons,         
        "points": points
    })

    return {
        "status": "success",
        "message": "Logged successfully",
        "completed_lessons": completed_lessons,
        "points": points
    }

@app.get("/api/get-user-achievements/{uid}")
async def get_user_achievements(uid: str):
    user_ref = db.collection("users").document(uid)

    # Fetch the user document
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    # Get the existing hashmap for completed lessons, or initialize an empty one
    completed_lessons = user_doc.to_dict().get("completed_lessons", {})
    print(completed_lessons)
    return {
        "status": "success",
        "message": "Logged successfully",
        "achievements": completed_lessons
    }
