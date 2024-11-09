import React, { useState } from 'react';

const MultipleChoiceTask = ({ task, language, setTestCompleted }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allSelectedAnswers, setAllSelectedAnswers] = useState({});

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
      const currentSelections = prevSelected[currentQuestionIndex] || [];
      let updatedSelections;

      if (currentSelections.includes(choiceIndex)) {
        // Deselect if already selected
        updatedSelections = currentSelections.filter((index) => index !== choiceIndex);
      } else {
        // Select if not already selected
        updatedSelections = [...currentSelections, choiceIndex];
      }

      return {
        ...prevSelected,
        [currentQuestionIndex]: updatedSelections,
      };
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

      {/* Render the current question and choices */}
      {currentQuestionIndex === 11 ? (
        // Special rendering for question at index 11 (if needed)
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <img src="/pentagon.png" alt="Shape for copying" style={{ maxWidth: '45%', height: 'auto' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
            {task.questions[currentQuestionIndex].choices.map((choice, index) => (
              <label key={index} style={{ textAlign: 'center', margin: '5px 0' }}>
                <input
                  type="checkbox"
                  name="option"
                  checked={currentSelections.includes(index)}
                  onChange={() => handleAnswerSelect(index)}
                />
                {choice[language]}
              </label>
            ))}
          </div>
        </div>
      ) : (
        // Default rendering for other questions
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '30vh',
            marginTop: '10px',
          }}
        >
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
      <div
        className="navigation-container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px',
        }}
      >
        <div className="navigation-buttons">
          <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} style={{ marginRight: '10px' }}>
            {language === 'hindi' ? 'पिछला' : 'Previous'}
          </button>
          <button onClick={handleNext} disabled={currentQuestionIndex === task.questions.length - 1}>
            {language === 'hindi' ? 'अगला' : 'Next'}
          </button>
        </div>
        <div className="selected-counter" style={{ marginRight: '20px' }}>
          {language === 'hindi' ? `चयनित: ${totalSelectedCount}` : `Selected: ${totalSelectedCount}`}
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
          onClick={() => {
            // Handle submit action
            setTestCompleted(true);
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
