import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video, VideoOff, Monitor, Mic, MicOff, Square, Circle, AlertCircle, CheckCircle } from 'lucide-react';

const ScreenRecorder = ({ 
  onRecordingComplete, 
  jobId, 
  showScreenShare = true,
  maxDuration = 300 // 5 minutes default
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [combinedStream, setCombinedStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('idle'); // idle, starting, recording, stopping, completed

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused, maxDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    if (combinedStream) {
      combinedStream.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    clearInterval(timerRef.current);
  }, [stream, screenStream, combinedStream, mediaRecorder]);

  const startRecording = async () => {
    try {
      setError(null);
      setRecordingStatus('starting');

      // Get camera stream
      const cameraStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });

      let finalStream = cameraStream;

      // If screen sharing is enabled, get screen share
      if (showScreenShare) {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: 'always'
            },
            audio: false
          });
          
          // Combine camera and screen streams
          const tracks = [
            ...screenStream.getVideoTracks(),
            ...cameraStream.getAudioTracks()
          ];
          
          finalStream = new MediaStream(tracks);
          setScreenStream(screenStream);

          // Handle screen share stop
          screenStream.getVideoTracks()[0].onended = () => {
            if (isRecording) {
              stopRecording();
            }
          };
        } catch (screenError) {
          console.log('Screen share declined, using camera only');
        }
      }

      setStream(cameraStream);
      setCombinedStream(finalStream);

      // Set video element source
      if (videoRef.current) {
        videoRef.current.srcObject = finalStream;
      }

      // Create MediaRecorder
      const recorder = new MediaRecorder(finalStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        if (onRecordingComplete) {
          onRecordingComplete({
            blob,
            url,
            duration: recordingTime,
            jobId
          });
        }
        
        setRecordingStatus('completed');
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingStatus('recording');

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err.message || 'Failed to start recording. Please check permissions.');
      setRecordingStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      setRecordingStatus('stopping');
      mediaRecorder.stop();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setIsPaused(false);
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {/* Video Preview Area */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video mb-4">
        {recordingStatus === 'idle' || error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
            <Video className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-center px-4">
              {error ? error : 'Click "Start Recording" to begin your interview practice'}
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="bg-black/50 px-3 py-1 rounded-full text-white text-sm">
              {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </span>
          </div>
        )}

        {/* Recording Controls Overlay */}
        {isRecording && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
            <button
              onClick={toggleCamera}
              className={`p-2 rounded-full transition ${cameraEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}
              title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {cameraEnabled ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={toggleMic}
              className={`p-2 rounded-full transition ${micEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}
              title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {micEnabled ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
            </button>
            <div className="w-px h-6 bg-gray-600" />
            <button
              onClick={stopRecording}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition"
              title="Stop recording"
            >
              <Square className="w-5 h-5 text-white" fill="white" />
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        {recordingStatus === 'idle' || recordingStatus === 'completed' ? (
          <button
            onClick={startRecording}
            disabled={recordingStatus === 'starting'}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {recordingStatus === 'starting' ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting...
              </>
            ) : recordingStatus === 'completed' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Recording Complete
              </>
            ) : (
              <>
                <Circle className="w-5 h-5" fill="currentColor" />
                Start Recording
              </>
            )}
          </button>
        ) : isRecording ? (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition"
          >
            <Square className="w-5 h-5" fill="currentColor" />
            Stop Recording
          </button>
        ) : null}
      </div>

      {/* Status Message */}
      {recordingStatus === 'starting' && (
        <p className="text-center text-gray-400 mt-3 text-sm">
          Setting up your interview environment...
        </p>
      )}

      {isRecording && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium">Recording in progress</p>
              <p className="text-blue-400/70 mt-1">
                Make sure your audio is clear and you're in a well-lit environment. 
                The recording will automatically stop after {formatTime(maxDuration)}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenRecorder;
