  import React, { useState, useRef, useEffect} from 'react';
  import { useLocation, useNavigate } from 'react-router-dom'; // Add useNavigate here
  import tasks from './data/tasks';
  import './App.css';

  function FileUploadForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { state } = useLocation();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(true);
    const [selectedTab, setSelectedTab] = useState(0);
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



  useEffect(() => {
    if (!state?.patientId || !state?.name || !state?.age) {
      navigate('/');
    }
  }, [state, navigate]);

  useEffect(() => {
      sessionStorage.setItem("allSelectedAnswers", JSON.stringify(allSelectedAnswers));
  }, [allSelectedAnswers]);

  useEffect(() => {
    const clearDataOnRefresh = () => {
        sessionStorage.clear();
    };

    window.addEventListener("beforeunload", clearDataOnRefresh);

    return () => {
        window.removeEventListener("beforeunload", clearDataOnRefresh);
    };
  }, []);

  useEffect(() => {
    const blockRefresh = (e) => {
      if (!showInitialPopup) { // If test has started
        e.preventDefault();
        e.stopPropagation();
        
        // For older browsers
        if (e.preventDefault) {
          e.preventDefault();
        }
        e.returnValue = '';
        // Can also show a message if needed
        return "Test is in progress. Refresh is disabled.";
      }
    };

    const blockKeyboardRefresh = (e) => {
      if (!showInitialPopup) { // If test has started
        if (
          (e.metaKey && e.key === 'r') || // Cmd + R (macOS)
          (e.ctrlKey && e.key === 'r') || // Ctrl + R (Windows/Linux)
          e.key === 'F5'                  // F5 (all platforms)
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    // Block context menu to prevent refresh
    const blockContextMenu = (e) => {
      if (!showInitialPopup) {
        e.preventDefault();
      }
    };

    // Add all event listeners
    window.addEventListener('beforeunload', blockRefresh);
    window.addEventListener('keydown', blockKeyboardRefresh);
    window.addEventListener('contextmenu', blockContextMenu);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', blockRefresh);
      window.removeEventListener('keydown', blockKeyboardRefresh);
      window.removeEventListener('contextmenu', blockContextMenu);
    };
  }, [showInitialPopup]);

    const handleRefreshConfirm = () => {
      setShowRefreshWarning(false);
      window.location.reload(); // Perform manual refresh
    };
    
    const handleRefreshCancel = () => {
      setShowRefreshWarning(false);
    };
    

    const TaskCompletion = ({ language }) => {
      const audioRef = useRef(null);
    
      useEffect(() => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, []);
    
      const calculateScore = () => {
        let totalScore = 0;
        console.log('Calculating score. allSelectedAnswers:', allSelectedAnswers);
        
        if (Object.keys(allSelectedAnswers).length === 0) {
          console.log('No answers selected, returning 0');
          return 0;
        }
      
        Object.entries(allSelectedAnswers).forEach(([questionIndex, selections]) => {
          if (selections && selections.length > 0) {
            console.log(`Question ${questionIndex}: adding ${selections.length} points`);
            totalScore += selections.length;
          }
        });
        
        console.log('Final calculated score:', totalScore);
        return totalScore;
      };
    
      const score = calculateScore();
      const maxScore = 30;
      
      const handleExit = () => {
        sessionStorage.clear()
        window.location.href = '/';
      };
    
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white max-w-2xl mx-auto">
          <audio
            ref={audioRef}
            src={language === 'english' ? '/audio/q16_en.mp3' : '/audio/q16_hi.mp3'}
          />
          <div className="text-center w-full">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              {language === 'hindi' ? 'धन्यवाद!' : 'Thank You!'}
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm mb-8">
              <h3 className="text-xl font-semibold mb-2">
                {language === 'hindi' ? 'आपका MMSE स्कोर' : 'Your MMSE Score'}
              </h3>
              <div className="text-4xl font-bold text-blue-600">
                {score} / {maxScore}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-lg">
                {language === 'hindi' 
                  ? 'आपका परीक्षण पूरा हो गया है। परिणाम आपके स्वास्थ्य देखभाल प्रदाता द्वारा साझा किए जाएंगे।'
                  : 'Your test has been completed. The results will be shared by your healthcare provider.'}
              </p>
              <p className="text-base text-gray-600">
                {language === 'hindi'
                  ? 'कृपया अपने स्वास्थ्य देखभाल प्रदाता से संपर्क करें।'
                  : 'Please contact your healthcare provider for follow-up.'}
              </p>
              
              <button
                onClick={handleExit}
                style={{
                  marginTop: '2rem',
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                {language === 'hindi' ? 'बाहर निकलें' : 'Exit'}
              </button>
            </div>
          </div>
        </div>
      );
    };


    const handleTabClick = (id) => {
      // Prevent navigation to completed tasks
      if (completedTasks.has(id)) {
        return;
      }

      // Prevent going back to previous tasks
      const currentTaskIndex = selectedTab;
      if (id < currentTaskIndex) {
        return;
      }

      setCountdown(60);
      setMediaURL("");
      mediaChunksRef.current = [];
    
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    
      setSelectedTab(id);
      setShowModal(id !== 2);
    
      if (id === 2) {
        setShowInitialInstructions(true);
      } else {
        setShowInitialInstructions(false);
      }
    };   
    


    // const toggleLanguage = (e) => {
    //   e.preventDefault();
    //   setLanguage((prev) => (prev === 'hindi' ? 'english' : 'hindi'));
    // };

  const handleMediaRecord = () => {
    const mediaType = selectedTab === 1 
      ? { video: true, audio: true }  // Video with audio
      : { audio: true };              // Audio only

    if (!isRecording) {
      // Clear previous recording data when starting new recording
      setMediaURL("");
      setCountdown(60); // Reset the countdown
      if (selectedTab === 1) {
        setVideoBlob(null);
      } else {
        setAudioBlob(null);
      }

      console.log('Starting media recording for:', selectedTab === 1 ? 'video' : 'audio');

      navigator.mediaDevices.getUserMedia(mediaType)
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          mediaChunksRef.current = [];

          mediaRecorder.start();
          setIsRecording(true);
          console.log('MediaRecorder started');

          const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                // Automatically stop recording when countdown reaches 0
                if (mediaRecorder.state === "recording") {
                  console.log('Stopping recording due to countdown');
                  mediaRecorder.stop();
                  stream.getTracks().forEach(track => track.stop());
                  setIsRecording(false);
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          mediaRecorder.countdownInterval = countdownInterval;

          mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0) {
              mediaChunksRef.current.push(event.data);
              console.log('Data chunk received:', event.data.size, 'bytes');
            }
          });

          mediaRecorder.addEventListener('stop', () => {
            const mediaBlob = new Blob(mediaChunksRef.current, {
              type: selectedTab === 1 ? 'video/webm' : 'audio/webm'
            });
            console.log('Created media blob:', {
              type: mediaBlob.type,
              size: mediaBlob.size
            });

            const url = URL.createObjectURL(mediaBlob);
            setMediaURL(url);

            if (selectedTab === 1) {
              setVideoBlob(mediaBlob);
              console.log('Video blob set:', mediaBlob);
            } else {
              setAudioBlob(mediaBlob);
              console.log('Audio blob set:', mediaBlob);
            }

            setIsRecording(false);
            mediaChunksRef.current = [];
            clearInterval(mediaRecorder.countdownInterval);
          });
        })
        .catch((err) => {
          console.error('Error accessing media:', err);
          setIsRecording(false);
          alert(`Could not access your ${selectedTab === 1 ? 'camera' : 'microphone'}. Please check your browser settings.`);
        });
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        clearInterval(mediaRecorderRef.current.countdownInterval);
        setCountdown(0);
        console.log('Recording stopped manually');
      }
    }
  }; 

    const handleReRecord = () => {
      // Clear the current recording
      setMediaURL("");
      if (selectedTab === 1) {
        setVideoBlob(null);
      } else {
        setAudioBlob(null);
      }
      
      // Clear media chunks
      mediaChunksRef.current = [];
      
      // Stop any existing streams
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Start new recording
      handleMediaRecord();
    };
    

    // Inside the handleSubmit function in FileUploadForm.js, update it as follows:

    const calculateScore = () => {
      let totalScore = 0;
      // Iterate through all questions
      Object.values(allSelectedAnswers).forEach((selections) => {
          // Each correct selection adds 1 point
          if (selections && selections.length > 0) {
              totalScore += selections.length;
          }
      });
      return totalScore;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) {
        console.log('Already submitting, returning');
        return;
    }
    
    console.log('Starting submission for tab:', selectedTab);
    setIsSubmitting(true);
    
    try {
        if (!state?.patientId || !state?.name || !state?.age) {
            alert('Patient information is missing. Please start over.');
            navigate('/');
            return;
        }

        const formData = new FormData();
        formData.append('name', state.name);
        formData.append('age', state.age);
        formData.append('patientId', state.patientId);
        
        // Initialize score as 0
        let scoreToSend = '0';
        
        // Only calculate score for MMSE test (tab 2)
        if (selectedTab === 2) {
            const calculatedScore = calculateScore();
            console.log('Tab 2: Calculated score:', calculatedScore);
            scoreToSend = calculatedScore.toString();
        } else {
            console.log(`Tab ${selectedTab}: Using default score: 0`);
        }
        
        console.log('Setting score in formData:', scoreToSend);
        formData.append('score', scoreToSend);

        // Log all form data being sent
        console.log('Form data contents:');
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        const currentBlob = selectedTab === 1 ? videoBlob : audioBlob;
        if (!currentBlob) {
            alert(`Please record ${selectedTab === 1 ? 'video' : 'audio'} before submitting.`);
            setIsSubmitting(false);
            return;
        }

        if (selectedTab === 1) {
            formData.append('video', currentBlob, 'video.webm');
        } else if (selectedTab === 0) {
            formData.append('audio', currentBlob, 'audio.webm');
        }

        console.log('Sending request to server...');
        const response = await fetch('http://localhost:5001/save', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        console.log('Server response:', result);

        setShowTick(true);
        setTimeout(() => {
            setShowTick(false);
            setCompletedTasks((prev) => new Set([...prev, selectedTab]));
            const nextTab = selectedTab + 1;
            if (nextTab < tasks.length) {
                handleTabClick(nextTab);
            }
        }, 1000);

        setMediaURL('');
        if (selectedTab === 1) {
            setVideoBlob(null);
        } else {
            setAudioBlob(null);
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert(error.message || 'Error uploading file. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
};

const InstructionModal = ({ onClose }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []); // Removed language from dependency array

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content">
        <audio
          ref={audioRef}
          src={selectedTab === 0 ? 
            (language === 'english' ? '/audio/q2_en.mp3' : '/audio/q2_hi.mp3') :
            (language === 'english' ? '/audio/q3_en.mp3' : '/audio/q3_hi.mp3')
          }
        />
        <h2>{language === 'hindi' ? 'निर्देश' : 'Instructions'}</h2>
        <p style={{ marginTop: '10px', fontSize: '1.2em', color: '#555' }}>
          {selectedTab === 0 ? (
            language === 'hindi' ? (
              <>
                <p>कृपया "आवाज़ रिकॉर्ड करें" पर क्लिक करें और जोर से पढ़ें। आपके पास 1 मिनट है। रिकॉर्डिंग स्वचालित रूप से रुक जाएगी। "जमा करें" पर क्लिक करें।</p>
              </>
            ) : (
              <>
                <p>Please click "Record Voice" to start reading aloud. You have 1 minute. Recording will stop automatically. Click "Submit" to save.</p>
              </>
            )
          ) : (
            language === 'hindi' ? (
              <>
                <p>कृपया "वीडियो रिकॉर्ड करें" पर क्लिक करें और चित्र का वर्णन करें। आपके पास 1 मिनट है। रिकॉर्डिंग स्वचालित रूप से रुक जाएगी। "जमा करें" पर क्लिक करें। ज़ूम इन के लिए, कृपया चित्र पर क्लिक करें।</p>
              </>
            ) : (
              <>
                <p>Please click "Record Video" and describe the picture. You have 1 minute. Recording will stop automatically. Click "Submit" to save. To zoom in, please click on the picture.</p>
              </>
            )
          )}
        </p>
        <button className="custom-ok-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

const InitialInstructions = ({ onAccept, onDeny, setIsPatient, language }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []);

  return (
    <div className="initial-instructions-overlay">
      <div className="initial-instructions-content">
        <audio
          ref={audioRef}
          src={language === 'english' ? '/audio/q4_en.mp3' : '/audio/q4_hi.mp3'}
        />
        <h2>{language === 'hindi' ? 'ऑनलाइन MMSE परीक्षण में आपका स्वागत है' : 'Welcome to the Online MMSE Test'}</h2>
        
        <p>
          {language === 'hindi' ? (
            <>
              <strong>ऑनलाइन MMSE टेस्ट: तैयारी और निर्देश</strong><br/>
              <br/>
              स्वागत है! टेस्ट शुरू करने से पहले कृपया निम्नलिखित सुनिश्चित करें:
              <ul>
                <li>एक देखभालकर्ता (Caregiver) की उपस्थिति आवश्यक है, जो टेस्ट ले सके।</li>
                <li>एक खाली कागज</li>
                <li>एक पेन या पेंसिल</li>
                <li>आवश्यक सहायक उपकरण (जैसे, श्रवण यंत्र, चश्मा, घड़ी)</li>
              </ul>
              <br/>
              <strong>देखभालकर्ता के लिए निर्देश:</strong><br/>
              <ul>
                <li>व्यक्ति को बैठाएँ: व्यक्ति को अपने सामने ऐसी जगह पर बैठाएँ जहाँ वे आपको स्पष्ट रूप से देख और सुन सकें।</li>
                <li>प्रश्न पढ़ें: प्रत्येक प्रश्न को व्यक्ति के लिए ज़ोर से पढ़ें।</li>
                <li>उत्तर चिह्नित करें: यदि व्यक्ति सही उत्तर देता है तो चेकबॉक्स पर निशान लगाएँ।</li>
                <li>अगले पर जाएं: हर प्रश्न के बाद "अगला" पर क्लिक करें।</li>
              </ul>
              <br/>
              क्या आप शुरू करने के लिए तैयार हैं?
            </>
          ) : (
            <>
              <strong>Online MMSE Test: Preparation & Instructions</strong><br/>
              <br/>
              Welcome! Before starting the test, please ensure the following:
              <ul>
                <li>A caregiver is present to administer the test.</li>
                <li>A blank paper</li>
                <li>A pen or pencil</li>
                <li>Any necessary aids (e.g., hearing aids, glasses, clock)</li>
              </ul>
              <br/>
              <strong>Instructions for the Caregiver:</strong><br/>
              <ul>
                <li>Seat the Patient: Position the patient across from you, where they can see and hear you clearly.</li>
                <li>Read Aloud: Read each question out loud to the patient.</li>
                <li>Mark Responses: Check the box if the patient answers correctly.</li>
                <li>Progress: Click "Next" after each question.</li>
              </ul>
              <br/>
              Are you ready to begin?
            </>
          )}
        </p>

        <p>{language === 'hindi' ? 'यदि आप "स्वीकार करें" पर क्लिक करते हैं, तो आप परीक्षण में भाग लेने के लिए सहमत हैं।' : 'By clicking "Accept," you agree to participate in the test.'}</p>
        <div style={{ marginTop: '20px' }}>
          <button className="accept-button" onClick={onAccept}>
            {language === 'hindi' ? 'स्वीकार करें' : 'Accept'}
          </button>
          <button className="deny-button" onClick={onDeny} style={{ marginLeft: '10px' }}>
            {language === 'hindi' ? 'अस्वीकार करें' : 'Deny'}
          </button>
        </div>
      </div>
    </div>
  );
};

    const MultipleChoiceTask = ({
      task,
      language,
      setTestCompleted,
      currentQuestionIndex,
      setCurrentQuestionIndex,
      allSelectedAnswers,
      setAllSelectedAnswers,
    }) => {
      const { state } = useLocation();
      const handleNext = () => {
        if (currentQuestionIndex < task.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      };
    
      const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
      };
    
      const handleAnswerSelect = (choiceIndex) => {
        setAllSelectedAnswers((prevSelected) => {
          const updatedAnswers = { ...prevSelected };
          
          // Initialize array for current question if it doesn't exist
          if (!updatedAnswers[currentQuestionIndex]) {
            updatedAnswers[currentQuestionIndex] = [];
          }
          
          const currentAnswers = updatedAnswers[currentQuestionIndex];
          
          // Toggle selection
          const index = currentAnswers.indexOf(choiceIndex);
          if (index === -1) {
            // Add the choice if not already selected
            updatedAnswers[currentQuestionIndex] = [...currentAnswers, choiceIndex];
          } else {
            // Remove the choice if already selected
            updatedAnswers[currentQuestionIndex] = currentAnswers.filter(
              (idx) => idx !== choiceIndex
            );
          }
          
          return updatedAnswers;
        });
      };
    
      const totalSelectedCount = Object.values(allSelectedAnswers).reduce(
        (total, selections) => total + selections.length,
        0
      );
    
      const currentSelections = allSelectedAnswers[currentQuestionIndex] || [];
      
      return (
        <div className="multiple-choice-task">
          <h3 style={{ textAlign: 'center', marginBottom: '5px' }}>
            {task.questions[currentQuestionIndex].question[language]}
          </h3>

          {currentQuestionIndex === 10 ? (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <img 
                src={process.env.PUBLIC_URL + '/pentagon.png'} 
                alt="Shape for copying" 
                style={{ maxWidth: '45%', height: 'auto' }}
                onError={(e) => {
                  console.error("Image failed to load");
                  console.log("Attempted path:", e.target.src);
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                {task.questions[currentQuestionIndex].choices.map((choice, index) => (
                  <label
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'center',
                      margin: '5px 0',
                      width: '200px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={currentSelections.includes(index)}
                      onChange={() => handleAnswerSelect(index)}
                      style={{ marginRight: '10px' }}
                    />
                    {choice[language]}
                  </label>
                ))}
              </div>
            </div>
          ) : (
            // Default rendering for other questions
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '30vh',
              marginTop: '10px'
            }}>
              {task.questions[currentQuestionIndex].choices.map((choice, index) => (
                <label
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    margin: '5px 0',
                    width: '200px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={currentSelections.includes(index)}
                    onChange={() => handleAnswerSelect(index)}
                    style={{ marginRight: '10px' }}
                  />
                  {choice[language]}
                </label>
              ))}
            </div>
          )}

          {/* Navigation Buttons and Counter */}
          <div className="navigation-container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '10px'
          }}>
            <div className="navigation-buttons">
              <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} style={{ marginRight: '10px' }}>
                {language === 'hindi' ? 'पिछला' : 'Previous'}
              </button>
              <button onClick={handleNext} disabled={currentQuestionIndex === task.questions.length - 1}>
                {language === 'hindi' ? 'अगला' : 'Next'}
              </button>
            </div>
            <div className="selected-counter" style={{ marginRight: '20px' }}>
              {language === 'hindi'
                ? `चयनित: ${totalSelectedCount}`
                : `Score: ${totalSelectedCount}`}
            </div>
          </div>

          {/* Question Number Navigation */}
          <div
            className="question-number-navigation"
            style={{
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {task.questions.map((q, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                }}
                style={{
                  margin: '5px',
                  padding: '10px',
                  backgroundColor: index === currentQuestionIndex ? '#007bff' : '#f0f0f0',
                  color: index === currentQuestionIndex ? '#fff' : '#000',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
{/* Submit Button */}
<div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={async () => {
                const finalScore = Object.values(allSelectedAnswers).reduce(
                  (total, selections) => total + (selections ? selections.length : 0),
                  0
                );
                
                console.log('Final MMSE score:', finalScore);
                const formData = new FormData();
                formData.append('name', state.name);
                formData.append('age', state.age);
                formData.append('patientId', state.patientId);
                formData.append('score', finalScore.toString());

                try {
                  console.log('Sending MMSE score to server:', finalScore);
                  const response = await fetch('http://localhost:5001/save', {
                    method: 'POST',
                    body: formData,
                  });

                  if (!response.ok) {
                    throw new Error('Failed to save MMSE score');
                  }

                  console.log('MMSE score saved successfully');
                  setTestCompleted(true);
                } catch (error) {
                  console.error('Error saving MMSE score:', error);
                  alert('Failed to save test score. Please try again.');
                }
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {language === 'hindi' ? 'जमा करें' : 'Submit'}
            </button>
          </div>

        </div>
      );
    };

    const TaskContent = ({
      task,
      language,
      testCompleted,
      showInitialInstructions,
      setShowInitialInstructions,
      setTestCompleted,
      allSelectedAnswers,
      setAllSelectedAnswers,
      setIsPatient,
      currentQuestionIndex,
      setCurrentQuestionIndex
    }) => {
      if (task.id === 2) {
        if (testCompleted) {
          return (
            <div className="w-full flex justify-center items-center">
              <TaskCompletion 
                language={language}
                allSelectedAnswers={allSelectedAnswers} 
              />
            </div>
          );
        }
        // If initial instructions are to be shown
        if (showInitialInstructions) {
          return (
            <InitialInstructions
              onAccept={() => setShowInitialInstructions(false)}
              onDeny={() => {
                setShowInitialInstructions(false);
                setTestCompleted(true);
              }}
              setIsPatient={setIsPatient}  // Pass it here
              language={language}
            />
          );
        }

        // Render the MultipleChoiceTask
        return (
          <MultipleChoiceTask
            task={task}
            language={language}
            setTestCompleted={setTestCompleted}
            allSelectedAnswers={allSelectedAnswers}
            setAllSelectedAnswers={setAllSelectedAnswers}
            currentQuestionIndex={currentQuestionIndex}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
          />
        );      
      }

      return (
        <div className="task-content">
          {task.image ? (
            <>
            {/* Added click to enlarge text */}
          <div style={{ 
            textAlign: 'left', 
            marginBottom: '5px',
            fontSize: '14px',
            color: '#666',
            cursor: 'pointer'
          }}>
            {language === 'hindi' ? 'ज़ूम इन/ज़ूम आउट करने के लिए छवि पर क्लिक करें' : 'Click on the image to zoom in / zoom out'} 🔍
          </div>
              <img
                src={task.image}
                alt="Task"
                style={{ cursor: 'pointer', maxWidth: '100%', maxHeight: '100%' }}
                onClick={() => setShowImageModal(true)}
              />
              {showImageModal && (
                <div className="image-modal">
                  <img
                    src={task.image}
                    alt="Popup Task"
                    style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                    onClick={() => setShowImageModal(false)}
                  />
                </div>
              )}
            </>
          ) : (
            <p style={{ width: '60%', margin: '0 auto', lineHeight: '1.8', fontSize: '1.1em' }}>
              {task.paragraph[language]}
            </p>
          )}
        </div>
      );
    };
  
    const InitialPopup = ({ language, setLanguage, onClose }) => {
      const audioRef = useRef(null);
     
      useEffect(() => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, [language]);
     
      return (
        <div className="initial-popup-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <audio
            ref={audioRef}
            src={language === 'english' ? '/audio/q1_en.mp3' : '/audio/q1_hi.mp3'}
          />
          <div className="initial-popup-content"
            style={{ maxWidth: '600px', width: '90%', textAlign: 'center' }}>
            <h2>
              {language === 'english' 
                ? 'Welcome to the Dementia Test!' 
                : 'डिमेंशिया टेस्ट में आपका स्वागत है!'}
            </h2>
            <p style={{ marginTop: '10px', fontSize: '1.2em', color: '#555' }}>
              {language === 'english' ? (
                <>
                  This test includes three parts:
                  <br /><br />
                  <strong>Paragraph Reading</strong> (1 min)<br />
                  <strong>Picture Interpretation</strong> (1 min)<br />
                  <strong>MMSE online test</strong> (~15 min, requires a caregiver if available)
                  <br /><br />
                  Please ensure you're in a quiet space with audio and video recording permissions enabled.
                  <br /><br />
                  Please Choose the language for the test
                </>
              ) : (
                <>
                  यह टेस्ट तीन भागों में है:
                  <br /><br />
                  <strong>पैराग्राफ पढ़ना</strong> (1 मिनट)<br />
                  <strong>चित्र व्याख्या</strong> (1 मिनट)<br />
                  <strong>MMSE ऑनलाइन टेस्ट</strong> (~15 मिनट, केयरगिवर उपलब्ध हो तो)
                  <br /><br />
                  कृपया सुनिश्चित करें कि आप शांत स्थान में हैं और ऑडियो-वीडियो रिकॉर्डिंग अनुमति सक्षम है।
                  <br /><br />
                  कृपया परीक्षण के लिए भाषा चुनें
                </>
              )}
            </p>
            <div className="language-selection" style={{ marginTop: '20px' }}>
              <button
                onClick={() => setLanguage('english')}
                className={`language-button ${language === 'english' ? 'active' : ''}`}
                style={{ marginRight: '10px', padding: '10px 20px' }}>
                English
              </button>
              <button
                onClick={() => setLanguage('hindi')}
                className={`language-button ${language === 'hindi' ? 'active' : ''}`}
                style={{ padding: '10px 20px' }}>
                हिंदी
              </button>
            </div>
            <button
              onClick={onClose}
              className="begin-test-button"
              style={{ marginTop: '20px', padding: '10px 20px' }}>
              {language === 'english' ? 'Begin Test' : 'टेस्ट शुरू करें'}
            </button>
          </div>
        </div>
      );
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
          {showModal && <InstructionModal onClose={() => setShowModal(false)} />}

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
                    onClick={() => handleTabClick(task.id)}
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
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
              />

              {/* Media Recording Form */}
              {selectedTab !== 2 && (
                <form
                  onSubmit={handleSubmit}
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
                          onClick={handleReRecord} 
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
                          onClick={handleMediaRecord}
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