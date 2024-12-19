import io
import os
import numpy as np
from pydub import AudioSegment
from pyannote.audio import Pipeline
from collections import defaultdict
import librosa
from scipy.stats import kurtosis, skew
import json
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.layers import Layer
from tensorflow.keras.saving import register_keras_serializable
import tensorflow as tf

ACCESS_TOKEN = "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"
pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1", use_auth_token=ACCESS_TOKEN)

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

def convert_to_wav_in_memory(input_audio_file):
    audio = AudioSegment.from_file(input_audio_file)
    wav_io = io.BytesIO()
    audio.export(wav_io, format="wav")
    wav_io.seek(0)
    print("Conversion done (in memory)")
    return wav_io

def perform_diarization(wav_io):
    diarization = pipeline(wav_io)
    speaker_segments = defaultdict(list)
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        speaker_segments[speaker].append((turn.start, turn.end))
    print("Diarization done")
    return speaker_segments

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
    print("Features Extracted")
    return features

def load_scalers(json_path):
    with open(json_path, 'r') as f:
        scaler_data = json.load(f)
    scalers = {}
    for feature_name, params in scaler_data.items():
        scaler = StandardScaler()
        scaler.mean_ = np.array(params['mean'])
        scaler.scale_ = np.array(params['scale'])
        scalers[feature_name] = scaler
    print("Scaler loaded")
    return scalers

def normalize_features(features, scalers):
    normalized_features = {}
    for feature_name, value in features.items():
        if feature_name in scalers:
            normalized_value = scalers[feature_name].transform([[value]])[0][0]
            normalized_features[feature_name] = normalized_value
    print("Normalization done")
    return normalized_features

def process_file(audio_file, model_path, class_labels_path, scalers_path):
    # Convert to wav in memory if needed
    if not audio_file.endswith(".wav"):
        wav_io = convert_to_wav_in_memory(audio_file)
    else:
        with open(audio_file, 'rb') as f:
            wav_io = io.BytesIO(f.read())

    # Perform diarization
    speaker_segments = perform_diarization(wav_io)
    if not speaker_segments:
        raise ValueError(f"No speaker segments found for {audio_file}.")

    # Determine dominant speaker
    speaker_durations = {sp: sum(end - start for start, end in segs) for sp, segs in speaker_segments.items()}
    dominant_speaker = max(speaker_durations, key=speaker_durations.get)
    dominant_segments = speaker_segments[dominant_speaker]

    # Choose the longest segment of the dominant speaker for classification
    longest_segment = max(dominant_segments, key=lambda seg: seg[1]-seg[0])
    start, end = longest_segment

    # Extract features from this segment
    y, sr = librosa.load(wav_io, sr=None, offset=start, duration=end - start)
    features = extract_mfcc_features_for_test(y, sr)

    # Load model and scalers
    model = load_model(model_path, compile=False)
    with open(class_labels_path, 'r') as f:
        class_labels = json.load(f)
    scalers = load_scalers(scalers_path)

    # Normalize and prepare features
    normalized_features = normalize_features(features, scalers)
    input_features = [normalized_features[f"MFCC_{i}_{stat}"] for i in range(13) for stat in ["mean", "kurtosis", "skew"]]
    if len(input_features) != 39:
        raise ValueError(f"Expected 39 features, got {len(input_features)}.")

    X = np.array(input_features).reshape(1, 1, -1)
    predictions = model.predict(X)
    predicted_class_idx = np.argmax(predictions, axis=1)[0]
    predicted_class_label = class_labels[str(predicted_class_idx)]

    return predicted_class_label

# Example usage
model_path = "./aiims_acoustic_24-oct-24_model1_model.keras"
class_labels_path = "./labels.json"
scalers_path = "./scalers.json"
audio_file = "./data/PT061224074814/audio_1733467768610.webm"

def main():
    try:
        predicted_class = process_file(audio_file, model_path, class_labels_path, scalers_path)
        print(f"Predicted Class: {predicted_class}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
