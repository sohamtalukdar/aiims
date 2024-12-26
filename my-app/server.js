const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const mysql = require('mysql2/promise');

const app = express();
const port = 5001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Configure MySQL connection pool
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Bharat@1947',
  database: 'aiims'
};

let pool;
(async () => {
  pool = await mysql.createPool(dbConfig);
})().catch(err => {
  console.error('Error creating MySQL pool:', err);
  process.exit(1);
});

// Directory to store patient files permanently
const baseDataDir = path.join(__dirname, 'data');
if (!fs.existsSync(baseDataDir)) {
  fs.mkdirSync(baseDataDir, { recursive: true });
}

// Temporary upload directory
const tempDir = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure Multer for file uploads
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
    const prefix = file.fieldname === 'audio' ? 'audio_' : 'video_';
    cb(null, `${prefix}${timestamp}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
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

// Function: Move files from temp to permanent storage and store metadata in MySQL
const storeFilesLocallyAndSaveMetadata = async (files, patientId, name, age, score) => {
  files = files || {};
  
  const patientDir = path.join(baseDataDir, patientId);
  if (!fs.existsSync(patientDir)) {
    fs.mkdirSync(patientDir, { recursive: true });
  }

  let audioPath = null;
  let videoPath = null;

  // Handle audio file if it exists
  if (files.audio && Array.isArray(files.audio) && files.audio[0]) {
    const oldPath = files.audio[0].path;
    audioPath = path.join(patientDir, path.basename(oldPath));
    fs.renameSync(oldPath, audioPath);
  }

  // Handle video file if it exists
  if (files.video && Array.isArray(files.video) && files.video[0]) {
    const oldPath = files.video[0].path;
    videoPath = path.join(patientDir, path.basename(oldPath));
    fs.renameSync(oldPath, videoPath);
  }

  // Start a transaction
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // First, handle patient_media table
    const [existingRows] = await connection.execute(
      'SELECT id, audioPath, videoPath FROM patient_media WHERE patientId = ? ORDER BY id DESC LIMIT 1',
      [patientId]
    );

    if (existingRows.length > 0) {
      // Update existing record in patient_media
      const existing = existingRows[0];
      const updatedAudioPath = audioPath || existing.audioPath;
      const updatedVideoPath = videoPath || existing.videoPath;

      await connection.execute(
        'UPDATE patient_media SET audioPath = ?, videoPath = ?, score = ? WHERE id = ?',
        [updatedAudioPath, updatedVideoPath, score, existing.id]
      );
    } else {
      // Insert new record in patient_media
      const timestamp = new Date();
      await connection.execute(
        `INSERT INTO patient_media (patientId, name, age, audioPath, videoPath, score, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [patientId, name, age, audioPath, videoPath, score, timestamp]
      );
    }

    // Now handle model_inference table
    // Get the latest score from patient_media for this patient
    const [latestScore] = await connection.execute(
      'SELECT score FROM patient_media WHERE patientId = ? ORDER BY id DESC LIMIT 1',
      [patientId]
    );

    let mmseScore = null;
    if (latestScore.length > 0 && latestScore[0].score !== null) {
      mmseScore = latestScore[0].score;
    }

    // Check if entry exists in model_inference
    const [existingInference] = await connection.execute(
      'SELECT id FROM model_inference WHERE patientId = ?',
      [patientId]
    );

    if (existingInference.length > 0) {
      // Update existing record with score
      await connection.execute(
        'UPDATE model_inference SET name = ?, age = ?, mmseScore = ? WHERE patientId = ?',
        [name, age, mmseScore, patientId]
      );
    } else {
      // Insert new record with score
      await connection.execute(
        `INSERT INTO model_inference (patientId, name, age, mmseScore)
         VALUES (?, ?, ?, ?)`,
        [patientId, name, age, mmseScore]
      );
    }

    // Commit the transaction
    await connection.commit();

    return { audioPath, videoPath };
  } catch (error) {
    // If anything goes wrong, roll back changes
    await connection.rollback();
    throw error;
  } finally {
    // Release the connection
    connection.release();
  }
};

// Save Endpoint
app.post('/save', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name, age, patientId, score } = req.body;
      console.log('Received data:', { name, age, patientId, score });

      if (!patientId || !name || !age) {
        throw new Error('Patient ID, name, and age are required.');
      }

      // Handle score - default to 0 if not provided or invalid
      let parsedScore = 0;
      if (score !== undefined && score !== null) {
        parsedScore = parseInt(score, 10);
        if (isNaN(parsedScore)) {
          console.warn('Invalid score value received:', score);
          parsedScore = 0;
        }
      }
      console.log('Using score:', parsedScore);

      const { audioPath, videoPath } = await storeFilesLocallyAndSaveMetadata(
        req.files,
        patientId,
        name,
        age,
        parsedScore
      );

      res.status(201).json({
        message: 'Files uploaded and stored successfully',
        patientId,
        audioPath,
        videoPath,
        score: parsedScore,
      });
    } catch (error) {
      console.error('Server error:', error);
      if (req.files) {
        Object.values(req.files).flat().forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      res.status(500).json({ error: error.message });
    }
  });
});


// Test Database Connectivity Endpoint
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 AS test');
    res.status(200).json({ message: 'DB is working', rows });
  } catch (error) {
    console.error('DB test error:', error);
    res.status(500).json({ error: 'DB connection failed', details: error.message });
  }
});

app.get('/download-schema', (req, res) => {
  const filePath = path.join(__dirname, 'model_inference.xlsx');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'model_inference.xlsx', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error downloading file');
      }
    });
  } else {
    res.status(404).send('Schema file not found');
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

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Data directory: ${baseDataDir}`);
  console.log(`Temporary uploads directory: ${tempDir}`);
});