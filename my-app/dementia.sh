#!/bin/bash

# Get the user's home directory
export HOME=/home/soham ## change here

# Initialize conda
eval "$(/home/soham/anaconda3/bin/conda shell.bash hook)"  ## change here

# Set NPM path explicitly
export PATH="/home/asadel-ds/.nvm/versions/node/v16.20.0/bin:$PATH" ## change here

# Load NVM environment
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Activate the environment
conda activate tf_env 

# Change to the project directory (adjust this path to your project directory)
cd /home/soham/aiims/my-app/  ## change here

# Function to cleanup background processes
cleanup() {
    echo "Cleaning up..."
    pkill -P $$
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM

# Run npm in the background and store its PID
/home/asadel-ds/.nvm/versions/node/v16.20.0/bin/npm start &
NPM_PID=$!

# Wait for npm to finish or for a signal
wait $NPM_PID