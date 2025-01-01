// utils/scoreUtils.js
export const calculateScore = (allSelectedAnswers) => {
    let totalScore = 0;
  
    if (!allSelectedAnswers || Object.keys(allSelectedAnswers).length === 0) {
      return totalScore; // No answers, score is 0
    }
  
    Object.entries(allSelectedAnswers).forEach(([questionIndex, selections]) => {
      if (selections && selections.length > 0) {
        totalScore += selections.length;
      }
    });
  
    return totalScore;
  };
  