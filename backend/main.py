import os
import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from firebase_config import create_user
from model import model_pipeline


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

@app.post("/api/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    # Ensure the uploaded file is a JPEG
    if file.content_type != "image/jpeg":
        raise HTTPException(status_code=400, detail="File must be a JPEG image.")

    # Save the image to the root folder
    try:
        result = model_pipeline(file)
        print(result)

        return {"message": "Image uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
