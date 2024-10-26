import firebase_admin
from firebase_admin import credentials, auth, firestore

# Initialize Firebase app
cred = credentials.Certificate('signbridge-a714f-firebase-adminsdk-y1qob-7de091837e.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def add_to_db(uid: str, email: str, friend_id: int):
    """Function to add a user to the Firestore database."""
    db.collection("users").document(uid).set({
        "email": email,
        "friend_id": friend_id
    })
    return "User added to Firestore."

def create_user(email: str, password: str):
    """Create a new user in Firebase Authentication."""
    user = auth.create_user(email=email, password=password)
    return f"User created with UID: {user.uid}"

def verify_token(token: str):
    """Verify the user's ID token."""
    decoded_token = auth.verify_id_token(token)
    return decoded_token

# Main block for testing
if __name__ == "__main__":
    # Test variables (you can change these for testing)
    test_uid = "12345"
    test_email = "ayushpateltesting@gmail.com"
    test_friend_id = 1234
    test_password = "testPassword123"

    # Call add_to_db function
    result = add_to_db(test_uid, test_email, test_friend_id)
    print(result)  # Output: User added to Firestore.
    
    # Optional: Test user creation
    # Uncomment if you want to test Firebase user creation.
    # user_result = create_user(test_email, test_password)
    # print(user_result)  # Output: User created with UID: <UID>
