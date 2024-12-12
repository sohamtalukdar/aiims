import sys
import os
import numpy as np
from pydub import AudioSegment
from pyannote.audio import Pipeline
from collections import defaultdict
import librosa
from scipy.stats import kurtosis, skew
import csv
import shutil

# Your Hugging Face access token
ACCESS_TOKEN = "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"

# Load the diarization pipeline once
pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1", use_auth_token=ACCESS_TOKEN)

def convert_to_wav(input_audio_file, output_wav_file):
    audio = AudioSegment.from_file(input_audio_file)
    audio.export(output_wav_file, format="wav")

def perform_diarization(wav_file):
    diarization = pipeline(wav_file)
    speaker_segments = defaultdict(list)
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        speaker_segments[speaker].append((turn.start, turn.end))
    return speaker_segments

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

def save_features_to_csv(feature_data, csv_file):
    if any(
        value is None or
        (isinstance(value, float) and np.isnan(value)) or
        (isinstance(value, str) and value == '')
        for value in feature_data.values()
    ):
        print("Skipping row due to NaN or empty values")
        return

    csv_exists = os.path.isfile(csv_file)
    fieldnames = list(feature_data.keys())

    if 'class' in fieldnames:
        fieldnames.insert(0, fieldnames.pop(fieldnames.index('class')))

    with open(csv_file, mode="a", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        if not csv_exists:
            writer.writeheader()
        writer.writerow(feature_data)

def remove_hidden_files(directory):
    for root, dirs, files in os.walk(directory, topdown=False):
        for name in files:
            if name.startswith('.') or name == '__MACOSX':
                file_path = os.path.join(root, name)
                os.remove(file_path)
                print(f"Removed hidden file: {file_path}")
        for name in dirs:
            dir_path = os.path.join(root, name)
            if name.startswith('.') or name == '__MACOSX':
                shutil.rmtree(dir_path, ignore_errors=True)
                print(f"Removed hidden directory: {dir_path}")

def process_files_recursively(directory, combined_csv_file):
    for root, dirs, files in os.walk(directory):
        class_label = os.path.basename(root)

        for file in files:
            if file.endswith(".mkv") or file.endswith(".wav"):
                audio_file = os.path.join(root, file)
                if not audio_file.endswith(".wav"):
                    output_wav_file = os.path.join(root, f"{os.path.splitext(os.path.basename(audio_file))[0]}.wav")
                    convert_to_wav(audio_file, output_wav_file)
                else:
                    output_wav_file = audio_file

                speaker_segments = perform_diarization(output_wav_file)
                if not speaker_segments:
                    print(f"No speaker segments found for {audio_file}.")
                    continue

                speaker_durations = {sp: sum(e - s for s, e in segs) for sp, segs in speaker_segments.items()}
                dominant_speaker = max(speaker_durations, key=speaker_durations.get)
                dominant_segments = speaker_segments[dominant_speaker]

                print(f"File: {audio_file}")
                print(f"Dominant Speaker: {dominant_speaker} with duration {speaker_durations[dominant_speaker]} seconds")

                for start, end in dominant_segments:
                    y, sr = librosa.load(output_wav_file, sr=None, offset=start, duration=end-start)
                    features ={"class": class_label}
                    features.update(extract_mfcc_features(y, sr))
                    save_features_to_csv(features, combined_csv_file)

def main():
    # Read folder_path and combined_csv_file from sys.argv
    folder_path = sys.argv[1]
    combined_csv_file = sys.argv[2]

    # Remove hidden files and directories
    remove_hidden_files(folder_path)

    # Process all files recursively
    process_files_recursively(folder_path, combined_csv_file)
    print(f"Final combined data has been written to {combined_csv_file}")

if __name__ == "__main__":
    main()
 
