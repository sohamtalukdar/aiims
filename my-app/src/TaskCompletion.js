import React, { useRef, useEffect } from 'react';
import { calculateScore } from './scoreUtils'; // Adjust the path as necessary

export default function TaskCompletion({ language, allSelectedAnswers }) {
  const audioRef = useRef(null);
    
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []);

  const score = calculateScore(allSelectedAnswers);
  const maxScore = 30;
  
  const handleExit = () => {
    sessionStorage.clear()
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white max-w-2xl mx-auto">
      <audio
        ref={audioRef}
        src={language === 'english' ? '/audio/q16_en.mp3' : '/audio/q16_hi.mp3'}
      />
      <div className="text-center w-full">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          {language === 'hindi' ? 'धन्यवाद!' : 'Thank You!'}
        </h2>
        <div className="bg-blue-50 p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-xl font-semibold mb-2">
            {language === 'hindi' ? 'आपका MMSE स्कोर' : 'Your MMSE Score'}
          </h3>
          <div className="text-4xl font-bold text-blue-600">
            {score} / {maxScore}
          </div>
        </div>
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
          
          <button
            onClick={handleExit}
            style={{
              marginTop: '2rem',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            {language === 'hindi' ? 'बाहर निकलें' : 'Exit'}
          </button>
        </div>
      </div>
    </div>
  );
}
