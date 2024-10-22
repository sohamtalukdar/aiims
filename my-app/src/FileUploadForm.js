import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function FileUploadForm() {
  const { state } = useLocation(); // Corrected to use useLocation to get state
  const [selectedTab, setSelectedTab] = useState(0);  // Track selected tab
  const [audio, setAudio] = useState(null);  // Store the recorded audio file
  const [isRecording, setIsRecording] = useState(false);  // Track recording state
  const [audioURL, setAudioURL] = useState("");  // URL for the recorded audio
  const mediaRecorderRef = useRef(null);  // MediaRecorder for recording audio

  const tasks = [
    {
      id: 0,
      title: '1st Task',
      paragraph: `एक बार की बात है, एक छोटे से गाँव में, एक प्यारी सी बच्ची रहती थी। उसका नाम नीता था। नीता बचपन से ही बहुत ही समझदार थी। वह हमेशा अपने दादी के साथ खेलती और बातें करती थी। 

एक दिन, नीता के पास एक खास खिलौना आया। यह एक सुंदर सा किताब था, जिसमें फूलों के बारे में बहुत सी ख़ूबसूरत तस्वीरें थीं। नीता ने दादी के साथ उस किताब को देखकर खुशी-खुशी पढ़ना शुरू किया। 

उसके बाद, नीता ने अपने दोस्तों को भी वो किताब दिखाई और सबको फूलों के बारे में बताया। और सबको यह सिखाया कि प्रकृति की सुंदर सी चीजों को सबको समझने का अवसर मिलता है।

इस कहानी का संदेश है कि हमें प्रकृति की सुंदरता को समझने और महसूस करने का समय निकालना चाहिए, और हमें अपने परिवार और दोस्तों के साथ उसे साझा करना चाहिए।`
    },
    {
      id: 1,
      title: '2nd Task',
      paragraph: 'This is the paragraph for the 2nd task.'
    },
    {
      id: 2,
      title: '3rd Task',
      paragraph: 'This is the paragraph for the 3rd task.'
    },
    {
      id: 3,
      title: '4th Task',
      paragraph: 'This is the paragraph for the 4th task.'
    },
  ];

  const handleTabClick = (id) => {
    setSelectedTab(id);
  };

  const handleAudioRecord = () => {
    if (!isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start();
          setIsRecording(true);

          let audioChunks = [];
          mediaRecorder.addEventListener('dataavailable', (event) => {
            audioChunks.push(event.data);
          });

          mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
            const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });
            setAudio(audioFile);
            setAudioURL(URL.createObjectURL(audioBlob));
            setIsRecording(false);
          });
        });
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleReRecord = () => {
    setAudio(null);
    setAudioURL("");
    handleAudioRecord();  // Restart recording
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', state.name);
    formData.append('age', state.age);
    formData.append('audio', audio);

    const response = await fetch('http://localhost:8000/upload/', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log(result);
    alert(`Uploaded successfully: Audio URL: ${result.audio_url}`);
  };

  return (
    <div className="app">
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
          <h1>{tasks[selectedTab].title}</h1>
          <p>{tasks[selectedTab].paragraph}</p>
          
          <div className="audio-controls">
            {audioURL ? (
              <>
                <audio src={audioURL} controls />
                <button onClick={handleReRecord}>Re-record</button>
              </>
            ) : (
              <button onClick={handleAudioRecord}>
                {isRecording ? 'Stop Recording' : 'Record Voice'}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <button type="submit" disabled={!audio}>Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FileUploadForm;
