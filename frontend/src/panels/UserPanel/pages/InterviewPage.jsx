import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, ArrowRight, RefreshCw, Loader2, Timer, Video, Square, Mic, MicOff, Volume2, Camera, Settings, X, Maximize, Minimize, MessageSquare, PhoneOff, Monitor, User, Users, EyeOff, Activity, Wifi, WifiOff, Flag, Layers, BrainCircuit, Mic2, Zap, Eye, FileText, Trophy } from 'lucide-react';
import questionsData from './questions.json';
import { useAuth } from '../../../context/AuthContext';

const InterviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // --- State Management ---
  const [questions, setQuestions] = useState(questionsData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(questionsData[0]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [results, setResults] = useState([]);
  
  // Workflow State
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [countdown, setCountdown] = useState(null); // 3, 2, 1, null
  const [selectedSubject, setSelectedSubject] = useState('React');
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [isResumeAnalyzing, setIsResumeAnalyzing] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [finalScoreData, setFinalScoreData] = useState(null);
  
  // Anti-Cheat & Monitoring
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isCheating, setIsCheating] = useState(false);
  const [confidence, setConfidence] = useState(100); // 0-100
  const [motionWarning, setMotionWarning] = useState(null); // 'high', 'static'
  const [audioWarning, setAudioWarning] = useState(null); // 'whisper'
  const [networkQuality, setNetworkQuality] = useState('high');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [attentionScore, setAttentionScore] = useState(100);
  
  // Media & AI
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState({ speaker: '', text: '' });
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [voices, setVoices] = useState([]);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const heatmapCanvasRef = useRef(null);
  const attentionBufferRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const compositeStreamRef = useRef(null);
  const fullSessionRecorderRef = useRef(null);
  const fullSessionChunksRef = useRef([]);
  const whisperTimerRef = useRef(0);
  const isAiSpeakingRef = useRef(false);

  // --- Helper Functions ---
  const stopHardwareStreams = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // --- Effects ---

  // 1. Tab Switch Blurring (Anti-Cheat)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isInterviewStarted) {
        setTabSwitchCount(prev => prev + 1);
        setIsCheating(true);
      } else {
        setIsCheating(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isInterviewStarted]);

  // 2. Countdown Logic
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      startInterviewSession();
    }
  }, [countdown]);

  // 3. Timer & Confidence Simulation
  useEffect(() => {
    if (!isInterviewStarted || feedback || timeLeft === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
      // Simulate confidence fluctuation based on speaking
      if (isRecording) {
        setConfidence(prev => Math.min(100, Math.max(60, prev + (Math.random() > 0.5 ? 2 : -2))));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [feedback, timeLeft, isInterviewStarted, isRecording]);

  // 4. Load Voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      // Default to a Google voice if available
      const defaultIndex = availableVoices.findIndex(v => v.name.includes('Google US English'));
      if (defaultIndex !== -1) setSelectedVoiceIndex(defaultIndex);
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // 5. Network Status
  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection && connection.downlink) {
        setNetworkQuality(connection.downlink >= 5 ? 'high' : connection.downlink >= 2 ? 'medium' : 'low');
      }
    };
    if (navigator.connection) navigator.connection.addEventListener('change', updateNetworkStatus);
    updateNetworkStatus();
    return () => { if (navigator.connection) navigator.connection.removeEventListener('change', updateNetworkStatus); };
  }, []);

  // 7. Bind Camera Stream to Video (Fix for Invisible Video)
  useEffect(() => {
    if (isInterviewStarted && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [isInterviewStarted]);

  // 8. Sync AI Speaking Ref (for VAD)
  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  // 6. Proctoring Loop (Motion Detection)
  useEffect(() => {
    if (!isInterviewStarted || !videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = 64; // Low resolution for performance
    canvas.height = 48;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let prevData = null;

    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        if (prevData) {
          let diff = 0;
          for (let i = 0; i < data.length; i += 4) {
            if (Math.abs(data[i] - prevData[i]) + Math.abs(data[i+1] - prevData[i+1]) + Math.abs(data[i+2] - prevData[i+2]) > 50) {
              diff++;
            }
          }
          
          const totalPixels = canvas.width * canvas.height;
          if (diff > totalPixels * 0.2) setMotionWarning('high');
          else if (diff < totalPixels * 0.01) setMotionWarning('static');
          else setMotionWarning(null);
        } else {
          setMotionWarning(null);
        }
        prevData = data;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isInterviewStarted]);

  // 9. Gaze Tracking & Heatmap Logic
  useEffect(() => {
    // Load WebGazer dynamically
    if (!document.getElementById('webgazer-script')) {
      const script = document.createElement('script');
      script.id = 'webgazer-script';
      script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
      script.async = true;
      document.body.appendChild(script);
    }
    return () => {
      stopHardwareStreams();
      try {
        if (window.webgazer) {
          window.webgazer.end();
        }
      } catch (e) {
        // Silently ignore cleanup errors if WebGazer failed to init
      }
    };
  }, []);

  // Heatmap Fade Effect (to clear old trails)
  useEffect(() => {
    if (!showHeatmap) return;
    const fadeInterval = setInterval(() => {
      if (heatmapCanvasRef.current) {
        const ctx = heatmapCanvasRef.current.getContext('2d');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fade speed
        ctx.fillRect(0, 0, heatmapCanvasRef.current.width, heatmapCanvasRef.current.height);
        ctx.globalCompositeOperation = 'source-over';
      }
    }, 100);
    return () => clearInterval(fadeInterval);
  }, [showHeatmap]);

  const toggleHeatmap = async () => {
    const newState = !showHeatmap;
    
    if (newState) {
      if (!window.webgazer) {
        alert("Gaze tracking is still initializing. Please try again in a few seconds.");
        return;
      }

      try {
        await window.webgazer.setGazeListener((data, clock) => {
           // 1. Calculate Attention Score (Rolling Average)
           const isLookingAtScreen = data && data.x > 0 && data.x < window.innerWidth && data.y > 0 && data.y < window.innerHeight;
           attentionBufferRef.current.push(isLookingAtScreen ? 1 : 0);
           if (attentionBufferRef.current.length > 50) attentionBufferRef.current.shift();
           
           if (attentionBufferRef.current.length % 10 === 0) {
             const score = Math.round((attentionBufferRef.current.reduce((a, b) => a + b, 0) / attentionBufferRef.current.length) * 100);
             setAttentionScore(score);
           }

           // 2. Draw Heatmap
           if (data && heatmapCanvasRef.current) {
             const ctx = heatmapCanvasRef.current.getContext('2d');
             const gradient = ctx.createRadialGradient(data.x, data.y, 0, data.x, data.y, 40);
             gradient.addColorStop(0, 'rgba(255, 87, 34, 0.4)');
             gradient.addColorStop(1, 'rgba(255, 87, 34, 0)');
             ctx.fillStyle = gradient;
             ctx.beginPath();
             ctx.arc(data.x, data.y, 40, 0, Math.PI * 2);
             ctx.fill();
           }
        }).begin();
        window.webgazer.showVideo(false);
        window.webgazer.showFaceOverlay(false);
        window.webgazer.showFaceFeedbackBox(false);
        setShowHeatmap(true);
      } catch (e) {
        console.error("WebGazer failed to start", e);
        alert("Failed to load Gaze Tracking assets. Please check your network or public folder configuration.");
        setShowHeatmap(false);
        try {
          window.webgazer.end(); 
        } catch (cleanupError) {
          // Ignore
        }
      }
    } else if (!newState && window.webgazer) {
       window.webgazer.pause();
       setShowHeatmap(false);
    }
  };

  // --- Core Functions ---

  const handleStartSequence = () => {
    setCountdown(3);
  };

  const startInterviewSession = async () => {
    try {
      // 1. Get Streams (Camera + Screen)
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: false });
      
      cameraStreamRef.current = cameraStream;
      screenStreamRef.current = screenStream;

      // 3. Setup Composition for Recording (Hidden Canvas)
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      const screenVideo = document.createElement('video');
      screenVideo.srcObject = screenStream;
      screenVideo.muted = true;
      screenVideo.play();
      const cameraVideo = document.createElement('video');
      cameraVideo.srcObject = cameraStream;
      cameraVideo.muted = true;
      cameraVideo.play();

      const drawComposite = () => {
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
        // PiP Bottom Right
        ctx.drawImage(cameraVideo, canvas.width - 340, canvas.height - 200, 320, 180);
        animationFrameRef.current = requestAnimationFrame(drawComposite);
      };
      drawComposite();

      const combinedStream = canvas.captureStream(30);
      cameraStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
      compositeStreamRef.current = combinedStream;

      // 4. Start Full Session Recording
      fullSessionRecorderRef.current = new MediaRecorder(combinedStream);
      fullSessionChunksRef.current = [];
      fullSessionRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) fullSessionChunksRef.current.push(e.data);
      };
      fullSessionRecorderRef.current.onstop = () => {
        const blob = new Blob(fullSessionChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview_session_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      fullSessionRecorderRef.current.start();

      // 5. Start Audio Visualizer
      setupAudioVisualizer(cameraStream);

      // 6. Start Speech Recognition
      startSpeechRecognition();

      setIsInterviewStarted(true);
      
      // Speak first question
      setTimeout(() => speak(activeQuestion.question), 1000);

    } catch (err) {
      console.error("Error starting interview:", err);
      alert("Permissions denied. Please allow Camera, Microphone, and Screen Sharing.");
      setCountdown(null);
    }
  };

  const setupAudioVisualizer = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    const analyser = audioContext.createAnalyser();
    analyserRef.current = analyser;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 64; // Low FFT for bar graph
    setIsRecording(true); // Flag to trigger draw loop
  };

  // Draw Bar Graph Visualizer
  useEffect(() => {
    if (isRecording && canvasRef.current && analyserRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!isRecording) return;
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        // VAD (Voice Activity Detection) Logic
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / bufferLength;

        // Detect suspicious low-level audio (Whispering)
        // Range 8-35 is typically background noise or whispering. >40 is clear speech.
        if (average > 8 && average < 35 && !isAiSpeakingRef.current) {
          whisperTimerRef.current += 1;
        } else {
          whisperTimerRef.current = Math.max(0, whisperTimerRef.current - 2);
        }

        // Trigger warning if sustained for ~1.5 seconds
        setAudioWarning(whisperTimerRef.current > 100 ? 'whisper' : null);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          
          // Gradient Color
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#10b981'); // Green
          gradient.addColorStop(1, '#3b82f6'); // Blue

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      };
      draw();
    }
  }, [isRecording]);

  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setUserAnswer(prev => prev + ' ' + finalTranscript);
          setCurrentSubtitle({ speaker: 'You', text: finalTranscript });
        }
      };
      recognition.start();
      mediaRecorderRef.current = { recognition }; // Hack to store ref
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      setCurrentSubtitle({ speaker: 'AI', text: text });
      
      if (voices[selectedVoiceIndex]) {
        utterance.voice = voices[selectedVoiceIndex];
      }
      utterance.rate = 1.0;
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFeedback({ status: 'Correct', feedback: 'Good explanation of the concept.', score: 8 });
      setLoading(false);
    }, 1500);
  };

  const handleNext = () => {
    const currentResult = feedback || { score: 0 };
    const updatedResults = [...results, currentResult];
    setResults(updatedResults);

    if (currentQuestionIndex < questions.length - 1) {
      const nextQ = questions[currentQuestionIndex + 1];
      setActiveQuestion(nextQ);
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setFeedback(null);
      speak(nextQ.question);
    } else {
      finishInterview(updatedResults);
    }
  };

  const finishInterview = async (finalResults) => {
    // 1. STOP HARDWARE (Priority #1) & UI Update
    setIsRecording(false);
    stopHardwareStreams();

    // 2. STOP RECORDING
    if (fullSessionRecorderRef.current && fullSessionRecorderRef.current.state !== 'inactive') {
      try {
        fullSessionRecorderRef.current.stop();
      } catch (e) {
        console.warn("Failed to stop MediaRecorder:", e);
      }
    }

    // 3. Calculate Score & Save to DB
    let interviewResults = Array.isArray(finalResults) ? finalResults : [...results];
    // If manually ended and there's pending feedback, include it
    if (!Array.isArray(finalResults) && feedback) {
      interviewResults.push(feedback);
    }

    const avgScore = interviewResults.length > 0 
      ? interviewResults.reduce((a, b) => a + (b.score || 0), 0) / interviewResults.length 
      : 0;
    const finalScore = Math.round(avgScore * 10); // Convert 0-10 scale to 0-100

    let status = 'Average';
    if (finalScore >= 90) status = 'Outstanding';
    else if (finalScore >= 75) status = 'Excellent';
    else if (finalScore >= 60) status = 'Good';

    try {
      await fetch('http://localhost:5000/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          score: finalScore,
          status
        }),
        credentials: 'include'
      });
    } catch (e) {
      console.error("Failed to save interview:", e);
    }

    // 4. CLEAN UP AI (Safely)
    try {
      if (window.webgazer) {
        try {
          window.webgazer.pause();
          window.webgazer.clearData();
          window.webgazer.end();
        } catch (e) {
          // Silently ignore cleanup errors
          // Force remove if end() failed
          const videoContainer = document.getElementById('webgazerVideoContainer');
          if (videoContainer) videoContainer.remove();
        }
      }
    } catch (err) {
      // Ignore cleanup errors
    }

    setFinalScoreData({ score: finalScore, status, breakdown: interviewResults });
    setShowFeedbackModal(true);
  };

  const handleAnalyzeResume = async () => {
    setIsResumeAnalyzing(true);
    try {
      const res = await fetch('http://localhost:5000/api/generate-questions', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (res.ok) {
        const newQuestions = await res.json();
        if (newQuestions.length > 0) {
          setQuestions(newQuestions);
          setActiveQuestion(newQuestions[0]);
          setCurrentQuestionIndex(0);
          alert("Questions customized based on your resume!");
        }
      } else {
        const err = await res.json();
        alert(err.error || "Failed to analyze resume");
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to server");
    } finally {
      setIsResumeAnalyzing(false);
    }
  };

  // --- Render ---

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-900 text-white font-sans selection:bg-indigo-500/30">
      
      {/* Cheating Warning Overlay */}
      <AnimatePresence>
        {isCheating && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-red-900/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8"
          >
            <AlertCircle size={64} className="text-white mb-4 animate-bounce" />
            <h1 className="text-4xl font-bold mb-2">WARNING: TAB SWITCH DETECTED</h1>
            <p className="text-xl text-red-200">This incident has been logged. Return to the interview immediately.</p>
            <div className="mt-8 text-sm opacity-70">Violation Count: {tabSwitchCount}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Warning Overlay */}
      <AnimatePresence>
        {audioWarning === 'whisper' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-[55] bg-amber-500 text-black px-6 py-2 rounded-full shadow-xl flex items-center gap-2 font-bold animate-pulse"
          >
            <MicOff size={20} />
            <span>Suspicious Whispering Detected</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div 
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400"
            >
              {countdown === 0 ? 'GO!' : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
               {/* Background Glow */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/20 blur-[60px] pointer-events-none" />

              <div className="relative z-10 text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/30">
                  <Trophy size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Interview Complete!</h2>
                <p className="text-gray-400">Great job! Here's how you performed.</p>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Score</div>
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {finalScoreData?.score}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Performance</div>
                  <div className={`text-xl font-bold ${
                    finalScoreData?.status === 'Outstanding' ? 'text-purple-400' :
                    finalScoreData?.status === 'Excellent' ? 'text-emerald-400' :
                    finalScoreData?.status === 'Good' ? 'text-blue-400' : 'text-yellow-400'
                  }`}>
                    {finalScoreData?.status}
                  </div>
                </div>
              </div>

              <div className="relative z-10 bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-8 max-h-60 overflow-y-auto custom-scrollbar">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Detailed Breakdown</h3>
                <div className="space-y-3">
                  {finalScoreData?.breakdown?.map((result, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-700 pb-2 last:border-0 last:pb-0">
                      <div className="flex-1 pr-4 min-w-0">
                        <p className="text-sm text-white font-medium truncate" title={questions[index]?.question}>
                          {questions[index]?.question || `Question ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-400 truncate" title={result.feedback}>
                          {result.feedback || "No feedback provided"}
                        </p>
                      </div>
                      <div className={`text-sm font-bold shrink-0 ${
                        (result.score || 0) >= 8 ? 'text-emerald-400' : 
                        (result.score || 0) >= 5 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {result.score || 0}/10
                      </div>
                    </div>
                  ))}
                  {(!finalScoreData?.breakdown || finalScoreData.breakdown.length === 0) && (
                    <p className="text-xs text-gray-500 text-center">No questions answered.</p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => navigate('/student/dashboard')}
                className="relative z-10 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                Return to Dashboard <ArrowRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gaze Heatmap Layer */}
      <canvas 
        ref={heatmapCanvasRef}
        className={`absolute inset-0 z-[40] pointer-events-none transition-opacity duration-500 ${showHeatmap ? 'opacity-100' : 'opacity-0'}`}
        width={window.innerWidth}
        height={window.innerHeight}
      />

      {/* LEFT PANEL: AI Stage (75%) */}
      <div className="w-[75%] relative bg-gradient-to-br from-gray-900 via-gray-900 to-black flex flex-col items-center justify-center p-8">
        
        {/* Topic Badge (Floating Pill) */}
        <div className="absolute top-6 left-6 z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg"
          >
            <Layers size={14} className="text-indigo-400" />
            <span className="text-xs font-bold tracking-wider text-indigo-100 uppercase">Topic: {selectedSubject}</span>
          </motion.div>
        </div>

        {/* Center Group: Avatar & Subtitles */}
        <div className="flex flex-col items-center justify-center gap-12 w-full max-w-4xl">
          {/* AI Avatar (Medium Sized) */}
          <div className="relative z-10">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isAiSpeaking ? 'shadow-[0_0_60px_rgba(99,102,241,0.5)] scale-105' : 'shadow-[0_0_20px_rgba(99,102,241,0.1)]'}`}>
              <div className="w-28 h-28 bg-gray-800 rounded-full flex items-center justify-center relative overflow-hidden border border-gray-700">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20" />
                <User size={64} className="text-indigo-300 relative z-10" />
                
                {/* Breathing Animation */}
                {isAiSpeaking && (
                  <>
                    <div className="absolute inset-0 border-2 border-indigo-500/40 rounded-full animate-ping" />
                    <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full animate-ping delay-150" />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* HUD Subtitles */}
          <div className="w-full flex flex-col items-center min-h-[100px]">
          <AnimatePresence mode="wait">
            {currentSubtitle.text && (
              <motion.div
                key={currentSubtitle.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-black/60 backdrop-blur-md border border-white/5 px-8 py-6 rounded-2xl text-center shadow-2xl max-w-2xl"
              >
                <span className={`text-xs font-bold uppercase tracking-widest mb-2 block ${currentSubtitle.speaker === 'AI' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                  {currentSubtitle.speaker}
                </span>
                <p className="text-xl font-medium text-white/95 leading-relaxed text-shadow-sm">
                  "{currentSubtitle.text}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Status Side-Bar (25%) */}
      <div className="w-[25%] min-w-[300px] border-l border-gray-800 bg-gray-900 flex flex-col h-full">
        
        {/* Top: Webcam (Fixed Height) */}
        <div className="h-64 bg-black relative p-4 flex items-center justify-center border-b border-gray-800 shrink-0">
          <div className={`relative w-full aspect-video rounded-lg overflow-hidden border-2 shadow-2xl transition-colors duration-300 ${
            isRecording ? 'border-emerald-500/50 shadow-emerald-500/20' : 
            motionWarning ? 'border-red-500/50 shadow-red-500/20' : 
            'border-gray-700'
          }`}>
            {!isInterviewStarted ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-800">
                <Camera size={32} className="mb-2 opacity-50" />
                <p className="text-xs uppercase tracking-wider">Camera Preview</p>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
            )}
            
            {/* REC Indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-md border ${isRecording ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-gray-800/80 border-gray-600 text-gray-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                {isRecording ? 'REC' : 'OFF'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Control Center (Flexible) */}
        <div className="flex-1 p-5 flex flex-col bg-gray-900 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Settings size={12} /> Control Center
            </h3>
            {isInterviewStarted && (
               <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1.5" title="Speech Confidence">
                   <Activity size={12} className={confidence > 80 ? "text-emerald-400" : "text-yellow-400"} />
                   <span className="text-[10px] font-mono text-gray-500">{confidence}%</span>
                 </div>
                 {showHeatmap && (
                   <div className="flex items-center gap-1.5" title="Visual Attention">
                     <Eye size={12} className={attentionScore > 70 ? "text-emerald-400" : "text-red-400"} />
                     <span className="text-[10px] font-mono text-gray-500">{attentionScore}%</span>
                   </div>
                 )}
               </div>
            )}
          </div>

          <div className="space-y-5 flex-1">
            {/* Subject Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Subject</label>
              <div className="relative">
                <select 
                  disabled={isInterviewStarted}
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full h-8 bg-gray-800 border border-gray-700 text-white text-xs rounded-md px-3 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none transition-all"
                >
                  <option>React</option>
                  <option>Node.js</option>
                  <option>Java</option>
                  <option>System Design</option>
                </select>
                <Layers size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Voice Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">AI Voice</label>
              <div className="relative">
                <select 
                  value={selectedVoiceIndex}
                  onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                  className="w-full h-8 bg-gray-800 border border-gray-700 text-white text-xs rounded-md px-3 pr-8 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all"
                >
                  {voices.map((v, i) => <option key={i} value={i}>{v.name.slice(0, 25)}</option>)}
                </select>
                <Mic2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Audio Visualizer */}
            <div className="space-y-1 pt-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1 flex justify-between">
                <span>Mic Input</span>
                {isRecording && <span className="text-emerald-400 animate-pulse">Live</span>}
              </label>
              <div className="h-10 bg-black rounded-md border border-gray-800 overflow-hidden relative">
                 <canvas 
                  ref={canvasRef} 
                  width={300} 
                  height={40} 
                  className="w-full h-full opacity-80"
                />
              </div>
            </div>

            {/* Resume Analysis Button */}
            <button 
              onClick={handleAnalyzeResume}
              disabled={isInterviewStarted || isResumeAnalyzing}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-xs font-bold uppercase tracking-wider transition-all ${isResumeAnalyzing ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600 disabled:opacity-50'}`}
            >
              <span className="flex items-center gap-2"><FileText size={14} /> Resume Analysis</span>
              <span className={isResumeAnalyzing ? "text-indigo-400" : "text-gray-600"}>{isResumeAnalyzing ? "..." : "AUTO"}</span>
            </button>

            {/* Gaze Tracking Toggle */}
            <button 
              onClick={toggleHeatmap}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-xs font-bold uppercase tracking-wider transition-all ${showHeatmap ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}`}
            >
              <span className="flex items-center gap-2"><Eye size={14} /> Gaze Heatmap</span>
              <span className={showHeatmap ? "text-indigo-400" : "text-gray-600"}>{showHeatmap ? "ON" : "OFF"}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-4">
            {!isInterviewStarted ? (
              <button 
                onClick={handleStartSequence}
                className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Zap size={14} /> Start Interview
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {!feedback ? (
                  <button 
                    onClick={handleVerify}
                    disabled={loading}
                    className="h-9 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold uppercase tracking-wider rounded-md border border-gray-700 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                    Submit
                  </button>
                ) : (
                  <button 
                    onClick={handleNext}
                    className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                )}
                <button 
                  onClick={finishInterview}
                  className="h-9 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold uppercase tracking-wider rounded-md border border-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <PhoneOff size={14} /> End
                </button>
              </div>
            )}
          </div>
      </div>
    </div>
    </div>
  );
};

export default InterviewPage;
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                    Submit
                  </button>
                ) : (
                  <button 
                    onClick={handleNext}
                    className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                )}
                <button 
                  onClick={finishInterview}
                  className="h-9 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold uppercase tracking-wider rounded-md border border-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <PhoneOff size={14} /> End
                </button>
              </div>
            )}
          </div>
      </div>
    </div>
    </div>
  );
};

export default InterviewPage;
