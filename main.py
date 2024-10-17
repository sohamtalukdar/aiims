from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from google.cloud import storage
import os

# FastAPI app initialization
app = FastAPI()

# MongoDB setup
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["mydatabase"]
users_collection = db["users"]

# GCP Storage initialization
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "/path/to/your-service-account-file.json"  # Update this path
storage_client = storage.Client()
bucket_name = "your-bucket-name"  # Replace with your GCP bucket name
bucket = storage_client.bucket(bucket_name)

class User(BaseModel):
    name: str
    age: int

# Upload file to GCP and return the public URL
async def upload_to_gcp(file: UploadFile, file_type: str):
    blob = bucket.blob(f"{file_type}/{file.filename}")
    blob.upload_from_file(file.file)
    return blob.public_url

@app.post("/upload/")
async def upload_file(user: User, video: UploadFile = File(...), audio: UploadFile = File(...)):
    # Upload files to Google Cloud Storage
    video_url = await upload_to_gcp(video, "video")
    audio_url = await upload_to_gcp(audio, "audio")
    
    # Store metadata in MongoDB
    new_user = {
        "name": user.name,
        "age": user.age,
        "video_url": video_url,
        "audio_url": audio_url
    }
    result = await users_collection.insert_one(new_user)

    return {
        "id": str(result.inserted_id),
        "video_url": video_url,
        "audio_url": audio_url
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
