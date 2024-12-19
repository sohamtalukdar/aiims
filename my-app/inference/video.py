import cv2
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from retinaface import RetinaFace
from collections import Counter

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
video_path = '/home/soham/aiims/my-app/data/PT061224073714/video_1733467206460.webm'
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
classifier_model.load_state_dict(torch.load('/home/soham/aiims/my-app/models/aiims_picture_reading_25-oct-24_model1_model.pth'))

# Process Video
frames = extract_frames(video_path, fps_target=10)
faces = detect_faces(frames)
features = extract_features(cae_model, faces)
predictions, probabilities = classify_features(classifier_model, features)

# Get Most Common Prediction
most_common_label = get_most_common_prediction(predictions, class_mapping)
print(f"Most Common Predicted Class: {most_common_label}")
