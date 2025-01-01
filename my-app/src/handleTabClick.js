const handleTabClick = ({
    id,
    completedTasks,
    selectedTab,
    setCountdown,
    setMediaURL,
    mediaChunksRef,
    mediaRecorderRef,
    setSelectedTab,
    setShowModal,
    setShowInitialInstructions
  }) => {
    try {
        // Validate inputs
        if (id == null || !completedTasks || !mediaChunksRef || !mediaRecorderRef) {
          console.error('Required parameters missing in handleTabClick');
          return;
        }
    
        // Prevent navigation to completed tasks
        if (completedTasks.has(id)) {
          return;
        }
    
        // Prevent going back to previous tasks
        if (id < selectedTab) {
          return;
        }

    setCountdown(60);
    setMediaURL("");
    mediaChunksRef.current = [];
  
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  
    setSelectedTab(id);
    setShowModal(id !== 2);
    setShowInitialInstructions(id === 2);
  
} catch (error) {
    console.error('Error in handleTabClick:', error);
    // You might want to handle this error more gracefully in the UI
  }
};
  export default handleTabClick;