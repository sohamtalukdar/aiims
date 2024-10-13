import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';

// First page: Form for Name and Age
function NameAgeForm() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Navigate to the second form page and pass the state as well
    navigate('/upload', { state: { name, age } });
  };

  return (
    <div className="app">
      <div className="gradient-bg"></div>  {/* Gradient background */}
      <div className="container">
        <h1>Enter Your Name and Age</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
          <button type="submit">Next</button>
        </form>
      </div>
    </div>
  );
}

// Second page: Form for video and audio upload
function FileUploadForm() {
  const { state } = useNavigate(); // Fetch the name and age from the state
  const [video, setVideo] = useState(null);
  const [audio, setAudio] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', state.name);
    formData.append('age', state.age);
    formData.append('video', video);
    formData.append('audio', audio);

    const response = await fetch('http://localhost:8000/upload/', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log(result);
    alert(`Uploaded successfully: Video URL: ${result.video_url}, Audio URL: ${result.audio_url}`);
  };

  return (
    <div className="app">
      <div className="gradient-bg"></div>  {/* Gradient background */}
      <div className="container">
        <h1>Upload Video and Audio</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            id="videoFile"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            required
          />
          <input
            type="file"
            id="audioFile"
            accept="audio/*"
            onChange={(e) => setAudio(e.target.files[0])}
            required
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NameAgeForm />} />
        <Route path="/upload" element={<FileUploadForm />} />
      </Routes>
    </Router>
  );
}

export default App;
