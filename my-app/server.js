const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// PostgreSQL connection setup
const pool = new Pool({
  user: 'soham',          // Your PostgreSQL user
  host: 'localhost',       // Host is localhost
  database: 'postgres',    // Using the 'postgres' database
  password: 'soham@123', // Replace with your actual PostgreSQL password
  port: 5432,              // Default PostgreSQL port
});


// API endpoint to handle POST request and save data
app.post('/save', async (req, res) => {
  const { name, age } = req.body;

  try {
    const query = 'INSERT INTO users (name, age) VALUES ($1, $2)';
    await pool.query(query, [name, age]);
    res.status(201).json({ message: 'User saved successfully!' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
