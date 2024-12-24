import cv2
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from retinaface import RetinaFace
from collections import Counter
import mysql.connector
import json
import os

# Load configuration file
with open("config.json", 'r') as f:
    config = json.load(f)

# Database connection helper
def save_video_result_to_db(patient_id, video_result):
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Bharat@1947",
        database="aiims"
    )
    cursor = db.cursor()
    query = """
        INSERT INTO model_inference (patientId, videoResult)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE
            videoResult = COALESCE(VALUES(videoResult), videoResult);
    """
    cursor.execute(query, (patient_id, video_result))
    db.commit()
    cursor.close()
    db.close()


# Helper function to find the latest video file
def get_latest_video_file(parent_folder):
    subfolders = [os.path.join(parent_folder, subfolder) for subfolder in os.listdir(parent_folder) if os.path.isdir(os.path.join(parent_folder, subfolder))]
    if not subfolders:
        raise ValueError("No subfolders found in the parent folder.")

    latest_folder = max(subfolders, key=os.path.getctime)
    print(f"Latest folder detected: {latest_folder}")

    video_files = [os.path.join(latest_folder, file) for file in os.listdir(latest_folder) if file.endswith((".mp4", ".webm"))]
    if not video_files:
        raise ValueError("No video files found in the latest folder.")

    latest_video_file = max(video_files, key=os.path.getctime)
    print(f"Latest video file detected: {latest_video_file}")
    return latest_video_file

# Step 1: Extract Frames from Video and Process in Memory
def extract_frames(video_path, fps_target):
    cap = cv2.VideoCapture(video_path)
    fps_original = cap.get(cv2.CAP_PROP_FPS)
    frame_shift = int(fps_original // fps_target)

    print(f"Original FPS of {video_path}: {fps_original}")

    frames = []
    frame_count = 0
    success, frame = cap.read()
    while success:
        if frame_count % frame_shift == 0:
            frames.append(frame)
        success, frame = cap.read()
        frame_count += 1

    cap.release()
    print(f"Extracted {len(frames)} frames in memory.")
    return frames

# Step 2: Detect Faces and Store Cropped Faces in Memory
def detect_faces(frames):
    cropped_faces = []
    for frame in frames:
        faces = RetinaFace.detect_faces(frame)
        if faces:
            for face in faces.values():
                x1, y1, x2, y2 = face['facial_area']
                cropped_faces.append(frame[y1:y2, x1:x2])
    print(f"Detected {len(cropped_faces)} faces.")
    return cropped_faces

# Step 3: Define the Convolutional Autoencoder (CAE) Model
class CAE(nn.Module):
    def __init__(self):
        super(CAE, self).__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=4, stride=2, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 128, kernel_size=4, stride=2, padding=1),
            nn.ReLU(),
            nn.Conv2d(128, 256, kernel_size=4, stride=2, padding=1),
            nn.ReLU()
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(64, 3, kernel_size=4, stride=2, padding=1),
            nn.Sigmoid()
        )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return encoded, decoded

# Step 4: Feature Extraction using CAE
def extract_features(cae_model, faces):
    cae_model.eval()
    features = []
    for face in faces:
        face_resized = cv2.resize(face, (96, 96))
        face_normalized = face_resized.astype(np.float32) / 255.0
        face_tensor = torch.from_numpy(face_normalized).permute(2, 0, 1).unsqueeze(0)
        with torch.no_grad():
            encoded, _ = cae_model(face_tensor)
        features.append(encoded.squeeze().cpu().numpy())
    print("Feature extraction completed in memory.")
    return features

# Step 5: Define Classifier Model
class Classifier(nn.Module):
    def __init__(self, input_size, num_classes):
        super(Classifier, self).__init__()
        self.fc1 = nn.Linear(input_size, 128)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        x = x.view(x.size(0), -1)
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x

# Step 6: Classification and Predictions
def classify_features(classifier_model, features):
    classifier_model.eval()
    features_tensor = torch.tensor(features, dtype=torch.float32)
    with torch.no_grad():
        outputs = classifier_model(features_tensor)
        probabilities = F.softmax(outputs, dim=-1)
        predictions = torch.argmax(probabilities, dim=-1)
    return predictions, probabilities

# Step 7: Aggregate Predictions
def get_most_common_prediction(predictions, class_mapping):
    prediction_counts = Counter(predictions.tolist())
    most_common_prediction = prediction_counts.most_common(1)[0][0]  # Get the most common prediction
    return class_mapping[most_common_prediction]

# Example Workflow
parent_folder = config["parent_folder"]
class_mapping = {
    0: 'Dementia',
    1: 'MCI',
    2: 'Normal'
}

# Load Models
cae_model = CAE()
dummy_input = torch.randn(1, 3, 96, 96)
dummy_encoded, _ = cae_model(dummy_input)
input_size = dummy_encoded.numel()

classifier_model = Classifier(input_size=input_size, num_classes=3)
model_path = config["video_model"]
classifier_model.load_state_dict(torch.load(model_path))

def main():
    try:
        # Dynamically get the latest video file
        video_path = get_latest_video_file(parent_folder)
        patient_id = os.path.basename(os.path.dirname(video_path))
        save_video_result_to_db(patient_id, most_common_label)
        frames = extract_frames(video_path, fps_target=10)
        faces = detect_faces(frames)
        features = extract_features(cae_model, faces)
        predictions, probabilities = classify_features(classifier_model, features)

        # Get Most Common Prediction
        most_common_label = get_most_common_prediction(predictions, class_mapping)
        print(f"Most Common Predicted Class: {most_common_label}")

        # Save result to database
        save_video_result_to_db(patient_id, most_common_label)
    except Exception as e:
        print(f"Error: {e}")
        save_video_result_to_db(patient_id, None)

if __name__ == "__main__":
    main()
