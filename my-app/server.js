const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

const app = express();
const port = 5001;

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'eastern-academy-422205-t4-13b2d7af0acf.json'),
  projectId: 'eastern-academy-422205-t4',
});

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// GCP Bucket Configuration
const bucketName = 'aiimsasadel';

// Create temporary upload directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const patientId = req.body.patientId || 'unknown';
    const patientDir = path.join(tempDir, patientId);
    if (!fs.existsSync(patientDir)) {
      fs.mkdirSync(patientDir, { recursive: true });
    }
    cb(null, patientDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    // Use 'audio' or 'video' prefix based on file field name
    const prefix = file.fieldname === 'audio' ? 'audio_' : 'video_';
    cb(null, `${prefix}${timestamp}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/webm', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only WebM audio/video files are allowed.'));
    }
  }
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

// Helper Function: Upload File to GCP Bucket
const uploadToGCP = async (filePath, patientId, fileType, metadata) => {
  try {
    const bucket = storage.bucket(bucketName);
    const timestamp = Date.now();
    const originalExtension = path.extname(filePath); // Get original file extension
    // Create destination path: patientId/fileType_timestamp.originalExtension
    const destination = `${patientId}/${fileType}_${timestamp}${originalExtension}`;
    const file = bucket.file(destination);

    const updatedMetadata = {
      metadata: {
        patientId: metadata.patientId,
        patientName: metadata.name,
        patientAge: metadata.age,
        taskType: fileType,
        submissionTime: new Date().toISOString(),
        uploadTimestamp: timestamp.toString(),
        originalFileName: path.basename(filePath)
      },
    };

    await bucket.upload(filePath, {
      destination: file.name,
      metadata: updatedMetadata,
    });

    return `gs://${bucketName}/${file.name}`;
  } catch (error) {
    console.error('GCP upload error:', error);
    throw new Error('Failed to upload file to Google Cloud Storage');
  }
};

// Endpoint: Save Media Files
app.post('/save', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name, age, patientId } = req.body;
      
      if (!patientId || !name || !age) {
        throw new Error('Patient ID, name, and age are required.');
      }

      const metadata = { name, age, patientId };
      let audioPath = null, videoPath = null;

      // Handle audio file
      const audioFile = req.files?.audio?.[0];
      if (audioFile) {
        audioPath = await uploadToGCP(audioFile.path, patientId, 'audio', metadata);
        fs.unlinkSync(audioFile.path);
      }

      // Handle video file
      const videoFile = req.files?.video?.[0];
      if (videoFile) {
        videoPath = await uploadToGCP(videoFile.path, patientId, 'video', metadata);
        fs.unlinkSync(videoFile.path);
      }

      res.status(201).json({
        message: 'Files uploaded successfully',
        patientId,
        audioPath,
        videoPath
      });
    } catch (error) {
      console.error('Server error:', error);
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      res.status(500).json({ error: error.message });
    }
  });
});

// Endpoint: Save Test Results
app.post('/save-test', async (req, res) => {
  try {
    const { patientId, testResults } = req.body;

    if (!patientId || !testResults) {
      return res.status(400).json({ error: 'Patient ID and test results are required.' });
    }

    const resultsFileName = `test_results_${Date.now()}.json`;
    const patientDir = path.join(tempDir, patientId);
    if (!fs.existsSync(patientDir)) {
      fs.mkdirSync(patientDir, { recursive: true });
    }
    const resultsPath = path.join(patientDir, resultsFileName);

    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

    const metadata = {
      patientId,
      resultType: 'mmse',
      timestamp: new Date().toISOString()
    };

    const gcsPath = await uploadToGCP(resultsPath, patientId, 'test_results', metadata);
    fs.unlinkSync(resultsPath);

    res.status(201).json({
      message: 'Test results saved successfully',
      patientId,
      resultPath: gcsPath
    });
  } catch (error) {
    console.error('Error saving test results:', error);
    res.status(500).json({ error: 'Failed to save test results' });
  }
});

// Test GCP Authentication
app.get('/test-gcp', async (req, res) => {
  try {
    const [buckets] = await storage.getBuckets();
    res.status(200).json({
      message: 'Successfully authenticated with GCP',
      buckets: buckets.map(bucket => bucket.name)
    });
  } catch (error) {
    console.error('GCP Authentication Error:', error);
    res.status(500).json({
      error: 'GCP Authentication failed',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Clean up temporary files periodically (every hour)
setInterval(() => {
  fs.readdir(tempDir, (err, folders) => {
    if (err) {
      console.error('Error reading temp directory:', err);
      return;
    }

    const now = Date.now();
    folders.forEach(folder => {
      const folderPath = path.join(tempDir, folder);
      fs.stat(folderPath, (err, stats) => {
        if (err) {
          console.error('Error getting folder stats:', err);
          return;
        }

        // Check if it's a directory
        if (stats.isDirectory()) {
          // Read files in the patient directory
          fs.readdir(folderPath, (err, files) => {
            if (err) {
              console.error('Error reading patient directory:', err);
              return;
            }

            files.forEach(file => {
              const filePath = path.join(folderPath, file);
              fs.stat(filePath, (err, stats) => {
                if (err) {
                  console.error('Error getting file stats:', err);
                  return;
                }

                // Remove files older than 1 hour
                if (now - stats.mtime.getTime() > 3600000) {
                  fs.unlink(filePath, err => {
                    if (err) console.error('Error deleting temp file:', err);
                  });
                }
              });
            });

            // Remove the patient directory if it's empty
            fs.readdir(folderPath, (err, files) => {
              if (err) {
                console.error('Error reading patient directory:', err);
                return;
              }
              if (files.length === 0) {
                fs.rmdir(folderPath, err => {
                  if (err) console.error('Error deleting patient directory:', err);
                });
              }
            });
          });
        }
      });
    });
  });
}, 3600000);

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`GCP Bucket: ${bucketName}`);
  console.log(`Temporary uploads directory: ${tempDir}`);
});
