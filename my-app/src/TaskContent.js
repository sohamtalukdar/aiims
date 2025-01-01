import React from 'react';
import TaskCompletion from './TaskCompletion';
import InitialInstructions from './InitialInstructions';
import MultipleChoiceTask from './MultipleChoiceTask';


const TaskContent = ({
  task,
  language,
  testCompleted,
  showInitialInstructions,
  setShowInitialInstructions,
  setTestCompleted,
  allSelectedAnswers,
  setAllSelectedAnswers,
  setIsPatient,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  setShowImageModal,
  showImageModal
}) => {
  if (task.id === 2) {
    if (testCompleted) {
      return (
        <div className="w-full flex justify-center items-center">
          <TaskCompletion 
            language={language}
            allSelectedAnswers={allSelectedAnswers} 
          />
        </div>
      );
    }
    
    // If initial instructions are to be shown
    if (showInitialInstructions) {
      return (
        <InitialInstructions
          onAccept={() => setShowInitialInstructions(false)}
          onDeny={() => {
            setShowInitialInstructions(false);
            setTestCompleted(true);
          }}
          setIsPatient={setIsPatient}
          language={language}
        />
      );
    }

    // Render the MultipleChoiceTask
    return (
      <MultipleChoiceTask
        task={task}
        language={language}
        setTestCompleted={setTestCompleted}
        allSelectedAnswers={allSelectedAnswers}
        setAllSelectedAnswers={setAllSelectedAnswers}
        currentQuestionIndex={currentQuestionIndex}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
      />
    );      
  }

  return (
    <div className="task-content">
      {task.image ? (
        <>
          {/* Added click to enlarge text */}
          <div style={{ 
            textAlign: 'left', 
            marginBottom: '5px',
            fontSize: '14px',
            color: '#666',
            cursor: 'pointer'
          }}>
            {language === 'hindi' ? 'ज़ूम इन/ज़ूम आउट करने के लिए छवि पर क्लिक करें' : 'Click on the image to zoom in / zoom out'} 🔍
          </div>
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