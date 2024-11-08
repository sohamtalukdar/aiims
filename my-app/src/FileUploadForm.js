import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';

function FileUploadForm() {
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

  // State variables for instruction page in the third task
  const [showInitialInstructions, setShowInitialInstructions] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  const tasks = [
    {
      id: 0,
      title: { hindi: 'पहला कार्य', english: '1st Task' },
      paragraph: {
        hindi: 'एक बार की बात है, एक छोटे से गाँव में, एक प्यारी सी बच्ची रहती थी। उसका नाम नीता था। नीता बचपन से ही बहुत ही समझदार थी। वह हमेशा अपने दादी के साथ खेलती और बातें करती थी। एक दिन, नीता के पास एक खास खिलौना आया। यह एक सुंदर सा किताब था, जिसमें फूलों के बारे में बहुत सी ख़ूबसूरत तस्वीरें थीं। नीता ने दादी के साथ उस किताब को देखकर खुशी-खुशी पढ़ना शुरू किया। उसके बाद, नीता ने अपने दोस्तों को भी वो किताब दिखाई और सबको फूलों के बारे में बताया। और सबको यह सिखाया कि प्रकृति की सुंदर सी चीजों को सबको समझने का अवसर मिलता है। इस कहानी का संदेश है कि हमें प्रकृति की सुंदरता को समझने और महसूस करने का समय निकालना चाहिए, और हमें अपने परिवार और दोस्तों के साथ उसे साझा करना चाहिए।',
        english: 'Once upon a time, in a small village, there was a lovely little girl named Neeta. Neeta was very wise from a young age. She would always play with her grandmother and chat with her.One day, Neeta got a special toy, a beautiful book with many lovely pictures of flowers. She happily started reading it with her grandmother. Later, she showed the book to her friends and told them about the flowers, teaching everyone about the beauty of nature.The message of this story is that we should take time to understand and appreciate nature\'s beauty and share it with family and friends.'
      }
    },
    {
      id: 1,
      title: { hindi: 'दूसरा कार्य', english: '2nd Task' },
      image: '/image.png',
    },
    {
      id: 2,
      title: { hindi: 'तीसरा कार्य', english: '3rd Task' },
      questions: [
        {
          question: { hindi: 'यह कौन सा है?', english: 'What is the' },
          choices: [
            { hindi: 'वर्ष', english: 'Year' },
            { hindi: 'ऋतु', english: 'Season' },
            { hindi: 'सप्ताह का दिन', english: 'Day of the week' },
            { hindi: 'महीना', english: 'Month' },
            { hindi: 'तारीख', english: 'Date' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'हम अभी कहाँ हैं?', english: 'Where are we now' },
          choices: [
            { hindi: 'राज्य', english: 'State' },
            { hindi: 'देश', english: 'Country' },
            { hindi: 'शहर/नगर', english: 'Town/City' },
            { hindi: 'अस्पताल', english: 'Hospital' },
            { hindi: 'मंज़िल', english: 'Floor' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: '3 असंबंधित वस्तुओं का नाम बताएं, विषय से उन्हें अब दोहराने और बाद में याद रखने के लिए कहें। उदाहरण:', english: 'Name 3 unrelated objects, ask subject to recite them now and remember them for later. e.g.' },
          choices: [
            { hindi: 'सेब', english: 'Apple' },
            { hindi: 'मेज़', english: 'Table' },
            { hindi: 'पैसा', english: 'Penny' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: '100 से पीछे की ओर सात-सात करके गिनती करें', english: 'Count backward from 100 by sevens' },
          choices: [
            { hindi: '93', english: '93' },
            { hindi: '86', english: '86' },
            { hindi: '79', english: '79' },
            { hindi: '72', english: '72' },
            { hindi: '65', english: '65' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'पहले याद करने को कहा गया तीन चीज़ों का नाम बताएं:', english: 'Name the three things asked to remember earlier:' },
          choices: [
            { hindi: 'सेब', english: 'Apple' },
            { hindi: 'मेज़', english: 'Table' },
            { hindi: 'पैसा', english: 'Penny' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी को दिखाई गई वस्तुओं का नाम बताएं:', english: 'Name objects shown to patient:' },
          choices: [
            { hindi: 'कलाई घड़ी या घड़ी', english: 'Wristwatch or Clock' },
            { hindi: 'पेन या पेंसिल', english: 'Pen or Pencil' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'वाक्य को दोहराएं:', english: 'Repeat the phrase:' },
          choices: [
            { hindi: '"नहीं अगर, और, या परन्तु"', english: '"No ifs, ands, or buts."' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी से इन निर्देशों का पालन करने के लिए कहें:', english: 'Ask the patient to follow these instructions:' },
          choices: [
            { hindi: 'कागज़ को अपने दाएं हाथ में लें', english: 'Take the paper in your right hand' },
            { hindi: 'इसे आधा मोड़ें', english: 'Fold it in half' },
            { hindi: 'और इसे फर्श पर रखें', english: 'And put it on the floor' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी से निम्नलिखित निर्देश पढ़ने और उसका पालन करने के लिए कहें:', english: 'Ask the patient to read the following instruction and follow it:' },
          choices: [
            { hindi: '"अपनी आँखें बंद करें"', english: '"Close your eyes"' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी से निम्नलिखित निर्देश पढ़ने और उसका पालन करने के लिए कहें:', english: 'Ask the patient to read the following instruction and follow it:' },
          choices: [
            { hindi: 'निर्देश का पालन किया गया', english: 'Instruction followed' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी से कुछ भी एक वाक्य बनाकर लिखने के लिए कहें, जिसमें एक संज्ञा और एक क्रिया हो, कागज़ पर:', english: 'Ask the patient to make up and write a sentence about anything, which contains a noun and a verb on the blank paper:' },
          choices: [
            { hindi: 'वाक्य स्वीकार्य है', english: 'Sentence acceptable' }
          ],
          answer: null, // User's selected answer
        },
        {
          question: { hindi: 'रोगी से इस चित्र को कागज़ पर कॉपी करने के लिए कहें:', english: 'Ask the patient to copy this picture on the blank paper:' },
          choices: [
            { hindi: 'चित्र स्वीकार्य', english: 'Picture acceptable' } // Leave blank if image will be shown instead of choices
          ],
          answer: null, // User's selected answer
        },   
      ]
    }
  ];

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
      // setTestCompleted(false); // Remove or comment out this line
    }
  };
  


  // const toggleLanguage = (e) => {
  //   e.preventDefault();
  //   setLanguage((prev) => (prev === 'hindi' ? 'english' : 'hindi'));
  // };

  const handleMediaRecord = () => {
    const mediaType = selectedTab === 1 ? { video: true } : { audio: true };

    if (!isRecording) {
      navigator.mediaDevices.getUserMedia(mediaType).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaChunksRef.current = [];
        mediaRecorder.start();
        setIsRecording(true);

        mediaRecorder.addEventListener('dataavailable', (event) => {
          mediaChunksRef.current.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const mediaBlob = new Blob(mediaChunksRef.current, {
            type: selectedTab === 1 ? 'video/webm' : 'audio/webm',
          });
          setMediaURL(URL.createObjectURL(mediaBlob));
          setIsRecording(false);
        });
      }).catch((err) => {
        console.error('Error accessing media:', err);
        alert(`Could not access your ${selectedTab === 1 ? 'camera' : 'microphone'}. Please check your browser settings.`);
      });
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleReRecord = () => {
    setMediaURL("");
    handleMediaRecord();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mediaURL) {
      alert(`Please record ${selectedTab === 1 ? 'video' : 'audio'} before submitting.`);
      return;
    }

    const response = await fetch(mediaURL);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('name', state?.name);
    formData.append('age', state?.age);
    formData.append(selectedTab === 1 ? 'video' : 'audio', blob, selectedTab === 1 ? 'recording.webm' : 'audio.webm');

    const uploadResponse = await fetch('http://localhost:8000/upload/', {
      method: 'POST',
      body: formData,
    });

    const result = await uploadResponse.json();
    console.log(result);
    alert(`Uploaded successfully: ${selectedTab === 1 ? 'Video' : 'Audio'} URL: ${result.media_url}`);

    // Show the tick animation
    setShowTick(true);

    // Hide the tick after 2 seconds
    setTimeout(() => {
      setShowTick(false);
    }, 2000);
  };

  // Instruction Modal Component
  const InstructionModal = ({ onClose }) => (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content">
        <h2>Instructions / निर्देश</h2>
        <p style={{ marginTop: '10px', fontSize: '1.2em', color: '#555' }}>
        {selectedTab === 0 ? (
    language === 'hindi' ? (
        <>
            <p>कृपया "आवाज़ रिकॉर्ड करें" बटन पर क्लिक करें और जोर से पढ़ें।</p>
            <p>समाप्त होने पर, "रिकॉर्डिंग रोकें" पर क्लिक करें और फिर अपनी रिकॉर्डिंग को सहेजने के लिए "जमा करें" दबाएँ।</p>
        </>
    ) : (
        <>
            <p>Please click on the "Record Voice" button and read the passage out loud.</p>
            <p>Once finished, click "Stop Recording" and then "Submit" to save your recording.</p>
        </>
    )
) : (
    language === 'hindi' ? (
        <>
            <p>कृपया "वीडियो रिकॉर्ड करें" बटन पर क्लिक करें और चित्र में जो आप देख रहे हैं उसका वर्णन करें।</p>
            <p>यदि आप ज़ूम करना चाहते हैं, तो चित्र पर क्लिक करें।</p>
            <p>समाप्त होने पर, "रिकॉर्डिंग रोकें" पर क्लिक करें और फिर अपनी रिकॉर्डिंग को सहेजने के लिए "जमा करें" दबाएँ।</p>
        </>
    ) : (
        <>
            <p>Please click on the "Record Video" button and describe what you see in the picture.</p>
            <p>If you want to zoom, click on the picture.</p>
            <p>Once finished, click "Stop Recording" and then "Submit" to save your recording.</p>
        </>
    )
)}

        </p>
        <button className="custom-ok-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );

  // Initial Instructions Component for the third task
  const InitialInstructions = ({ onAccept, onDeny }) => (
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

  const MultipleChoiceTask = ({ task, language, setTestCompleted }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [allSelectedAnswers, setAllSelectedAnswers] = useState({});

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
        const currentSelections = prevSelected[currentQuestionIndex] || [];
        let updatedSelections;

        if (currentSelections.includes(choiceIndex)) {
          // Deselect if already selected
          updatedSelections = currentSelections.filter((index) => index !== choiceIndex);
        } else {
          // Select if not already selected
          updatedSelections = [...currentSelections, choiceIndex];
        }

        return {
          ...prevSelected,
          [currentQuestionIndex]: updatedSelections,
        };
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
                <label key={index} style={{ textAlign: 'center', margin: '5px 0' }}>
                  <input
                    type="checkbox"
                    name="option"
                    checked={currentSelections.includes(index)}
                    onChange={() => handleAnswerSelect(index)}
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
              : `Selected: ${totalSelectedCount}`}
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
  }) => {
    if (task.id === 2) {
      // If test is completed, show "Test Complete" message
      if (testCompleted) {
        return (
          <div className="test-complete-message">
            <h2>{language === 'hindi' ? 'परीक्षण पूरा' : 'Test Complete'}</h2>
            <p>{language === 'hindi' ? 'आपके समय के लिए धन्यवाद।' : 'Thank you for your time.'}</p>
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
          />
        );
      }

      // Render the MultipleChoiceTask
      return (
        <MultipleChoiceTask
          task={task}
          language={language}
          setTestCompleted={setTestCompleted}
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
              {/* <button
                onClick={toggleLanguage}
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
                {language === 'hindi' ? 'Switch to English' : 'हिंदी पर स्विच करें'}
              </button> */}

              <h1 className="task-title">{tasks[selectedTab].title[language]}</h1>
              <TaskContent
                task={tasks[selectedTab]}
                language={language}
                testCompleted={testCompleted}
                showInitialInstructions={showInitialInstructions}
                setShowInitialInstructions={setShowInitialInstructions}
                setTestCompleted={setTestCompleted}
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
                        <button type="button" onClick={handleReRecord} className="custom-button">
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

                  <button type="submit" disabled={!mediaURL} className="custom-button">
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
