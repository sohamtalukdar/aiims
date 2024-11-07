import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';

function FileUploadForm() {
  const { state } = useLocation();
  const [showModal, setShowModal] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [language, setLanguage] = useState('hindi');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaURL, setMediaURL] = useState("");
  const [showTick, setShowTick] = useState(false);
  const mediaRecorderRef = useRef(null);
  const mediaChunksRef = useRef([]);
  const [showImageModal, setShowImageModal] = useState(false); // New state for image modal


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
    setSelectedTab(id);
    setShowModal(true); // Show modal when switching to a new task
  };

  const toggleLanguage = (e) => {
    e.preventDefault();
    setLanguage((prev) => (prev === 'hindi' ? 'english' : 'hindi'));
  };

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
          const mediaBlob = new Blob(mediaChunksRef.current, { type: selectedTab === 1 ? 'video/webm' : 'audio/webm' });
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

  const InstructionModal = ({ onClose }) => (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content">
        <h2>Instructions / निर्देश</h2>
        <p style={{ marginTop: '10px', fontSize: '1.2em', color: '#555' }}>
          {selectedTab === 0 
            ? 'Please click on the "Record Voice" button and read the passage out loud. Once finished, click "Stop Recording" and then "Submit" to save your recording.'
            : 'Please click on the "Record Video" button and describe what you see in the picture. If you want to zoom then click on the picture. Once finished, click "Stop Recording" and then "Submit" to save your recording.'}
        </p>
        <p style={{ marginTop: '10px', fontSize: '1.2em', color: '#555' }}>
          {selectedTab === 0 
            ? 'कृपया "आवाज़ रिकॉर्ड करें" बटन पर क्लिक करें और जोर से पढ़ें। समाप्त होने पर, "रिकॉर्डिंग रोकें" पर क्लिक करें और फिर अपनी रिकॉर्डिंग को सहेजने के लिए "जमा करें" दबाएँ।'
            : 'कृपया "वीडियो रिकॉर्ड करें" बटन पर क्लिक करें और चित्र में जो आप देख रहे हैं उसका वर्णन करें। यदि आप ज़ूम करना चाहते हैं, तो चित्र पर क्लिक करें। समाप्त होने पर, "रिकॉर्डिंग रोकें" पर क्लिक करें और फिर अपनी रिकॉर्डिंग को सहेजने के लिए "जमा करें" दबाएँ।'}
        </p>
        <button className="custom-ok-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
  

  const MultipleChoiceTask = ({ task, language }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
  
    const handleNext = () => {
      if (currentQuestionIndex < task.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswers([]); // Clear selections when moving to the next question
      }
    };
  
    const handlePrevious = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setSelectedAnswers([]); // Clear selections when moving to the previous question
      }
    };
  
    const handleAnswerSelect = (index) => {
      setSelectedAnswers((prevSelected) =>
        prevSelected.includes(index)
          ? prevSelected.filter((answer) => answer !== index) // Deselect if already selected
          : [...prevSelected, index] // Select if not already selected
      );
    };
  
    return (
      <div className="multiple-choice-task">
        <h3 style={{ textAlign: 'center', marginBottom: '5px' }}> {/* Reduced marginBottom */}
          {task.questions[currentQuestionIndex].question[language]}
        </h3>
    
        {currentQuestionIndex === 11 ? ( // Replace with the specific index of your image question
          <div style={{ textAlign: 'center', marginTop: '10px' }}> {/* Reduced marginTop */}
            <img src="/pentagon.png" alt="Shape for copying" style={{ maxWidth: '45%', height: 'auto' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}> {/* Reduced marginTop */}
              {task.questions[currentQuestionIndex].choices.map((choice, index) => (
                <label key={index} style={{ textAlign: 'center', margin: '5px 0' }}> {/* Reduced margin */}
                  <input
                    type="checkbox"
                    name="option"
                    checked={selectedAnswers.includes(index)}
                    onChange={() => handleAnswerSelect(index)}
                  />
                  {choice[language]} {/* Display choice based on selected language */}
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '30vh',
            marginTop: '10px' /* Reduced marginTop */
          }}>
            {task.questions[currentQuestionIndex].choices.map((choice, index) => (
              <label 
                key={index} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  textAlign: 'center', 
                  margin: '5px 0', /* Reduced margin */
                  width: '200px', 
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedAnswers.includes(index)}
                  onChange={() => handleAnswerSelect(index)}
                  style={{ marginRight: '10px' }}
                />
                {choice[language]}
              </label>
            ))}
          </div>
        )}
        
        <div className="navigation-buttons" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}> {/* Reduced marginTop */}
          <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} style={{ marginRight: '10px' }}>Previous</button>
          <button onClick={handleNext} disabled={currentQuestionIndex === task.questions.length - 1}>Next</button>
        </div>
      </div>
    );       
  };

  const TaskContent = ({ task, language }) => {
    if (task.id === 2) {
      return <MultipleChoiceTask task={task} language={language} />;
    }
  
    return (
      <div className="task-content">
        {task.image ? (
          <>
            <img
              src={task.image}
              alt="Task"
              style={{ cursor: 'pointer', maxWidth: '100%', maxHeight: '100%' }}
              onClick={() => setShowImageModal(true)} // Show modal on image click
            />
            {showImageModal && (
              <div className="image-modal">
                <img
                  src={task.image}
                  alt="Popup Task"
                  style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                  onClick={() => setShowImageModal(false)} // Close modal on image click
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
  


  return (
    <div className="app">
      {showModal && <InstructionModal onClose={() => setShowModal(false)} />}

      <div className="gradient-bg"></div>
      <div className="container">
        <div className="tabs">
          {tasks.map((task) => (
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
          <button onClick={toggleLanguage} style={{ marginBottom: '10px', padding: '8px 12px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            {language === 'hindi' ? 'Switch to English' : 'हिंदी पर स्विच करें'}
          </button>

          <h1 className="task-title">{tasks[selectedTab].title[language]}</h1>
          <TaskContent task={tasks[selectedTab]} language={language} />


          {selectedTab !== 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px', position: 'relative' }}>
              <div className="media-controls">
                {mediaURL ? (
                  <>
                    {selectedTab === 1 ? <video src={mediaURL} controls /> : <audio src={mediaURL} controls />}
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
                    {isRecording ? (language === 'hindi' ? 'रिकॉर्डिंग रोकें' : 'Stop Recording') : (language === 'hindi' ? (selectedTab === 1 ? 'वीडियो रिकॉर्ड करें' : 'आवाज़ रिकॉर्ड करें') : (selectedTab === 1 ? 'Record Video' : 'Record Voice'))}
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
    </div>
  );
}

export default FileUploadForm;