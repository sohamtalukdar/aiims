import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TaskCompletion from './components/TaskCompletion';
import InstructionModal from './components/InstructionModal';
import InitialPopup from './components/InitialPopup';
import MultipleChoiceTask from './components/MultipleChoiceTask';
import TaskContent from './components/TaskContent';
import tasks from './data/tasks';
import './App.css';

const LANGUAGES = {
  ENGLISH: 'english',
  HINDI: 'hindi',
};

function FileUploadForm() {
  const { state } = useLocation();
  const [appState, setAppState] = useState({
    isPatient: true,
    language: LANGUAGES.ENGLISH,
    selectedTab: 0,
    showModal: true,
    showInitialPopup: true,
    testCompleted: false,
    showRefreshWarning: false,
  });

  const [recordingState, setRecordingState] = useState({
    isRecording: false,
    mediaURL: "",
    countdown: 60,
    audioBlob: null,
    videoBlob: null,
  });

  const [taskState, setTaskState] = useState({
    completedTasks: new Set(),
    allSelectedAnswers: JSON.parse(sessionStorage.getItem("allSelectedAnswers")) || {},
  });

  const mediaRecorderRef = useRef(null);
  const mediaChunksRef = useRef([]);

  useEffect(() => {
    sessionStorage.setItem("allSelectedAnswers", JSON.stringify(taskState.allSelectedAnswers));
  }, [taskState.allSelectedAnswers]);

  useEffect(() => {
    const clearDataOnRefresh = () => sessionStorage.clear();
    window.addEventListener("beforeunload", clearDataOnRefresh);
    return () => window.removeEventListener("beforeunload", clearDataOnRefresh);
  }, []);

  const handleTabClick = (id) => {
    if (taskState.completedTasks.has(id) || id < appState.selectedTab) return;

    setRecordingState((prev) => ({
      ...prev,
      mediaURL: "",
      countdown: 60,
      audioBlob: null,
      videoBlob: null,
    }));
    mediaChunksRef.current = [];
    if (mediaRecorderRef.current) stopRecording();

    setAppState((prev) => ({
      ...prev,
      selectedTab: id,
      showModal: id !== 2,
    }));
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleMediaRecord = () => {
    const isVideo = appState.selectedTab === 1;
    const mediaType = isVideo ? { video: true, audio: true } : { audio: true };

    if (!recordingState.isRecording) {
      navigator.mediaDevices.getUserMedia(mediaType)
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          mediaChunksRef.current = [];

          mediaRecorder.start();
          setRecordingState((prev) => ({ ...prev, isRecording: true }));

          const stopTimer = setTimeout(stopRecording, 60000);
          const countdownInterval = setInterval(() => {
            setRecordingState((prev) => ({
              ...prev,
              countdown: prev.countdown > 0 ? prev.countdown - 1 : 0,
            }));
            if (recordingState.countdown <= 1) clearInterval(countdownInterval);
          }, 1000);

          mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0) mediaChunksRef.current.push(event.data);
          });

          mediaRecorder.addEventListener('stop', () => {
            const mediaBlob = new Blob(mediaChunksRef.current, { type: isVideo ? 'video/webm' : 'audio/webm' });
            setRecordingState((prev) => ({
              ...prev,
              mediaURL: URL.createObjectURL(mediaBlob),
              audioBlob: !isVideo ? mediaBlob : null,
              videoBlob: isVideo ? mediaBlob : null,
              isRecording: false,
            }));
          });
        })
        .catch((err) => {
          console.error("Error accessing media:", err);
          alert(`Could not access your ${isVideo ? "camera" : "microphone"}. Check your browser settings.`);
        });
    } else {
      stopRecording();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!state?.name || !state?.age) {
      alert("Name and age are required");
      return;
    }

    const currentBlob = appState.selectedTab === 1 ? recordingState.videoBlob : recordingState.audioBlob;
    if (!currentBlob) {
      alert(`Please record ${appState.selectedTab === 1 ? "video" : "audio"} before submitting.`);
      return;
    }

    const formData = new FormData();
    formData.append("name", state.name);
    formData.append("age", state.age);
    formData.append(appState.selectedTab === 1 ? "video" : "audio", currentBlob);

    try {
      const response = await fetch("http://localhost:5001/save", { method: "POST", body: formData });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      setTaskState((prev) => ({
        ...prev,
        completedTasks: new Set([...prev.completedTasks, appState.selectedTab]),
      }));
      setRecordingState((prev) => ({ ...prev, mediaURL: "" }));
      handleTabClick(appState.selectedTab + 1);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    }
  };

  return (
    <div className="app">
      {appState.showInitialPopup ? (
        <InitialPopup
          language={appState.language}
          setLanguage={(lang) => setAppState((prev) => ({ ...prev, language: lang }))}
          onClose={() => setAppState((prev) => ({ ...prev, showInitialPopup: false }))}
        />
      ) : (
        <>
          {appState.showModal && <InstructionModal onClose={() => setAppState((prev) => ({ ...prev, showModal: false }))} />}
          <div className="tabs">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`tab ${appState.selectedTab === task.id ? "active" : ""}`}
                onClick={() => handleTabClick(task.id)}
              >
                {task.title[appState.language]}
              </div>
            ))}
          </div>
          <div className="content">
            <TaskContent
              task={tasks[appState.selectedTab]}
              language={appState.language}
              testCompleted={appState.testCompleted}
              setTestCompleted={(value) => setAppState((prev) => ({ ...prev, testCompleted: value }))}
            />
            <form onSubmit={handleSubmit}>
              {recordingState.mediaURL ? (
                <>
                  {appState.selectedTab === 1 ? <video src={recordingState.mediaURL} controls /> : <audio src={recordingState.mediaURL} controls />}
                  <button type="button" onClick={handleMediaRecord}>Re-record</button>
                </>
              ) : (
                <button type="button" onClick={handleMediaRecord}>{recordingState.isRecording ? "Stop Recording" : "Start Recording"}</button>
              )}
              <button type="submit" disabled={!recordingState.mediaURL}>Submit</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default FileUploadForm;
