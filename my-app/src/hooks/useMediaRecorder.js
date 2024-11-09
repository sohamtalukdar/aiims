import { useState, useRef } from 'react';

const useMediaRecorder = (selectedTab) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaURL, setMediaURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const mediaChunksRef = useRef([]);

  const handleMediaRecord = () => {
    const mediaType = selectedTab === 1 ? { video: true } : { audio: true };

    if (!isRecording) {
      navigator.mediaDevices
        .getUserMedia(mediaType)
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          mediaChunksRef.current = [];
          mediaRecorder.start();
          setIsRecording(true);

          mediaRecorder.addEventListener('dataavailable', (event) => {
            mediaChunksRef.current.push(event.data);
          });

          mediaRecorder.addEventListener('stop', () => {
            const mediaBlob = new Blob(mediaChunksRef.current, {
              type: selectedTab === 1 ? 'video/webm' : 'audio/webm',
            });

            if (selectedTab === 1) {
              setVideoBlob(mediaBlob);
            } else {
              setAudioBlob(mediaBlob);
            }

            setMediaURL(URL.createObjectURL(mediaBlob));
            setIsRecording(false);
          });
        })
        .catch((err) => {
          console.error('Error accessing media:', err);
          alert(
            `Could not access your ${selectedTab === 1 ? 'camera' : 'microphone'}. Please check your browser settings.`
          );
        });
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleReRecord = () => {
    setMediaURL('');

    if (selectedTab === 1) {
      setVideoBlob(null);
    } else {
      setAudioBlob(null);
    }

    handleMediaRecord();
  };

  return {
    isRecording,
    mediaURL,
    audioBlob,
    videoBlob,
    handleMediaRecord,
    handleReRecord,
  };
};

export default useMediaRecorder;
