const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

const app = express();
const port = 5001;
const storage = new Storage({
  keyFilename: path.join(__dirname, 'eastern-academy-422205-t4-13b2d7af0acf.json'),
  projectId: 'eastern-academy-422205-t4',
});

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());

// GCP Bucket Configuration
const bucketName = 'aiimsasadel'; // Replace with your GCP bucket name

// Multer Configuration for File Uploads
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, 'temp_uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB file size limit
}).fields([{ name: 'audio', maxCount: 1 }, { name: 'video', maxCount: 1 }]);

// Helper Function: Upload File to GCP Bucket
const uploadToGCP = async (filePath, destination, metadata) => {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(destination);

  // Add submissionTime to metadata
  const updatedMetadata = {
    metadata: {
      ...metadata,
      submissionTime: new Date().toISOString(),
    },
  };

  // Upload file with metadata
  await bucket.upload(filePath, {
    destination: file.name,
    metadata: updatedMetadata,
  });

  // Return GCP path
  return `gs://${bucketName}/${file.name}`;
};

// Endpoint: Save User Data and Upload Files
app.post('/save', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name, age } = req.body;
      if (!name || !age) {
        throw new Error('Name and age are required.');
      }

      // Handle uploaded files
      const audioFile = req.files?.audio?.[0];
      const videoFile = req.files?.video?.[0];
      const metadata = { name, age };

      let audioPath = null, videoPath = null;

      if (audioFile) {
        audioPath = await uploadToGCP(
          audioFile.path,
          `audio/${audioFile.filename}`,
          metadata
        );
        fs.unlinkSync(audioFile.path); // Remove temporary file
      }

      if (videoFile) {
        videoPath = await uploadToGCP(
          videoFile.path,
          `video/${videoFile.filename}`,
          metadata
        );
        fs.unlinkSync(videoFile.path); // Remove temporary file
      }

      res.status(201).json({
        message: 'Files uploaded successfully.',
        audioPath,
        videoPath,
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Test GCP Authentication
app.get('/test-gcp', async (req, res) => {
  try {
    const [buckets] = await storage.getBuckets();
    res.status(200).json({
      message: 'Successfully authenticated with GCP.',
      buckets: buckets.map(bucket => bucket.name),
    });
  } catch (error) {
    console.error('GCP Authentication Error:', error.message);
    res.status(500).json({ error: 'GCP Authentication failed.', details: error.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`GCP Bucket: ${bucketName}`);
});
