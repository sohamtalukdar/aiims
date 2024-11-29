import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NameAgeForm() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  const navigate = useNavigate();

  // Validation function for name
  const validateName = (value) => {
    const nameRegex = /^[A-Za-z][A-Za-z\s]*$/;
    if (!nameRegex.test(value)) {
      setNameError('Name must start with a letter and contain only letters and spaces');
      return false;
    }
    setNameError('');
    return true;
  };

  // Validation function for age
  const validateAge = (value) => {
    const ageNum = parseInt(value);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 99) {
      setAgeError('Age must be between 1 and 99');
      return false;
    }
    setAgeError('');
    return true;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    validateName(value);
  };

  const handleAgeChange = (e) => {
    const value = e.target.value;
    setAge(value);
    validateAge(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate fields
    const isNameValid = validateName(name);
    const isAgeValid = validateAge(age);
  
    if (!isNameValid || !isAgeValid) {
      alert('Please enter valid name and age.');
      return;
    }
  
    try {
      console.log('Submitting:', { name, age });
  
      const response = await fetch('http://localhost:5001/save', { // Update URL if deployed
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error('Server responded with error:', error);
        alert(`Server Error: ${error.error}`);
        return;
      }
  
      const result = await response.json();
      console.log('Submit success:', result);
  
      // Navigate to the upload page with state
      navigate('/upload', { state: { name, age } });
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Network error. Please try again.');
    }
  };  

  return (
    <div className="app">
      <div className="gradient-bg">
        <h1 style={{ 
          color: 'white', 
          textAlign: 'center',
          padding: '2rem',
          margin: 100,
          fontSize: '2rem'
        }}>
          Welcome to the Dementia Test!
        </h1>
      </div>
      <div className="container name-age-form-container">
        <h1>Enter Your Name and Age</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={handleNameChange}
              required
              style={{ marginBottom: '0.25rem' }}
            />
            {nameError && (
              <div style={{ color: 'red', fontSize: '0.8rem' }}>
                {nameError}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={handleAgeChange}
              required
              style={{ marginBottom: '0.25rem' }}
            />
            {ageError && (
              <div style={{ color: 'red', fontSize: '0.8rem' }}>
                {ageError}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={!!nameError || !!ageError}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default NameAgeForm;