import { calculateScore } from './scoreUtils';
import config from './config.json';

const handleSubmit = async ({
  e,
  isSubmitting,
  setIsSubmitting,
  state,
  navigate,
  selectedTab,  
  allSelectedAnswers,
  videoBlob,
  audioBlob,
  setShowTick,
  setCompletedTasks,
  tasks,
  handleTabClick,
  setMediaURL,
  setVideoBlob,
  setAudioBlob
}) => {  
  e.preventDefault();
  if (isSubmitting) {
    console.log('Already submitting, returning');
    return;
  }
    
  console.log('Starting submission for tab:', selectedTab);
  setIsSubmitting(true);
    
  try {
    if (!state?.patientId || !state?.name || !state?.age) {
      alert('Patient information is missing. Please start over.');
      navigate('/');
      return;
    }

    const formData = new FormData();
    formData.append('name', state.name);
    formData.append('age', state.age);
    formData.append('patientId', state.patientId);
    
    // Initialize score as 0
    let scoreToSend = '0';
    
    // Only calculate score for MMSE test (tab 2)
    if (selectedTab === 2) {
      const calculatedScore = calculateScore(allSelectedAnswers);
      console.log('Tab 2: Calculated score:', calculatedScore);
      scoreToSend = calculatedScore.toString();
    } else {
      console.log(`Tab ${selectedTab}: Using default score: 0`);
    }
    
    console.log('Setting score in formData:', scoreToSend);
    formData.append('score', scoreToSend);

    // Log all form data being sent
    console.log('Form data contents:');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const currentBlob = selectedTab === 1 ? videoBlob : audioBlob;
    if (!currentBlob) {
      alert(`Please record ${selectedTab === 1 ? 'video' : 'audio'} before submitting.`);
      setIsSubmitting(false);
      return;
    }

    if (selectedTab === 1) {
      formData.append('video', currentBlob, 'video.webm');
    } else if (selectedTab === 0) {
      formData.append('audio', currentBlob, 'audio.webm');
    }

    console.log('Sending request to server...');
    const response = await fetch(`${config.base_url}/save`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    console.log('Server response:', result);

    setShowTick(true);
    setTimeout(() => {
      setShowTick(false);
      setCompletedTasks((prev) => new Set([...prev, selectedTab]));
      const nextTab = selectedTab + 1;
      if (nextTab < tasks.length) {
        handleTabClick(nextTab);
      }
    }, 1000);

    setMediaURL('');
    if (selectedTab === 1) {
      setVideoBlob(null);
    } else {
      setAudioBlob(null);
    }
  } catch (error) {
    console.error('Submission error:', error);
    alert(error.message || 'Error uploading file. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

export default handleSubmit;