// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import NameAgeForm from './NameAgeForm';  // Import the NameAgeForm component
import FileUploadForm from './FileUploadForm';  // Import the FileUploadForm component

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
