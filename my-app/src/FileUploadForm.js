import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css'; // Ensure you're importing your app.css

function FileUploadForm() {
  const { state } = useLocation();
  const [showModal, setShowModal] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [language, setLanguage] = useState('hindi');
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const tasks = [
    {
      id: 0,
      title: '1st Task',
      paragraph: {
        hindi: `एक बार की बात है, एक छोटे से गाँव में, एक प्यारी सी बच्ची रहती थी। उसका नाम नीता था। नीता बचपन से ही बहुत ही समझदार थी। वह हमेशा अपने दादी के साथ खेलती और बातें करती थी। 
                एक दिन, नीता के पास एक खास खिलौना आया। यह एक सुंदर सा किताब था, जिसमें फूलों के बारे में बहुत सी ख़ूबसूरत तस्वीरें थीं। नीता ने दादी के साथ उस किताब को देखकर खुशी-खुशी पढ़ना शुरू किया। 
                उसके बाद, नीता ने अपने दोस्तों को भी वो किताब दिखाई और सबको फूलों के बारे में बताया। और सबको यह सिखाया कि प्रकृति की सुंदर सी चीजों को सबको समझने का अवसर मिलता है।
                इस कहानी का संदेश है कि हमें प्रकृति की सुंदरता को समझने और महसूस करने का समय निकालना चाहिए, और हमें अपने परिवार और दोस्तों के साथ उसे साझा करना चाहिए।`,
        english: `Once upon a time, in a small village, there was a lovely little girl named Neeta. Neeta was very wise from a young age. She would always play with her grandmother and chat with her.
                  One day, Neeta got a special toy, a beautiful book with many lovely pictures of flowers. She happily started reading it with her grandmother.
                  Later, she showed the book to her friends and told them about the flowers, teaching everyone about the beauty of nature.
                  The message of this story is that we should take time to understand and appreciate nature's beauty and share it with family and friends.`
      }
    },
    {
      id: 1,
      title: '2nd Task',
      paragraph: {
        hindi: 'यह दूसरी कार्य के लिए अनुच्छेद है।',
        english: 'This is the paragraph for the 2nd task.'
      }
    },
  ];

  const handleTabClick = (id) => {
    setSelectedTab(id);
  };

  const toggleLanguage = (e) => {
    e.preventDefault();
    setLanguage((prev) => (prev === 'hindi' ? 'english' : 'hindi'));
  };

  const handleAudioRecord = () => {
    if (!isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.start();
        setIsRecording(true);

        mediaRecorder.addEventListener('dataavailable', (event) => {
          audioChunksRef.current.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioURL(URL.createObjectURL(audioBlob));
          setIsRecording(false);
        });
      }).catch((err) => {
        console.error('Error accessing microphone:', err);
        alert('Could not access your microphone. Please check your browser settings.');
      });
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleReRecord = () => {
    setAudioURL("");
    handleAudioRecord();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioURL) {
      alert('Please record audio before submitting.');
      return;
    }

    const response = await fetch(audioURL);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('name', state?.name);
    formData.append('age', state?.age);
    formData.append('audio', blob, 'recording.webm');

    const uploadResponse = await fetch('http://localhost:8000/upload/', {
      method: 'POST',
      body: formData,
    });

    const result = await uploadResponse.json();
    console.log(result);
    alert(`Uploaded successfully: Audio URL: ${result.audio_url}`);
  };

  // Modal component for instructions
  const InstructionModal = ({ onClose }) => (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content">
        <h2>Instructions</h2>
        <p>
          Please click on the "Record Voice" button and read the passage out loud
          in whichever language you’re comfortable with. Once you finish reading,
          click "Stop Recording" and then "Submit" to save your recording.
        </p>
        <button className="custom-ok-button" onClick={onClose}>OK</button> {/* OK button to close modal */}
      </div>
    </div>
  );

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
              {task.title}
            </div>
          ))}
        </div>

        <div className="content">
          <button
            onClick={toggleLanguage}
            onMouseDown={(e) => e.preventDefault()}
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
            Switch to {language === 'hindi' ? 'English' : 'Hindi'}
          </button>

          <h1>{tasks[selectedTab].title}</h1>
          <p style={{ textAlign: 'center', width: '60%', margin: '0 auto', lineHeight: '1.8', fontSize: '1.1em' }}>
            {tasks[selectedTab].paragraph[language]}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
            <div className="audio-controls">
              {audioURL ? (
                <>
                  <audio src={audioURL} controls />
                  <button type="button" onClick={handleReRecord}>Re-record</button>
                </>
              ) : (
                <button type="button" onClick={handleAudioRecord}>
                  {isRecording ? 'Stop Recording' : 'Record Voice'}
                </button>
              )}
            </div>
            
            <button type="submit" disabled={!audioURL}>Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FileUploadForm;
