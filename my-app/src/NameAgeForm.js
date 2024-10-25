import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NameAgeForm() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sending data to the backend (Express server)
    try {
      const response = await fetch('http://localhost:5000/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, age }),  // Send the form data as JSON
      });

      const data = await response.json();
      console.log(data.message);  // Success message from the backend

      // Redirect or show confirmation
      navigate('/upload', { state: { name, age } });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="app">
      <div className="gradient-bg"></div>
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
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default NameAgeForm;
