const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Multer configuration for saving files to disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Ensure 'uploads/' folder exists in project root
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}.mp4`);
  },
});

const upload = multer({ storage: storage });

// PostgreSQL connection setup using environment variables
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'sohamtalukdar',        // PostgreSQL user
  host: process.env.DB_HOST || 'localhost',                  // Database host
  database: process.env.POSTGRES_DB || 'user_audio_db',      // Database name
  password: process.env.POSTGRES_PASSWORD || 'soham@123',    // PostgreSQL password
  port: process.env.DB_PORT || 5432,                         // Default PostgreSQL port
});

// API endpoint to handle POST request and save data with audio
app.post('/save', upload.single('audio'), async (req, res) => {
  console.log('req.file:', req.file);
  const { name, age } = req.body;
  const audioFile = req.file;

  // Detailed logging to debug the upload process
  console.log('Received request to save user');
  console.log('Name:', name);
  console.log('Age:', age);
  console.log('Audio File:', audioFile);

  if (!name || !age || !audioFile) {
    console.error('Missing required fields');
    return res.status(400).json({ error: 'Name, age, and audio file are required.' });
  }

  try {
    // Check if a record with the same name exists
    const existingUserQuery = 'SELECT * FROM user_audio WHERE name = $1';
    const existingUserResult = await pool.query(existingUserQuery, [name]);

    // If the user already exists, delete the old entry and remove the file
    if (existingUserResult.rows.length > 0) {
      const oldAudioPath = existingUserResult.rows[0].audio;
      if (fs.existsSync(oldAudioPath)) {
        fs.unlinkSync(oldAudioPath);  // Delete the old audio file
        console.log('Old audio file deleted:', oldAudioPath);
      }

      // Delete the existing database entry
      const deleteQuery = 'DELETE FROM user_audio WHERE name = $1';
      await pool.query(deleteQuery, [name]);
      console.log('Deleted old database record for user:', name);
    }

    // Insert the new entry with the correct file path
    const query = 'INSERT INTO user_audio (name, age, audio) VALUES ($1, $2, $3)';
    await pool.query(query, [name, age, audioFile.path]);

    console.log('New user data inserted successfully');
    res.status(201).json({ message: 'User and audio saved successfully!' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
