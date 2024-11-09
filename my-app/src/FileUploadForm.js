// File: src/FileUploadForm.js

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';

// Import components
import InstructionModal from './components/InstructionModal';
import InitialPopup from './components/InitialPopup';
import TaskContent from './components/TaskContent';

// Import custom hook
import useMediaRecorder from './hooks/useMediaRecorder';

// Import tasks data
import tasks from './data/tasks';

function FileUploadForm() {
  const { state } = useLocation();

  // State variables
  const [showModal, setShowModal] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [language, setLanguage] = useState('english');
  const [showTick, setShowTick] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showInitialPopup, setShowInitialPopup] = useState(true);
  const [showInitialInstructions, setShowInitialInstructions] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  // Custom hook for media recording
  const {
    isRecording,
    mediaURL,
    audioBlob,
    videoBlob,
    handleMediaRecord,
    handleReRecord,
  } = useMediaRecorder(selectedTab);

  // Function to handle tab clicks
  const handleTabClick = (id) => {
    // If test is completed and the user is trying to click on task id 2, return early
    if (id === 2 && testCompleted) {
      return;
    }

    setSelectedTab(id);

    // Show modal only for tasks other than the third one
    setShowModal(id !== 2);

    // Show initial instructions only for the third task
    if (id === 2) {
      setShowInitialInstructions(true);
    } else {
      setShowInitialInstructions(false);
      // Do not reset testCompleted when switching tasks
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedTab === 1 && !videoBlob) {
      alert('Please record video before submitting.');
      return;
    }

    if (selectedTab === 0 && !audioBlob) {
      alert('Please record audio before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('name', state?.name);
    formData.append('age', state?.age);

    if (audioBlob) {
      formData.append('audio', audioBlob, 'audio.webm');
    }

    if (videoBlob) {
      formData.append('video', videoBlob, 'video.webm');
    }

    // Log FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        console.log(`${key}: [Blob object]`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    try {
      const uploadResponse = await fetch('http://localhost:5001/save', {
        method: 'POST',
        body: formData,
      });
      if (!uploadResponse.ok) {
        throw new Error(`Server error: ${uploadResponse.status}`);
      }
      const result = await uploadResponse.json();
      console.log(result);
      alert(`Uploaded successfully: ${selectedTab === 1 ? 'Video' : 'Audio'}`);
    } catch (error) {
      console.error('Failed to upload:', error);
      alert('Upload failed. Please try again.');
    }

    // Show the tick animation
    setShowTick(true);

    // Hide the tick after 2 seconds
    setTimeout(() => {
      setShowTick(false);
    }, 2000);
  };

  return (
    <div className="app">
      {showInitialPopup ? (
        <InitialPopup
          language={language}
          setLanguage={setLanguage}
          onClose={() => setShowInitialPopup(false)}
        />
      ) : (
        <>
          {showModal && (
            <InstructionModal
              onClose={() => setShowModal(false)}
              selectedTab={selectedTab}
              language={language}
            />
          )}

          <div className="gradient-bg"></div>
          <div className="container">
            <div className="tabs">
              {tasks
                .filter((task) => !(task.id === 2 && testCompleted))
                .map((task) => (
                  <div
                    key={task.id}
                    className={`tab ${selectedTab === task.id ? 'active' : ''}`}
                    onClick={() => handleTabClick(task.id)}
                  >
                    {task.title[language]}
                  </div>
                ))}
            </div>
            <div className="content">
              <h1 className="task-title">{tasks[selectedTab].title[language]}</h1>
              <TaskContent
                task={tasks[selectedTab]}
                language={language}
                testCompleted={testCompleted}
                showInitialInstructions={showInitialInstructions}
                setShowInitialInstructions={setShowInitialInstructions}
                setTestCompleted={setTestCompleted}
                setShowImageModal={setShowImageModal}
                showImageModal={showImageModal}
              />

              {/* Only show the form for tasks other than the third one */}
              {selectedTab !== 2 && (
                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px',
                    marginTop: '20px',
                    position: 'relative',
                  }}
                >
                  <div className="media-controls">
                    {mediaURL ? (
                      <>
                        {selectedTab === 1 ? (
                          <video src={mediaURL} controls />
                        ) : (
                          <audio src={mediaURL} controls />
                        )}
                        <button
                          type="button"
                          onClick={handleReRecord}
                          className="custom-button"
                        >
                          {language === 'hindi' ? 'पुनः रिकॉर्ड करें' : 'Re-record'}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleMediaRecord}
                        style={{
                          marginBottom: '10px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                        }}
                      >
                        {isRecording
                          ? language === 'hindi'
                            ? 'रिकॉर्डिंग रोकें'
                            : 'Stop Recording'
                          : language === 'hindi'
                          ? selectedTab === 1
                            ? 'वीडियो रिकॉर्ड करें'
                            : 'आवाज़ रिकॉर्ड करें'
                          : selectedTab === 1
                          ? 'Record Video'
                          : 'Record Voice'}
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!mediaURL}
                    className="custom-button"
                  >
                    {language === 'hindi' ? 'जमा करें' : 'Submit'}
                  </button>

                  {showTick && <span className="tick">✔</span>}
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FileUploadForm;
