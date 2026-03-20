
import React, { useState, useRef } from 'react';
import axios from 'axios';

const ScreenRecorder = ({ jobId, onUploadSuccess }) => {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    try {
      // Request screen sharing
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { mediaSource: "screen" },
        audio: true 
      });

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = handleStop;

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error("Error starting screen recording:", err);
      alert("Could not start recording. Please allow screen access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // Also stop the tracks to turn off the browser recording indicator
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStop = async () => {
    setRecording(false);
    const blob = new Blob(chunks.current, { type: 'video/webm' });
    chunks.current = [];
    
    // Create a local URL for preview
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);

    // Prepare for upload
    const formData = new FormData();
    formData.append('video', blob, `interview-${jobId}-${Date.now()}.webm`);
    formData.append('jobId', jobId);

    try {
      setUploading(true);
      // Send to your Express Backend
      const response = await axios.post('http://localhost:5000/api/interviews/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploading(false);
      if (onUploadSuccess) onUploadSuccess(response.data);
      alert("Interview uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
      alert("Failed to upload interview.");
    }
  };

  return (
    <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Technical Interview Session</h3>
      
      {videoUrl && (
        <div className="mb-4">
          <video src={videoUrl} controls className="w-full max-w-md mx-auto rounded-lg shadow-lg" />
        </div>
      )}

      <div className="flex justify-center gap-4">
        {!recording ? (
          <button 
            onClick={startRecording} 
            disabled={uploading}
            className={`px-6 py-2 rounded-full font-semibold text-white transition ${
              uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : videoUrl ? 'Record Again' : 'Start Screen Share'}
          </button>
        ) : (
          <button 
            onClick={stopRecording} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold animate-pulse"
          >
            Stop & Submit
          </button>
        )}
      </div>
      {recording && <p className="mt-2 text-sm text-red-500">Recording in progress...</p>}
    </div>
  );
};

export default ScreenRecorder;
