import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NameAgeForm() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked");
    navigate('/upload', { state: { name, age } });
  
    try {
      const response = await fetch('http://localhost:5001/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, age }),
      });
  
      const data = await response.json();
      console.log(data.message);
  
      navigate('/upload', { state: { name, age } });
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <div className="app">
      <div className="gradient-bg"></div>
      <div className="container name-age-form-container">
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
          <button type="submit" className="submit-button">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default NameAgeForm;
