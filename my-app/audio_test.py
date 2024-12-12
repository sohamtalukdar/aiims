import os
import numpy as np
from pydub import AudioSegment
from pyannote.audio import Pipeline
from collections import defaultdict
import librosa
from scipy.stats import kurtosis, skew
import csv

# Your Hugging Face access token
ACCESS_TOKEN = "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"

# Load the diarization pipeline once
pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1", use_auth_token=ACCESS_TOKEN)

# Function to convert various audio formats to WAV
def convert_to_wav(input_audio_file, output_wav_file):
    audio = AudioSegment.from_file(input_audio_file)
    audio.export(output_wav_file, format="wav")

# Function to perform speaker diarization
def perform_diarization(wav_file):
    diarization = pipeline(wav_file)
    speaker_segments = defaultdict(list)
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        speaker_segments[speaker].append((turn.start, turn.end))
    return speaker_segments

# Function to extract MFCC features
def extract_mfcc_features(y, sr):
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

# Function to save extracted features to a CSV file
def save_features_to_csv(feature_data, csv_file):
    csv_exists = os.path.isfile(csv_file)
    fieldnames = list(feature_data.keys())

    with open(csv_file, mode="a", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        if not csv_exists:
            writer.writeheader()
        writer.writerow(feature_data)

# Main function to process a single audio file
def process_audio_file(audio_file, output_csv_file):
    # Convert to WAV if needed
    if not audio_file.endswith(".wav"):
        output_wav_file = f"{os.path.splitext(os.path.basename(audio_file))[0]}.wav"
        convert_to_wav(audio_file, output_wav_file)
    else:
        output_wav_file = audio_file

    # Perform diarization
    speaker_segments = perform_diarization(output_wav_file)
    if not speaker_segments:
        print(f"No speaker segments found for {audio_file}.")
        return

    speaker_durations = {speaker: sum(end - start for start, end in segments) for speaker, segments in speaker_segments.items()}
    dominant_speaker = max(speaker_durations, key=speaker_durations.get)
    dominant_segments = speaker_segments[dominant_speaker]

    print(f"File: {audio_file}")
    print(f"Dominant Speaker: {dominant_speaker} with duration {speaker_durations[dominant_speaker]} seconds")

    for start, end in dominant_segments:
        y, sr = librosa.load(output_wav_file, sr=None, offset=start, duration=end-start)
        features = extract_mfcc_features(y, sr)
        save_features_to_csv(features, output_csv_file)

# Example usage
audio_file_path = "/home/jetson/aiims/my-app/data/PT061224074814/audio_1733467768610.webm"  # Replace with the path to your audio file
output_csv_file_path = "output.csv"  # Replace with the desired CSV file name

process_audio_file(audio_file_path, output_csv_file_path)

