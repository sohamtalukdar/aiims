import React, { useRef, useEffect } from 'react';

export default function  InstructionModal ({ onClose, selectedTab, language }) {
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