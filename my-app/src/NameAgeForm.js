import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  gradientHeading: {
    color: 'white',
    textAlign: 'center',
    padding: '2rem',
    margin: 100,
    fontSize: '2rem',
  },
  topRightButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  errorText: {
    color: 'red',
    fontSize: '0.8rem',
    marginBottom: '0.25rem',
  },
  inputField: {
    marginBottom: '0.25rem',
    padding: '0.5rem',
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  dialogOverlay: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  dialogButtonPrimary: {
    padding: '0.5rem 1rem',
    marginRight: '0.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  dialogButtonSecondary: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ccc',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

function NameAgeForm() {
  const [formData, setFormData] = useState({ name: '', age: '' });
  const [errors, setErrors] = useState({ name: '', age: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Validation functions
  const validateName = (value) => {
    const nameRegex = /^[A-Za-z][A-Za-z\s]*$/;
    if (!nameRegex.test(value)) {
      return 'Name must start with a letter and contain only letters and spaces';
    }
    return '';
  };

  const validateAge = (value) => {
    const ageNum = parseInt(value, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 99) {
      return 'Age must be between 1 and 99';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'name') {
      setErrors((prev) => ({ ...prev, name: validateName(value) }));
    } else if (name === 'age') {
      setErrors((prev) => ({ ...prev, age: validateAge(value) }));
    }
  };

  const generatePatientId = () => {
    const now = new Date();
    const formattedDate = now
      .toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/[/,:\s]/g, '');
    return `PT${formattedDate}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(formData.name);
    const ageError = validateAge(formData.age);
    setErrors({ name: nameError, age: ageError });

    if (nameError || ageError) return;

    const generatedId = generatePatientId();

    try {
      const response = await fetch('http://localhost:5001/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, patientId: generatedId }),
      });

      const data = await response.json();
      console.log(data.message);

      navigate('/upload', { state: { ...formData, patientId: generatedId } });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:5001/download-schema');
      if (!response.ok) {
        throw new Error('Error downloading PDF');
      }

      // Convert the response to a Blob
      const blob = await response.blob();

      // Create a URL from the Blob
      const url = URL.createObjectURL(blob);

      // Create a link to download the PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = 'model_inference.pdf'; // Name the file as you like
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <div className="gradient-bg">
        <h1 style={styles.gradientHeading}>Welcome to the Dementia Test!</h1>
        <button style={styles.topRightButton} onClick={handleDownload}>
          Download Inference
        </button>
      </div>

      <div className="container name-age-form-container">
        <h1>Enter Your Name and Age</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleInputChange}
              style={styles.inputField}
              required
            />
            {errors.name && <div style={styles.errorText}>{errors.name}</div>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="number"
              name="age"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleInputChange}
              style={styles.inputField}
              required
            />
            {errors.age && <div style={styles.errorText}>{errors.age}</div>}
          </div>

          <button
            type="submit"
            className="submit-button"
            style={styles.submitButton}
            disabled={!!errors.name || !!errors.age}
          >
            Submit
          </button>
        </form>
      </div>

      {dialogOpen && (
        <div style={styles.dialogOverlay}>
          <h2>Download Model Inference</h2>
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          <div>
            <button style={styles.dialogButtonPrimary} onClick={handleDownload}>
              Download
            </button>
            <button style={styles.dialogButtonSecondary} onClick={() => setDialogOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NameAgeForm;