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
    console.log('Generating filename:', filename);
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

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);

      const { name, age } = req.body;
      if (!name || !age) {
        throw new Error('Name and age are required');
      }

      // Get existing user data
      const existingUser = await client.query(
        'SELECT * FROM user_audio WHERE name = $1',
        [name]
      );

      let audioPath = existingUser.rows.length > 0 ? existingUser.rows[0].audio : null;
      let videoPath = existingUser.rows.length > 0 ? existingUser.rows[0].video : null;

      // Process new files and store relative paths
      if (req.files.audio && req.files.audio[0]) {
        if (audioPath && fs.existsSync(path.join(__dirname, audioPath))) {
          fs.unlinkSync(path.join(__dirname, audioPath));
        }
        // Store relative path from the project root
        audioPath = path.relative(__dirname, req.files.audio[0].path);
      }

      if (req.files.video && req.files.video[0]) {
        if (videoPath && fs.existsSync(path.join(__dirname, videoPath))) {
          fs.unlinkSync(path.join(__dirname, videoPath));
        }
        // Store relative path from the project root
        videoPath = path.relative(__dirname, req.files.video[0].path);
      }

      let result;
      if (existingUser.rows.length > 0) {
        // Determine which fields to update
        const updates = ['age = $1'];
        const values = [age];
        let paramCount = 1;

        if (req.files.audio) {
          updates.push(`audio = $${++paramCount}`);
          values.push(audioPath);
        }
        if (req.files.video) {
          updates.push(`video = $${++paramCount}`);
          values.push(videoPath);
        }

        // Add the name parameter last
        values.push(name);
        
        const updateQuery = `
          UPDATE user_audio 
          SET ${updates.join(', ')}
          WHERE name = $${++paramCount}
          RETURNING *
        `;

        console.log('Update Query:', updateQuery);
        console.log('Update Values:', values);

        result = await client.query(updateQuery, values);
      } else {
        // For new records, include msme with default null
        const insertQuery = `
          INSERT INTO user_audio (name, age, audio, video, msme)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;

        const insertValues = [name, age, audioPath, videoPath, null]; // msme set to null
        console.log('Insert Query:', insertQuery);
        console.log('Insert Values:', insertValues);

        result = await client.query(insertQuery, insertValues);
      }

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Saved successfully',
        data: result.rows[0],
        files: {
          audio: audioPath,
          video: videoPath
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error:', error);
      
      // Clean up uploaded files on error
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

      res.status(500).json({ 
        error: 'Database operation failed',
        details: error.message,
        query: error.query,
        parameters: error.parameters
      });

    } finally {
      client.release();
    }
  });
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Upload directory: ${uploadDir}`);
});