import React from 'react';

const InstructionModal = ({ onClose, selectedTab, language }) => (
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
        ) : language === 'hindi' ? (
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
        )}
      </p>
      <button className="custom-ok-button" onClick={onClose}>
        OK
      </button>
    </div>
  </div>
);

export default InstructionModal;
