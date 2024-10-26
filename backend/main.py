import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from firebase_config import create_user

app = FastAPI()

class SignUpRequest(BaseModel):
    email: str
    password: str

@app.post("/api/signup/")
async def sign_up(sign_up_request: SignUpRequest):
    try:
        user = create_user(sign_up_request.email, sign_up_request.password)
        return {"message": "User created successfully", "uid": user.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
