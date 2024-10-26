import firebase_admin
from firebase_admin import credentials, auth, firestore

# Path to your service account key file
cred = credentials.Certificate('signbridge-a714f-firebase-adminsdk-y1qob-7de091837e.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

def create_user(email: str, password: str):
    """Create a new user in Firebase."""
    return auth.create_user(email=email, password=password)

def verify_token(token: str):
    """Verify the user's ID token."""
    return auth.verify_id_token(token)
