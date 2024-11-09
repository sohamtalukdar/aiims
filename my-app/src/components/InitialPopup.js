import React from 'react';

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
    <div className="initial-popup-content" style={{ maxWidth: '600px', width: '90%', textAlign: 'center' }}>
      <h2>
        {language === 'english' ? 'Welcome to the Dementia Test!' : 'डिमेंशिया टेस्ट में आपका स्वागत है!'}
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
            <strong>MMSE online test</strong> (~15 min, requires a caregiver if available)
            <br />
            <br />
            Please ensure you’re in a quiet space with audio and video recording permissions enabled.
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
            कृपया सुनिश्चित करें कि आप शांत स्थान में हैं और ऑडियो-वीडियो रिकॉर्डिंग अनुमति सक्षम है।
            <br />
            <br />
            कृपया परीक्षण के लिए भाषा चुनें
          </>
        )}
      </p>
      <div className="language-selection" style={{ marginTop: '20px' }}>
        <button
          onClick={() => setLanguage('english')}
          className={`language-button ${language === 'english' ? 'active' : ''}`}
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

export default InitialPopup;
