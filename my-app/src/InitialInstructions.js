import React, {useRef, useEffect} from 'react';

const InitialInstructions = ({ onAccept, onDeny, setIsPatient, language ,selectedTab}) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, [language, selectedTab]);

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

export default InitialInstructions;