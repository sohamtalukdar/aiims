// audioWorker.js
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { execFile } = require('child_process');

const connection = new IORedis({
  host: 'localhost',
  port: 6379
});

const audioWorker = new Worker('audioPreprocessing', async job => {
  const { patientId, audioPath } = job.data;

  // Here, run your Python code.
  // Suppose your Python script `audio_pipeline.py` takes arguments: folder_path and combined_csv_file.
  // In your posted Python code, folder_path was "audio" and combined_csv_file was "audio.csv".
  const folderPath = 'audio'; // Directory where audio files are stored
  const combinedCsvFile = 'audio.csv';

  return new Promise((resolve, reject) => {
    execFile('python', ['audio_pipeline.py', folderPath, combinedCsvFile], (error, stdout, stderr) => {
      if (error) {
        console.error("Audio preprocessing error:", error);
        return reject(error);
      }
      console.log("Audio preprocessing output:", stdout, stderr);

      // If you have a separate Python script for inference (e.g., `audio_inference.py`)
      // that reads `combinedCsvFile` and returns a predicted class:
      execFile('python', ['audio_inference.py', combinedCsvFile, 'acoustic_model.keras', 'labels.json'], (err, stdOut, stdErr) => {
        if (err) {
          console.error("Audio inference error:", err);
          return reject(err);
        }
        console.log("Audio inference output:", stdOut, stdErr);
        
        // Parse stdOut if needed to get the predicted class label.
        const predictedClass = stdOut.trim();
        
        // Update the database or do something with predictedClass here if needed.
        
        resolve(predictedClass);
      });
    });
  });
}, { connection });

audioWorker.on('completed', (job, returnValue) => {
  console.log(`Audio job completed for patient: ${job.data.patientId}, result: ${returnValue}`);
});

audioWorker.on('failed', (job, err) => {
  console.error(`Audio job failed for patient: ${job.data.patientId}`, err);
});

