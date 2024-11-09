// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${file.fieldname}-${uniqueSuffix}.webm`;
    console.log('Generating filename for', file.fieldname + ':', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'sohamtalukdar',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'user_audio_db',
  password: process.env.POSTGRES_PASSWORD || 'soham@123',
  port: process.env.DB_PORT || 5432,
});

app.post('/save', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);

      const { name, age } = req.body;
      if (!name || !age) {
        throw new Error('Name and age are required');
      }

      // Get existing user data
      const existingUser = await pool.query(
        'SELECT * FROM user_audio WHERE name = $1',
        [name]
      );

      // Initialize paths with existing values or null
      let audioPath = existingUser.rows.length > 0 ? existingUser.rows[0].audio : null;
      let videoPath = existingUser.rows.length > 0 ? existingUser.rows[0].video : null;

      // Handle audio file update if present
      if (req.files.audio && req.files.audio[0]) {
        // Only delete old audio file if we're updating audio
        if (audioPath && fs.existsSync(audioPath)) {
          console.log('Deleting old audio file:', audioPath);
          fs.unlinkSync(audioPath);
        }
        audioPath = req.files.audio[0].path;
        console.log('New audio file path:', audioPath);
      }

      // Handle video file update if present
      if (req.files.video && req.files.video[0]) {
        // Only delete old video file if we're updating video
        if (videoPath && fs.existsSync(videoPath)) {
          console.log('Deleting old video file:', videoPath);
          fs.unlinkSync(videoPath);
        }
        videoPath = req.files.video[0].path;
        console.log('New video file path:', videoPath);
      }

      let result;
      if (existingUser.rows.length > 0) {
        // Create update query based on what's being updated
        let updateQuery = 'UPDATE user_audio SET age = $1';
        let queryParams = [age];
        let paramCount = 1;

        // Only include audio in update if it's being updated
        if (req.files.audio) {
          updateQuery += `, audio = $${++paramCount}`;
          queryParams.push(audioPath);
        }

        // Only include video in update if it's being updated
        if (req.files.video) {
          updateQuery += `, video = $${++paramCount}`;
          queryParams.push(videoPath);
        }

        updateQuery += ` WHERE name = $${++paramCount} RETURNING *`;
        queryParams.push(name);

        result = await pool.query(updateQuery, queryParams);
        console.log('Updated record:', result.rows[0]);
      } else {
        // Insert new record
        const insertQuery = `
          INSERT INTO user_audio (name, age, audio, video)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        
        result = await pool.query(insertQuery, [name, age, audioPath, videoPath]);
        console.log('Inserted new record:', result.rows[0]);
      }

      res.status(201).json({
        message: 'Saved successfully',
        files: {
          audio: audioPath,
          video: videoPath
        }
      });

    } catch (error) {
      console.error('Error:', error);
      // Clean up any newly uploaded files if there was an error
      if (req.files) {
        Object.values(req.files).forEach(files => {
          files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
              console.log('Cleaned up file:', file.path);
            }
          });
        });
      }
      res.status(500).json({ error: error.message });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Upload directory: ${uploadDir}`);
});