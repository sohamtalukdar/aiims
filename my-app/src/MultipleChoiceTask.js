import React from 'react';
import { useLocation } from 'react-router-dom';

const MultipleChoiceTask = ({
  task,
  language,
  setTestCompleted,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  allSelectedAnswers,
  setAllSelectedAnswers,
}) => {
  const { state } = useLocation();
  
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
      const updatedAnswers = { ...prevSelected };
      
      // Initialize array for current question if it doesn't exist
      if (!updatedAnswers[currentQuestionIndex]) {
        updatedAnswers[currentQuestionIndex] = [];
      }
      
      const currentAnswers = updatedAnswers[currentQuestionIndex];
      
      // Toggle selection
      const index = currentAnswers.indexOf(choiceIndex);
      if (index === -1) {
        // Add the choice if not already selected
        updatedAnswers[currentQuestionIndex] = [...currentAnswers, choiceIndex];
      } else {
        // Remove the choice if already selected
        updatedAnswers[currentQuestionIndex] = currentAnswers.filter(
          (idx) => idx !== choiceIndex
        );
      }
      
      return updatedAnswers;
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

      {currentQuestionIndex === 10 ? (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <img 
            src={process.env.PUBLIC_URL + '/pentagon.png'} 
            alt="Shape for copying" 
            style={{ maxWidth: '45%', height: 'auto' }}
            onError={(e) => {
              console.error("Image failed to load");
              console.log("Attempted path:", e.target.src);
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
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
        </div>
      ) : (
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
            : `Score: ${totalSelectedCount}`}
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
          onClick={async () => {
            const finalScore = Object.values(allSelectedAnswers).reduce(
              (total, selections) => total + (selections ? selections.length : 0),
              0
            );
            
            console.log('Final MMSE score:', finalScore);
            const formData = new FormData();
            formData.append('name', state.name);
            formData.append('age', state.age);
            formData.append('patientId', state.patientId);
            formData.append('score', finalScore.toString());

            try {
              console.log('Sending MMSE score to server:', finalScore);
              const response = await fetch('http://localhost:5001/save', {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) {
                throw new Error('Failed to save MMSE score');
              }

              console.log('MMSE score saved successfully');
              setTestCompleted(true);
            } catch (error) {
              console.error('Error saving MMSE score:', error);
              alert('Failed to save test score. Please try again.');
            }
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

export default MultipleChoiceTask;