import React, { useState, useRef, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import tasks from './/data/tasks';
import './App.css';

function FileUploadForm() {
  const [isPatient, setIsPatient] = useState(true); // Default to true
  const { state } = useLocation();
  const [showModal, setShowModal] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [language, setLanguage] = useState('english'); // Default to English
  const [isRecording, setIsRecording] = useState(false);
  const [mediaURL, setMediaURL] = useState("");
  const [showTick, setShowTick] = useState(false);
  const mediaRecorderRef = useRef(null);
  const mediaChunksRef = useRef([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showInitialPopup, setShowInitialPopup] = useState(true); // New state variable
  const [countdown, setCountdown] = useState(60);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // State variables for instruction page in the third task
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
    const handleKeyDown = (e) => {
      // Intercept refresh shortcuts: Cmd + R (macOS), Ctrl + R, and F5
      if (
        !showInitialPopup &&
        ((e.metaKey && e.key === 'r') || // Cmd + R (macOS)
         (e.ctrlKey && e.key === 'r') || // Ctrl + R (Windows/Linux)
         e.key === 'F5')                 // F5 (all platforms)
      ) {
        e.preventDefault();
        setShowRefreshWarning(true); // Show custom modal
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showInitialPopup]);

  const handleRefreshConfirm = () => {
    setShowRefreshWarning(false);
    window.location.reload(); // Perform manual refresh
  };
  
  const handleRefreshCancel = () => {
    setShowRefreshWarning(false);
  };
  

  const TaskCompletion = ({ isPatient, allSelectedAnswers, language }) => {
    // Calculate score
    const calculateScore = () => {
      let totalScore = 0;
      Object.values(allSelectedAnswers).forEach((selections) => {
        totalScore += selections.length;
      });
      return totalScore;
    };
  
    if (isPatient) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white max-w-2xl mx-auto">
          <div className="text-center w-full">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              {language === 'hindi' ? 'धन्यवाद!' : 'Thank You!'}
            </h2>
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
            </div>
          </div>
        </div>
      );
    }
  
    // For caregivers, show the full results
    const score = calculateScore();
    const getCognitiveStatus = (score) => {
      if (score >= 24) {
        return {
          english: 'Normal Cognition',
          hindi: 'सामान्य संज्ञानात्मक स्थिति'
        };
      } else if (score >= 19) {
        return {
          english: 'Mild Cognitive Impairment',
          hindi: 'हल्की संज्ञानात्मक क्षति'
        };
      } else if (score >= 10) {
        return {
          english: 'Moderate Cognitive Impairment',
          hindi: 'मध्यम संज्ञानात्मक क्षति'
        };
      } else {
        return {
          english: 'Severe Cognitive Impairment',
          hindi: 'गंभीर संज्ञानात्मक क्षति'
        };
      }
    };
  
    const status = getCognitiveStatus(score);
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white max-w-2xl mx-auto">
        <div className="text-center w-full">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            {language === 'hindi' ? 'परीक्षण परिणाम' : 'Test Results'}
          </h2>
          
          <div className="mb-8">
            <div className="text-4xl font-bold text-blue-600 mb-4">
              {score}/30
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-700">
              {language === 'hindi' ? 'संज्ञानात्मक स्थिति:' : 'Cognitive Status:'}
            </h3>
            <p className="text-lg text-blue-600 font-medium">
              {status[language]}
            </p>
          </div>
  
          <div className="w-full max-w-md mx-auto mb-8">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
              {language === 'hindi' ? 'स्कोर रेंज' : 'Score Ranges'}
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-100 rounded">
                <p>24-30: {language === 'hindi' ? 'सामान्य संज्ञानात्मक स्थिति' : 'Normal Cognition'}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded">
                <p>19-23: {language === 'hindi' ? 'हल्की संज्ञानात्मक क्षति' : 'Mild Cognitive Impairment'}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded">
                <p>10-18: {language === 'hindi' ? 'मध्यम संज्ञानात्मक क्षति' : 'Moderate Cognitive Impairment'}</p>
              </div>
              <div className="p-3 bg-red-100 rounded">
                <p>0-9: {language === 'hindi' ? 'गंभीर संज्ञानात्मक क्षति' : 'Severe Cognitive Impairment'}</p>
              </div>
            </div>
          </div>
  
          <div className="text-center text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <p>
              {language === 'hindi' 
                ? 'कृपया इन परिणामों की चर्चा रोगी के स्वास्थ्य देखभाल प्रदाता से करें।'
                : 'Please discuss these results with the patient\'s healthcare provider.'}
            </p>
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
  
          // Timer to stop recording after 60 seconds
          const stopTimer = setTimeout(() => {
            if (mediaRecorder.state === "recording") {
              mediaRecorder.stop();
              mediaRecorder.stream.getTracks().forEach(track => track.stop());
              console.log('Recording stopped by timer');
            }
          }, 60000);
  
          const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
  
          mediaRecorder.stopTimer = stopTimer;
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
            clearTimeout(mediaRecorder.stopTimer);
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
        clearTimeout(mediaRecorderRef.current.stopTimer);
        clearInterval(mediaRecorderRef.current.countdownInterval);
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

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!state?.name || !state?.age) {
    alert('Name and age are required');
    return;
  }

  const currentBlob = selectedTab === 1 ? videoBlob : audioBlob;
  if (!currentBlob) {
    alert(`Please record ${selectedTab === 1 ? 'video' : 'audio'} before submitting.`);
    return;
  }

  // Log the blob details
  console.log('Submitting blob:', {
    type: currentBlob.type,
    size: currentBlob.size,
    tab: selectedTab
  });

  const formData = new FormData();
  formData.append('name', state.name);
  formData.append('age', state.age);

  formData.append('msme', state.msme || '');
  console.log('Appending msme:', state.msme);


  // Add logging to see what's being appended
  if (selectedTab === 1) {
    formData.append('video', videoBlob, 'video.webm');
    console.log('Appending video blob:', videoBlob);
  } else {
    formData.append('audio', audioBlob, 'audio.webm');
    console.log('Appending audio blob:', audioBlob);
  }

  // Log the FormData (note: FormData can't be directly logged)
  for (let pair of formData.entries()) {
    console.log('FormData entry:', pair[0], pair[1]);
  }

  try {
    console.log('Starting upload...');
    const response = await fetch('http://localhost:5001/save', {
      method: 'POST',
      body: formData
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(`Server error: ${errorData.error || response.status}`);
    }

    const result = await response.json();
    console.log(`${selectedTab === 1 ? 'Video' : 'Audio'} upload result:`, result);
    
    setShowTick(true);
    setTimeout(() => {
      setShowTick(false);
      // Mark current task as completed
      setCompletedTasks(prev => new Set([...prev, selectedTab]));
      // Move to next task after successful submission
      const nextTab = selectedTab + 1;
      if (nextTab < tasks.length) {
        handleTabClick(nextTab);
      }
    }, 1);

    setMediaURL("");
    if (selectedTab === 1) {
      setVideoBlob(null);
    } else {
      setAudioBlob(null);
    }

  } catch (error) {
    console.error('Upload failed:', error);
    alert(`Upload failed: ${error.message}. Please check console for details.`);
  }
};

  // Instruction Modal Component
  const InstructionModal = ({ onClose }) => (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content">
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

  // Initial Instructions Component for the third task
  const InitialInstructions = ({ onAccept, onDeny, setIsPatient, language }) => (
    <div className="initial-instructions-overlay">
      <div className="initial-instructions-content">
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

  const MultipleChoiceTask = ({
    task,
    language,
    setTestCompleted,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    allSelectedAnswers,
    setAllSelectedAnswers,
  }) => {
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

        {/* Render the current question and choices */}
        {currentQuestionIndex === 11 ? (
          // Special rendering for question at index 11 (if needed)
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <img src="/pentagon.png" alt="Shape for copying" style={{ maxWidth: '45%', height: 'auto' }} />
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
    onClick={() => {
      // Handle submit action
      setTestCompleted(true);
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
              isPatient={isPatient}
              allSelectedAnswers={allSelectedAnswers} 
              language={language}
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

  // Initial Popup Component
  // Initial Popup Component
const InitialPopup = ({ language, setLanguage, onClose }) => (
  <div
    className="initial-popup-overlay"
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
    }}
  >
    <div
      className="initial-popup-content"
      style={{ maxWidth: '600px', width: '90%', textAlign: 'center' }}
    >
      <h2>
        {language === 'english'
          ? 'Welcome to the Dementia Test!'
          : 'डिमेंशिया टेस्ट में आपका स्वागत है!'}
      </h2>
      <p style={{ marginTop: '10px', fontSize: '1.2em', color: '#555' }}>
        {language === 'english' ? (
          <>
            This test includes three parts:
            <br />
            <br />
            <strong>Paragraph Reading</strong> (1 min)
            <br />
            <strong>Picture Interpretation</strong> (1 min)
            <br />
            <strong>MMSE online test</strong> (~15 min, requires a caregiver if
            available)
            <br />
            <br />
            Please ensure you’re in a quiet space with audio and video recording
            permissions enabled.
            <br />
            <br />
            Please Choose the language for the test
          </>
        ) : (
          <>
            यह टेस्ट तीन भागों में है:
            <br />
            <br />
            <strong>पैराग्राफ पढ़ना</strong> (1 मिनट)
            <br />
            <strong>चित्र व्याख्या</strong> (1 मिनट)
            <br />
            <strong>MMSE ऑनलाइन टेस्ट</strong> (~15 मिनट, केयरगिवर उपलब्ध हो तो)
            <br />
            <br />
            कृपया सुनिश्चित करें कि आप शांत स्थान में हैं और ऑडियो-वीडियो रिकॉर्डिंग
            अनुमति सक्षम है।
            <br />
            <br />
            कृपया परीक्षण के लिए भाषा चुनें
          </>
        )}
      </p>
      <div className="language-selection" style={{ marginTop: '20px' }}>
        <button
          onClick={() => setLanguage('english')}
          className={`language-button ${
            language === 'english' ? 'active' : ''
          }`}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('hindi')}
          className={`language-button ${language === 'hindi' ? 'active' : ''}`}
          style={{ padding: '10px 20px' }}
        >
          हिंदी
        </button>
      </div>
      <button
        onClick={onClose}
        className="begin-test-button"
        style={{ marginTop: '20px', padding: '10px 20px' }}
      >
        {language === 'english' ? 'Begin Test' : 'टेस्ट शुरू करें'}
      </button>
    </div>
  </div>
);


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
        {showModal && <InstructionModal onClose={() => setShowModal(false)} />}

        <div className="gradient-bg" />
        <div className="container">
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
          
          <div className="content">
            {/* <h1 className="task-title">{tasks[selectedTab].title[language]}</h1> */}
            
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
            />
            {selectedTab !== 2 && (
              <form
                onSubmit={handleSubmit}
                className="media-form"
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
                <>
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
                      cursor: 'pointer',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
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
                </>
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

        {/* Custom Refresh Warning Dialog */}
        {showRefreshWarning && (
          <div 
            className="modal-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}
          >
            <div 
              className="modal-content"
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '400px',
                width: '90%'
              }}
            >
              <h2 style={{ marginBottom: '15px', fontSize: '1.2em', fontWeight: 'bold' }}>
                {language === 'hindi' ? 'पृष्ठ रीफ्रेश की पुष्टि करें' : 'Confirm Page Refresh'}
              </h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                {language === 'hindi' 
                  ? 'पृष्ठ को रीफ्रेश करने से सभी वर्तमान प्रविष्टियां हट जाएंगी। क्या आप जारी रखना चाहते हैं?'
                  : 'Refreshing the page will remove all current entries. Do you want to continue?'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={handleRefreshCancel}
                  className="custom-button"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {language === 'hindi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  onClick={handleRefreshConfirm}
                  className="custom-button"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
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
