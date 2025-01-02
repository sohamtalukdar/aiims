  import React, { useState, useRef, useEffect} from 'react';
  import { useLocation, useNavigate } from 'react-router-dom'; 
  import tasks from './tasks';
  import './App.css';
  // import TaskCompletion from './TaskCompletion';
  import InstructionModal from './InstructionModal';
  import handleMediaRecord, { handleReRecord } from './handleMediaRecord';
  import useRefreshHandler from './useRefreshHandler';
  // import InitialInstructions from './InitialInstructions';
  import InitialPopup from './InitialPopup';
  import handleSubmit from './handleSubmit';
  import handleTabClick from './handleTabClick';
  // import MultipleChoiceTask from './MultipleChoiceTask';
  import TaskContent from './TaskContent';


  function FileUploadForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { state } = useLocation();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(true);
    const [selectedTab, setSelectedTab] = useState(0);
    const [setIsPatient] = useState(true); // Add this line with other useState declarations
    const [language, setLanguage] = useState('english');
    const [isRecording, setIsRecording] = useState(false);
    const [mediaURL, setMediaURL] = useState("");
    const [showTick, setShowTick] = useState(false);
    const mediaRecorderRef = useRef(null);
    const mediaChunksRef = useRef([]);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showInitialPopup, setShowInitialPopup] = useState(true);
    const [countdown, setCountdown] = useState(60);
    const [completedTasks, setCompletedTasks] = useState(new Set());
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showInitialInstructions, setShowInitialInstructions] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [videoBlob, setVideoBlob] = useState(null);
    const [showRefreshWarning, setShowRefreshWarning] = useState(false);
    const [allSelectedAnswers, setAllSelectedAnswers] = useState(() => {
    const savedData = sessionStorage.getItem("allSelectedAnswers");
    return savedData ? JSON.parse(savedData) : {};
    });
    const { handleRefreshConfirm, handleRefreshCancel } = useRefreshHandler({
    showInitialPopup,
    setShowRefreshWarning,
    });

  useEffect(() => {
    if (!state?.patientId || !state?.name || !state?.age) {
      navigate('/');
    }
  }, [state, navigate]);

  useEffect(() => {
      sessionStorage.setItem("allSelectedAnswers", JSON.stringify(allSelectedAnswers));
  }, [allSelectedAnswers]);
     
  const handleFormSubmit = async (e) => {
    const handleTabClickWrapper = (id) => handleTabClick({
      id,
      completedTasks,
      selectedTab,
      setCountdown,
      setMediaURL,
      mediaChunksRef,
      mediaRecorderRef,
      setSelectedTab,
      setShowModal,
      setShowInitialInstructions
    });

    await handleSubmit({
      e,
      isSubmitting,
      setIsSubmitting,
      state,
      navigate,
      selectedTab,
      allSelectedAnswers,
      videoBlob,
      audioBlob,
      setShowTick,
      setCompletedTasks,
      tasks,
      handleTabClick: handleTabClickWrapper,
      setMediaURL,
      setVideoBlob,
      setAudioBlob
    });
  };

  return (
    <div className="app">
      {/* Patient ID Display */}
      {state?.patientId && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          fontFamily: 'monospace',
          fontSize: '14px',
          border: '1px solid #ddd'
        }}>
          Patient ID: {state.patientId}
        </div>
      )}

      {/* Initial Test Setup Modal */}
      {showInitialPopup ? (
        <InitialPopup
          language={language}
          setLanguage={setLanguage}
          onClose={() => setShowInitialPopup(false)}
        />
      ) : (
        <>
          {/* Instructions Modal */}
          {showModal && <InstructionModal 
            onClose={() => setShowModal(false)} 
            selectedTab={selectedTab} 
            language={language} 
          />}

          {/* Main Content */}
          <div className="gradient-bg" />
          <div className="container">
            {/* Navigation Tabs */}
            <div className="tabs">
              {tasks
                .filter((task) => !(task.id === 2 && testCompleted))
                .map((task) => (
                  <div
                    key={task.id}
                    className={`tab ${selectedTab === task.id ? 'active' : ''} 
                              ${completedTasks.has(task.id) ? 'completed' : ''}
                              ${task.id < selectedTab ? 'disabled' : ''}`}
                              onClick={() => handleTabClick({
                                id: task.id,
                                completedTasks,
                                selectedTab,
                                setCountdown,
                                setMediaURL,
                                mediaChunksRef,
                                mediaRecorderRef,
                                setSelectedTab,
                                setShowModal,
                                setShowInitialInstructions
                              })}
                    style={{
                      cursor: completedTasks.has(task.id) || task.id < selectedTab ? 'not-allowed' : 'pointer',
                      opacity: completedTasks.has(task.id) || task.id < selectedTab ? 0.6 : 1,
                      backgroundColor: completedTasks.has(task.id) ? '#e0e0e0' : undefined
                    }}
                  >
                    {task.title[language]}
                    {completedTasks.has(task.id) && (
                      <span style={{ marginLeft: '5px', color: 'green' }}>✓</span>
                    )}
                  </div>
                ))}
            </div>

            {/* Task Content Area */}
            <div className="content">
            <TaskContent
              task={tasks[selectedTab]}
              language={language}
              testCompleted={testCompleted}
              showInitialInstructions={showInitialInstructions}
              setShowInitialInstructions={setShowInitialInstructions}
              setTestCompleted={setTestCompleted}
              allSelectedAnswers={allSelectedAnswers}
              setAllSelectedAnswers={setAllSelectedAnswers}
              setIsPatient={setIsPatient}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              showImageModal={showImageModal}
              setShowImageModal={setShowImageModal}
            />
              {/* Media Recording Form */}
              {selectedTab !== 2 && (
                <form
                  onSubmit={handleFormSubmit}
                  className="media-form"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px',
                    marginTop: '20px'
                  }}
                >
                  <div className="media-controls">
                  {mediaURL ? (
                      <div className="media-playback">
                        {selectedTab === 1 ? (
                          <video 
                            src={mediaURL} 
                            controls
                            style={{
                              maxWidth: '350px',  // Set maximum width
                              width: '100%',      // Responsive width
                              height: 'auto',     // Maintain aspect ratio
                              marginBottom: '10px' // Add some spacing
                            }} 
                          />
                        ) : (
                          <audio src={mediaURL} controls />
                        )}
                        <button
                              type="button"
                              onClick={() =>
                                handleReRecord({
                                  setMediaURL,
                                  setVideoBlob,
                                  setAudioBlob,
                                  mediaChunksRef,
                                  mediaRecorderRef,
                                  selectedTab,
                                  handleMediaRecord: () =>
                                    handleMediaRecord({
                                      selectedTab,
                                      isRecording,
                                      setIsRecording,
                                      setMediaURL,
                                      setCountdown,
                                      setVideoBlob,
                                      setAudioBlob,
                                      mediaRecorderRef,
                                      mediaChunksRef,
                                    }),
                                })
                              }                              
                              className="custom-button"
                            >
                          {language === 'hindi' ? 'पुनः रिकॉर्ड करें' : 'Re-record'}
                        </button>
                      </div>
                    ) : (
                      <div className="recording-controls">
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                          {isRecording && <p>Time remaining: {countdown}s</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleMediaRecord({
                              selectedTab,
                              isRecording,
                              setIsRecording,
                              setMediaURL,
                              setCountdown,
                              setVideoBlob,
                              setAudioBlob,
                              mediaRecorderRef,
                              mediaChunksRef,
                            })
                          }                          
                          className="custom-button"
                          style={{
                            marginBottom: '10px',
                            padding: '8px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {isRecording
                            ? (language === 'hindi' ? 'रिकॉर्डिंग रोकें' : 'Stop Recording')
                            : language === 'hindi'
                            ? selectedTab === 1
                              ? 'वीडियो रिकॉर्ड करें'
                              : 'आवाज़ रिकॉर्ड करें'
                            : selectedTab === 1
                            ? 'Record Video'
                            : 'Record Voice'}
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={!mediaURL || isSubmitting} 
                    className="custom-button"
                    style={{
                      opacity: (!mediaURL || isSubmitting) ? 0.6 : 1
                    }}
                  >
                    {language === 'hindi' ? 'जमा करें' : 'Submit'}
                  </button>

                  {showTick && <span className="tick">✔</span>}
                </form>
              )}
            </div>
          </div>

          {/* Refresh Warning Modal */}
          {showRefreshWarning && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>{language === 'hindi' ? 'पृष्ठ रीफ्रेश की पुष्टि करें' : 'Confirm Page Refresh'}</h2>
                <p>
                  {language === 'hindi' 
                    ? 'पृष्ठ को रीफ्रेश करने से सभी वर्तमान प्रविष्टियां हट जाएंगी। क्या आप जारी रखना चाहते हैं?'
                    : 'Refreshing the page will remove all current entries. Do you want to continue?'}
                </p>
                <div className="button-container">
                  <button onClick={handleRefreshCancel} className="cancel-button">
                    {language === 'hindi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button onClick={handleRefreshConfirm} className="confirm-button">
                    {language === 'hindi' ? 'रीफ्रेश करें' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
  }
  export default FileUploadForm;