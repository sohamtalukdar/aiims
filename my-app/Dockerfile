# Use NVIDIA Triton Inference Server base image
FROM nvcr.io/nvidia/tritonserver:23.10-py3

# Update system and install dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip3 install --no-cache-dir \
    tensorflow==2.18.0 \
    torch \
    retina-face \
    pydub \
    pyannote.audio \
    librosa \
    scipy \
    opencv-python \
    tf-keras

# Set environment variables
ENV NVIDIA_TF32_OVERRIDE=0
ENV NVIDIA_VISIBLE_DEVICES=all
