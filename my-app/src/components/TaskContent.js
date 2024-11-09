import React from 'react';
import MultipleChoiceTask from './MultipleChoiceTask';
import InitialInstructions from './InitialInstructions';

const TaskContent = ({
  task,
  language,
  testCompleted,
  showInitialInstructions,
  setShowInitialInstructions,
  setTestCompleted,
  setShowImageModal,
  showImageModal,
}) => {
  if (task.id === 2) {
    // If test is completed, show "Test Complete" message
    if (testCompleted) {
      return (
        <div className="test-complete-message">
          <h2>{language === 'hindi' ? 'परीक्षण पूरा' : 'Test Complete'}</h2>
          <p>{language === 'hindi' ? 'आपके समय के लिए धन्यवाद।' : 'Thank you for your time.'}</p>
        </div>
      );
    }
    // If initial instructions are to be shown
    if (showInitialInstructions) {
      return (
        <InitialInstructions
          language={language}
          onAccept={() => setShowInitialInstructions(false)}
          onDeny={() => {
            setShowInitialInstructions(false);
            setTestCompleted(true);
          }}
        />
      );
    }

    // Render the MultipleChoiceTask
    return <MultipleChoiceTask task={task} language={language} setTestCompleted={setTestCompleted} />;
  }

  return (
    <div className="task-content">
      {task.image ? (
        <>
          <img
            src={task.image}
            alt="Task"
            style={{ cursor: 'pointer', maxWidth: '100%', maxHeight: '100%' }}
            onClick={() => setShowImageModal(true)}
          />
          {showImageModal && (
            <div className="image-modal">
              <img
                src={task.image}
                alt="Popup Task"
                style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                onClick={() => setShowImageModal(false)}
              />
            </div>
          )}
        </>
      ) : (
        <p style={{ width: '60%', margin: '0 auto', lineHeight: '1.8', fontSize: '1.1em' }}>
          {task.paragraph[language]}
        </p>
      )}
    </div>
  );
};

export default TaskContent;
