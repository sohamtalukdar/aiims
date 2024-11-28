const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const { PubSub } = require('@google-cloud/pubsub');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// GCP Configuration
const bucketName = 'your-gcp-bucket-name'; // Replace with your bucket name
const storage = new Storage();
const pubSubClient = new PubSub();
const topicName = 'ml-inference-trigger'; // Replace with your Pub/Sub topic

// PostgreSQL Configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'sohamtalukdar',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'user_audio_db',
  password: process.env.POSTGRES_PASSWORD || 'soham@123',
  port: process.env.DB_PORT || 5432,
});

// Multer Configuration
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([{ name: 'audio', maxCount: 1 }, { name: 'video', maxCount: 1 }]);

// Helper Function: Upload to GCP with Metadata
const uploadToGCP = async (filePath, destination, metadata) => {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(destination);

  // Upload file with metadata
  await bucket.upload(filePath, {
    destination: file.name,
    metadata: {
      metadata: metadata, // Custom metadata goes here
    },
  });

  return `gs://${bucketName}/${file.name}`;
};

// Helper Function: Trigger ML Inference via Pub/Sub
const triggerMLInference = async (data) => {
  const messageBuffer = Buffer.from(JSON.stringify(data));
  await pubSubClient.topic(topicName).publishMessage({ data: messageBuffer });
};

// Endpoint: Save User Data and Files
app.post('/save', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    const client = await pool.connect();

    try {
      const { name, age } = req.body;
      if (!name || !age) {
        throw new Error('Name and age are required');
      }

      const audioFile = req.files.audio?.[0];
      const videoFile = req.files.video?.[0];

      let audioPath, videoPath;

      const metadata = { name, age }; // Metadata to associate with the files

      if (audioFile) {
        audioPath = await uploadToGCP(
          audioFile.path,
          `audio/${audioFile.filename}`,
          metadata
        );
        fs.unlinkSync(audioFile.path); // Delete local file after upload
      }

      if (videoFile) {
        videoPath = await uploadToGCP(
          videoFile.path,
          `video/${videoFile.filename}`,
          metadata
        );
        fs.unlinkSync(videoFile.path); // Delete local file after upload
      }

      await client.query('BEGIN');

      // Insert or Update User Data
      const result = await client.query(
        `
        INSERT INTO user_audio (name, age, audio, video)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name)
        DO UPDATE SET age = EXCLUDED.age, audio = EXCLUDED.audio, video = EXCLUDED.video
        RETURNING *;
        `,
        [name, age, audioPath || null, videoPath || null]
      );

      await client.query('COMMIT');

      // Trigger ML Inference
      const inferenceData = { name, age, audioPath, videoPath };
      await triggerMLInference(inferenceData);

      res.status(201).json({
        message: 'Saved successfully',
        data: result.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database operation failed', details: error.message });
    } finally {
      client.release();
    }
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`GCP Bucket: ${bucketName}`);
});
