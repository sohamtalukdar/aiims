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
  ];

  const handleTabClick = (id) => {
    setSelectedTab(id);
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
        <h2>Instructions</h2>
        <p>
          {selectedTab === 1 
            ? 'Please click on the "Record Video" button and perform the task as per the instructions.'
            : 'Please click on the "Record Voice" button and read the passage out loud.'}
          Once finished, click "Stop Recording" and then "Submit" to save your recording.
        </p>
        <button className="custom-ok-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );

  const TaskContent = ({ task }) => (
    <div className="task-content">
      {task.image ? (
        <img src={task.image} alt="Task" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      ) : (
        <p style={{ width: '60%', margin: '0 auto', lineHeight: '1.8', fontSize: '1.1em' }}>
          {task.paragraph[language]}
        </p>
      )}
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
              {task.title[language]}
            </div>
          ))}
        </div>

        <div className="content">
          <button onClick={toggleLanguage} style={{ marginBottom: '10px', padding: '8px 12px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            {language === 'hindi' ? 'Switch to English' : 'हिंदी पर स्विच करें'}
          </button>

          <h1 className="task-title">{tasks[selectedTab].title[language]}</h1>
          <TaskContent task={tasks[selectedTab]} />

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
                  backgroundColor: '#007bff',  // Same color as other buttons
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

            {/* Render tick animation after submission */}
            {showTick && <span className="tick">✔</span>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default FileUploadForm;
