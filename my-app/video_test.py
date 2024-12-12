import os
import cv2
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from retinaface import RetinaFace
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
# Step 1: Extract Frames from Video
def extract_frames_with_frameshift(video_path, output_folder, fps_target):
    cap = cv2.VideoCapture(video_path)
    fps_original = cap.get(cv2.CAP_PROP_FPS)
    frame_shift = int(fps_original // fps_target)  # Calculate FrameShift using RoundDown

    print(f"Original FPS of {video_path}: {fps_original}")

    os.makedirs(output_folder, exist_ok=True)
    frame_count = 0
    extracted_count = 0

    success, frame = cap.read()
    while success:
        if frame_count % frame_shift == 0:
            frame_path = os.path.join(output_folder, f"frame_{extracted_count}.jpg")
            cv2.imwrite(frame_path, frame)
            extracted_count += 1
        success, frame = cap.read()
        frame_count += 1

    cap.release()
    print(f"Extracted {extracted_count} frames with frame shift {frame_shift} from {video_path}")

# Step 2: Detect Faces in Frames and Crop
def detect_faces_in_frames_with_structure(extracted_frames_base, faces_output_base):
    for root, dirs, files in os.walk(extracted_frames_base):
        for file in files:
            if file.endswith('.jpg'):
                frame_path = os.path.join(root, file)
                relative_path = os.path.relpath(root, extracted_frames_base)
                faces_output_folder = os.path.join(faces_output_base, relative_path)
                os.makedirs(faces_output_folder, exist_ok=True)

                img = cv2.imread(frame_path)
                faces = RetinaFace.detect_faces(img)

                if faces:
                    for i, face in enumerate(faces.values()):
                        box = face['facial_area']
                        x1, y1, x2, y2 = box
                        cropped_face = img[y1:y2, x1:x2]
                        face_path = os.path.join(faces_output_folder, f"{file[:-4]}_face_{i}.jpg")
                        cv2.imwrite(face_path, cropped_face)

    print(f"Face detection completed. Faces are saved in {faces_output_base}")

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
            nn.Sigmoid()  # Assuming input is normalized between 0 and 1
        )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return encoded, decoded

# Step 4: Feature Extraction using CAE
def extract_features_with_cae(cae_model, faces_base, features_output_base):
    cae_model.eval()  # Set the model to evaluation mode
    for root, dirs, files in os.walk(faces_base):
        for file in files:
            if file.endswith('.jpg'):
                face_path = os.path.join(root, file)
                relative_path = os.path.relpath(root, faces_base)
                features_output_folder = os.path.join(features_output_base, relative_path)
                os.makedirs(features_output_folder, exist_ok=True)

                img = cv2.imread(face_path)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                (img, (96, 96))  # Resize to match CAE input size
                img = img.astype(np.float32) / 255.0  # Normalize to [0, 1]
                img_tensor = torch.from_numpy(img).permute(2, 0, 1).unsqueeze(0)  # Convert to tensor, shape (1, 3, 96, 96)

                with torch.no_grad():
                    encoded, _ = cae_model(img_tensor)  # Get the encoded features

                feature_path = os.path.join(features_output_folder, f"{file[:-4]}_features.npy")
                np.save(feature_path, encoded.cpu().numpy())  # Save the encoded features as a numpy array

    print(f"Feature extraction completed. Features are saved in {features_output_base}")

# Step 5: Load the trained Classifier model
class Classifier(nn.Module):
    def __init__(self, input_size, num_classes):
        super(Classifier, self).__init__()
        self.fc1 = nn.Linear(input_size, 128)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        x = x.view(x.size(0), -1)  # Flatten the input
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x

# Step 6: Load features and make predictions using the trained model
def load_features_and_predict(classifier_model, features_folder):
    classifier_model.eval()
    all_features = []
    for root, dirs, files in os.walk(features_folder):
        for file in sorted(files):
            if file.endswith('.npy'):
                feature_path = os.path.join(root, file)
                feature = np.load(feature_path)
                all_features.append(feature.squeeze())  # Assuming features have an extra dimension to remove
    features_tensor = torch.tensor(all_features, dtype=torch.float32)

    with torch.no_grad():
        outputs = classifier_model(features_tensor)
        probabilities = F.softmax(outputs, dim=-1)
        predictions = torch.argmax(probabilities, dim=-1)

    return predictions, probabilities

# Step 7: Save the predictions and class probabilities
def save_predictions_with_classes(predictions, probabilities, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    for i, (prediction, probability) in enumerate(zip(predictions, probabilities)):
        prediction_path = os.path.join(output_folder, f"sequence_{i}_prediction.npy")
        np.save(prediction_path, {
            'predicted_class': prediction.cpu().numpy(),
            'probabilities': probability.cpu().numpy()
        })
    print(f"Predictions with class labels saved in {output_folder}")

# Example Usage
video_path = '/home/jetson/aiims/my-app/data/PT061224073714/video_1733467206460.webm'
processed_folder_path = '/home/jetson/aiims/my-app/data/PT061224073714/processed_folder'  # Folder where processed videos are stored
output_folder_base = '/home/jetson/aiims/my-app/data/PT061224073714/frames'  # Folder for extracted frames
faces_output_base = '/home/jetson/aiims/my-app/data/PT061224073714/faces_detected'  # Folder for detected faces
features_output_base = '/home/jetson/aiims/my-app/data/PT061224073714/features_extracted'  # Folder for extracted features
output_folder = '/home/jetson/aiims/my-app/data/PT061224073714/classifier_predictions'  # Folder to save the predictions
weights_path = '/home/jetson/aiims/my-app/aiims_picture_reading_25-oct-24_model1_model.pth'  # Path to saved Classifier weights

# Define the class-to-number mapping
class_mapping = {
    'Dementia': 0,
    'MCI': 1,
    'Normal': 2
}

# Step 1: Extract frames
extract_frames_with_frameshift(video_path, output_folder_base, fps_target=10)

# Step 2: Detect and crop faces
detect_faces_in_frames_with_structure(output_folder_base, faces_output_base)

# Step 3: Load the CAE model and extract features
cae_model = CAE()
# Load pre-trained CAE weights if available
# cae_model.load_state_dict(torch.load('path_to_cae_weights.pth'))
extract_features_with_cae(cae_model, faces_output_base, features_output_base)

# Step 4: Load the trained Classifier model
# Assuming the input size is known based on the CAE output
input_size = 256 * 12 * 12  # Example input size, adjust based on your actual CAE output
classifier_model = Classifier(input_size, num_classes=3)
classifier_model.load_state_dict(torch.load(weights_path))
classifier_model.eval()

# Step 5: Make predictions using the trained classifier model
predictions, probabilities = load_features_and_predict(classifier_model, features_output_base)

# Step 6: Save the predictions
save_predictions_with_classes(predictions, probabilities, output_folder)
h
