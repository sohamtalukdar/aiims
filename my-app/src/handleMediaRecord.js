export default function handleMediaRecord({
  selectedTab,
  isRecording,
  setIsRecording,
  setMediaURL,
  setCountdown,
  setVideoBlob,
  setAudioBlob,
  mediaRecorderRef,
  mediaChunksRef,
}) {
  // Validate required parameters
  if (typeof setMediaURL !== "function") {
    throw new Error("setMediaURL must be a function");
  }
  if (typeof setIsRecording !== "function") {
    throw new Error("setIsRecording must be a function");
  }
  if (typeof setCountdown !== "function") {
    throw new Error("setCountdown must be a function");
  }

  const mediaType =
    selectedTab === 1
      ? { video: true, audio: true } // Video with audio
      : { audio: true }; // Audio only

  if (!isRecording) {
    // Clear previous recording state
    setMediaURL("");
    setCountdown(60); // Reset countdown
    if (selectedTab === 1) {
      setVideoBlob(null);
    } else {
      setAudioBlob(null);
    }

    console.log("Starting media recording for:", selectedTab === 1 ? "video" : "audio");

    // Request media access
    navigator.mediaDevices
      .getUserMedia(mediaType)
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaChunksRef.current = [];

        mediaRecorder.start();
        setIsRecording(true);
        console.log("MediaRecorder started");

        // Countdown logic
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              // Automatically stop recording when countdown reaches 0
              if (mediaRecorder.state === "recording") {
                console.log("Stopping recording due to countdown");
                mediaRecorder.stop();
                stream.getTracks().forEach((track) => track.stop());
                setIsRecording(false);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        mediaRecorder.countdownInterval = countdownInterval;

        // Event: Data Available
        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) {
            mediaChunksRef.current.push(event.data);
            console.log("Data chunk received:", event.data.size, "bytes");
          }
        });

        // Event: Stop
        mediaRecorder.addEventListener("stop", () => {
          const mediaBlob = new Blob(mediaChunksRef.current, {
            type: selectedTab === 1 ? "video/webm" : "audio/webm",
          });
          const url = URL.createObjectURL(mediaBlob);
          setMediaURL(url);

          if (selectedTab === 1) {
            setVideoBlob(mediaBlob);
            console.log("Video blob set:", mediaBlob);
          } else {
            setAudioBlob(mediaBlob);
            console.log("Audio blob set:", mediaBlob);
          }

          // Cleanup state
          setIsRecording(false);
          mediaChunksRef.current = [];
          clearInterval(mediaRecorder.countdownInterval);
        });
      })
      .catch((err) => {
        console.error("Error accessing media:", err);
        setIsRecording(false);
        alert(
          `Could not access your ${selectedTab === 1 ? "camera" : "microphone"}. Please check your browser settings.`
        );
      });
  } else {
    // Stop recording manually
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      clearInterval(mediaRecorderRef.current.countdownInterval);
      setCountdown(0);
      console.log("Recording stopped manually");
    }
  }
}

export const handleReRecord = ({
  setMediaURL,
  setVideoBlob,
  setAudioBlob,
  mediaChunksRef,
  mediaRecorderRef,
  selectedTab,
  handleMediaRecord,
  setIsRecording,
  setCountdown,
}) => {
  // Validate required parameters
  if (typeof setMediaURL !== "function") {
    throw new Error("setMediaURL must be a function");
  }

  console.log("Re-recording initiated");

  // Clear the current recording state
  setMediaURL("");
  if (selectedTab === 1) {
    setVideoBlob(null);
  } else {
    setAudioBlob(null);
  }

  // Clear media chunks
  mediaChunksRef.current = [];

  // Stop any existing streams
  if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
    mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
  }

  // Start new recording
  handleMediaRecord({
    selectedTab,
    isRecording: false,
    setIsRecording,
    setMediaURL,
    setCountdown,
    setVideoBlob,
    setAudioBlob,
    mediaRecorderRef,
    mediaChunksRef,
  });
};
