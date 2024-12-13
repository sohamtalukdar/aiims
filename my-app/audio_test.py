import os
import numpy as np
import librosa
import tensorflow as tf
import json
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler
from scipy.stats import kurtosis, skew
from tensorflow.keras.layers import Layer
from tensorflow.keras.saving import register_keras_serializable

# Define the custom Attention layer
@register_keras_serializable()
class Attention(Layer):
    def __init__(self, **kwargs):
        super(Attention, self).__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(name='attention_weight', shape=(input_shape[-1], input_shape[-1]),
                                 initializer='glorot_uniform', trainable=True)
        self.b = self.add_weight(name='attention_bias', shape=(input_shape[-1],),
                                 initializer='zeros', trainable=True)
        super(Attention, self).build(input_shape)

    def call(self, x):
        e = tf.nn.tanh(tf.tensordot(x, self.W, axes=1) + self.b)
        a = tf.nn.softmax(e, axis=1)
        output = tf.reduce_sum(x * a, axis=1)
        return output

# Function to extract MFCC features
def extract_mfcc_features_for_test(y, sr):
    y = librosa.resample(y, orig_sr=sr, target_sr=8000)
    sr = 8000
    hop_length = int(0.025 * sr)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, hop_length=hop_length)
    features = {}
    for i, mfcc in enumerate(mfccs):
        features[f"MFCC_{i}_mean"] = np.mean(mfcc)
        features[f"MFCC_{i}_kurtosis"] = kurtosis(mfcc)
        features[f"MFCC_{i}_skew"] = skew(mfcc)
    return features

# Load saved scalers from JSON
def load_scalers(json_path):
    with open(json_path, 'r') as f:
        scaler_data = json.load(f)
    scalers = {}
    for feature_name, params in scaler_data.items():
        scaler = StandardScaler()
        scaler.mean_ = np.array(params['mean'])
        scaler.scale_ = np.array(params['scale'])
        scalers[feature_name] = scaler
    return scalers

# Normalize features using saved scalers
def normalize_features(features, scalers):
    normalized_features = {}
    for feature_name, value in features.items():
        if feature_name in scalers:
            normalized_value = scalers[feature_name].transform([[value]])[0][0]
            normalized_features[feature_name] = normalized_value
    return normalized_features

# Main function to process a single audio file and predict the class
def process_file(audio_file, model_path, class_labels_path, scalers_path):
    # Load the model
    model = load_model(model_path, compile=False)

    # Load class labels
    with open(class_labels_path, 'r') as f:
        class_labels = json.load(f)

    # Load scalers
    scalers = load_scalers(scalers_path)

    # Load and preprocess the audio file
    y, sr = librosa.load(audio_file, sr=None)
    features = extract_mfcc_features_for_test(y, sr)

    # Normalize features
    normalized_features = normalize_features(features, scalers)

    # Ensure consistent order of features
    input_features = [normalized_features[f"MFCC_{i}_{stat}"] for i in range(13) for stat in ["mean", "kurtosis", "skew"]]

    # Check feature length matches model input
    if len(input_features) != 39:
        raise ValueError(f"Expected 39 features, got {len(input_features)}. Check your feature extraction.")

    # Prepare input for the model
    X = np.array(input_features).reshape(1, 1, -1)

    # Predict
    predictions = model.predict(X)
    predicted_class_idx = np.argmax(predictions, axis=1)[0]

    # Get class label
    predicted_class_label = class_labels[str(predicted_class_idx)]
    return predicted_class_label

# Paths to required files
model_path = "./aiims_acoustic_24-oct-24_model1_model.keras"
class_labels_path = "./labels.json"
scalers_path = "./scalers.json"
audio_file = "/home/soham/aiims/my-app/data/PT061224074814/audio_1733467768610.webm"

# Run the prediction
def main():
    try:
        predicted_class = process_file(audio_file, model_path, class_labels_path, scalers_path)
        print(f"Predicted Class: {predicted_class}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
