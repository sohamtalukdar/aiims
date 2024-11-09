// server.js

const express = require('express');
//const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5001;

// Middleware
//app.use(bodyParser.json());
app.use(cors());

// Ensure 'uploads/' folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Multer configuration for saving files to disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Ensure 'uploads/' folder exists in project root
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Adjust multer to handle multiple file fields
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 2 * 1024 * 1024, // 2 MB (adjust as needed)
  },
});


// PostgreSQL connection setup using environment variables
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'sohamtalukdar',        // PostgreSQL user
  host: process.env.DB_HOST || 'localhost',                      // Database host
  database: process.env.POSTGRES_DB || 'user_audio_db',          // Database name
  password: process.env.POSTGRES_PASSWORD || 'soham@123',    // PostgreSQL password
  port: process.env.DB_PORT || 5432,                             // Default PostgreSQL port
});

// API endpoint to handle POST request and save data with or without audio/video
app.post('/save', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  console.log('req.body:', req.body); // Add this line
  console.log('req.files:', req.files); // Add this line
  console.log('Received request to save user');
  const { name, age } = req.body;
  let audioFile = null;
  let videoFile = null;

  if (req.files) {
    if (req.files.audio && req.files.audio.length > 0) {
      audioFile = req.files.audio[0];
    }
    if (req.files.video && req.files.video.length > 0) {
      videoFile = req.files.video[0];
    }
  }

  console.log('Received request to save user');
  console.log('Name:', name);
  console.log('Age:', age);

  if (!name || !age) {
    console.error('Missing required fields');
    return res.status(400).json({ error: 'Name and age are required.' });
  }

  try {
    // Check if a record with the same name exists
    const existingUserQuery = 'SELECT * FROM user_audio WHERE name = $1';
    const existingUserResult = await pool.query(existingUserQuery, [name]);

    // If the user already exists, delete the old entry and remove the file
    // If the user already exists, update their record
    if (existingUserResult.rows.length > 0) {
      const existingUser = existingUserResult.rows[0];

      // Delete old audio file if a new one is uploaded
      if (audioFile && existingUser.audio && fs.existsSync(existingUser.audio)) {
        fs.unlinkSync(existingUser.audio);
        console.log('Old audio file deleted:', existingUser.audio);
      }

      // Delete old video file if a new one is uploaded
      if (videoFile && existingUser.video && fs.existsSync(existingUser.video)) {
        fs.unlinkSync(existingUser.video);
        console.log('Old video file deleted:', existingUser.video);
      }

      // Update the existing record
      const updateQuery = `
        UPDATE user_audio
        SET age = $2,
            audio = COALESCE($3, audio),
            video = COALESCE($4, video)
        WHERE name = $1
      `;
      await pool.query(updateQuery, [
        name,
        age,
        audioFile ? audioFile.path : null,
        videoFile ? videoFile.path : null,
      ]);
      console.log('Updated existing database record for user:', name);
    } else {
      // Insert the new entry
      const insertQuery = 'INSERT INTO user_audio (name, age, audio, video) VALUES ($1, $2, $3, $4)';
      await pool.query(insertQuery, [
        name,
        age,
        audioFile ? audioFile.path : null,
        videoFile ? videoFile.path : null,
      ]);
      console.log('User data inserted successfully');
    }

    res.status(201).json({ message: 'User and media saved successfully!' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
