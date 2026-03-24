import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Play, Clock, CheckCircle, Target, Video, Mic, 
  Volume2, ArrowRight, FileText, Star, Loader, Brain, Bot
} from 'lucide-react';

const AIInterviewRoomDynamic = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobRole = 'Software Developer', skills = 'JavaScript, React, Node.js', topic = 'IT - MERN Stack' } = location.state || {};
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [step, setStep] = useState('instructions'); // instructions, interview, results
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);
  
  // Track current question index for dynamic button rendering
  const currentQuestionIndex = conversationHistory.length;
  const isLastQuestion = currentQuestionIndex >= 4;

  // Voice & Transcription State
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  // Microphone Selector State
  const [mics, setMics] = useState([]);
  const [selectedMic, setSelectedMic] = useState('');

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const isGenerating = loading;
  const [loadingText, setLoadingText] = useState('Processing...');

  // Proctoring & Anti-Cheat State
  const [warnings, setWarnings] = useState(0);
  const [showWarningOverlay, setShowWarningOverlay] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isFaceTrackerLoaded, setIsFaceTrackerLoaded] = useState(false);

  // Auto-hide warning overlay timer ref
  const warningTimerRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);

  const triggerWarning = (reason) => {
    if (step !== 'interview' || isInterviewComplete) return;
    
    setWarnings(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setWarningMessage(`Critical Violation: ${reason}. You have reached the maximum number of warnings. Your interview fidelity has been flagged.`);
      } else {
        setWarningMessage(`Warning ${newCount}/3: ${reason}. Please keep your focus on the interview screen.`);
      }
      return newCount;
    });
    
    setShowWarningOverlay(true);
    
    // Clear previous timer and set new one to auto-hide the banner
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => {
      setShowWarningOverlay(false);
    }, 5000); // Hide after 5 seconds
  };

  // Load Face-API for true webcam proctoring
  useEffect(() => {
    if (step === 'interview' && !isInterviewComplete) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js';
      script.async = true;
      script.onload = async () => {
        try {
          // Load models from standard CDN for the active fork
          const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';
          await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
          ]);
          setIsFaceTrackerLoaded(true);
          console.log("Face Proctoring AI Loaded");
        } catch (error) {
          console.error("Failed to load face-api models", error);
        }
      };
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) document.body.removeChild(script);
        if (faceDetectionIntervalRef.current) clearInterval(faceDetectionIntervalRef.current);
      };
    }
  }, [step, isInterviewComplete]);

  // Execute Face Tracking Logic
  useEffect(() => {
    if (isFaceTrackerLoaded && videoRef.current && step === 'interview' && !isInterviewComplete) {
      
      let noFaceFrames = 0;
      let multipleFacesFrames = 0;
      let lookingAwayFrames = 0;

      const runProctoringCheck = async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

        try {
          const detections = await window.faceapi
            .detectAllFaces(videoRef.current, new window.faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

          // 1. Missing Face Check
          if (detections.length === 0) {
            noFaceFrames++;
            if (noFaceFrames > 8) { // Approx 2.5 seconds missing
              triggerWarning("No face detected! Please remain visible in the camera frame.");
              noFaceFrames = 0; // reset to avoid spam
            }
          } else {
            noFaceFrames = 0;
          }

          // 2. Multiple People Check
          if (detections.length > 1) {
            multipleFacesFrames++;
            if (multipleFacesFrames > 4) { // Approx 1.2 seconds
              triggerWarning("Multiple faces detected in the frame. You must take the assessment alone.");
              multipleFacesFrames = 0;
            }
          } else {
            multipleFacesFrames = 0;
          }

          // 3. Look Away Check
          if (detections.length === 1) {
            const landmarks = detections[0].landmarks;
            const jaw = landmarks.getJawOutline();
            const nose = landmarks.getNose()[0];

            // Basic yaw detection based on nose position relative to jaw outline
            const leftJawX = jaw[0].x;
            const rightJawX = jaw[16].x;
            const faceWidth = rightJawX - leftJawX;
            const faceCenterX = leftJawX + (faceWidth / 2);
            
            const offsetRatio = Math.abs(nose.x - faceCenterX) / faceWidth;

            if (offsetRatio > 0.18) { // Threshold for looking significantly left or right
              lookingAwayFrames++;
              if (lookingAwayFrames > 6) { // Approx 1.8 seconds looking away
                triggerWarning("Gaze deviation detected. Please look directly at the screen.");
                lookingAwayFrames = 0;
              }
            } else {
              lookingAwayFrames = Math.max(0, lookingAwayFrames - 1);
            }
          }
        } catch (err) {
          // Ignore transient errors on early load
        }
      };

      faceDetectionIntervalRef.current = setInterval(runProctoringCheck, 300); // Check ~3 times a second

      return () => {
        if (faceDetectionIntervalRef.current) clearInterval(faceDetectionIntervalRef.current);
      };
    }
  }, [isFaceTrackerLoaded, step, isInterviewComplete]);

  // Dynamic Loading Text for extended AI operations
  useEffect(() => {
    let interval;
    if (loading && step === 'interview' && isInterviewComplete) {
      const texts = [
        'Analyzing technical accuracy...',
        'Evaluating communication skills...',
        'Checking keyword density...',
        'Generating final scorecard...'
      ];
      let i = 0;
      setLoadingText(texts[0]);
      interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 2500);
    } else if (loading) {
      setLoadingText('Processing...');
    }
    return () => clearInterval(interval);
  }, [loading, step, isInterviewComplete]);

  // Tab switching & Page reload protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step === 'interview' && !isInterviewComplete) {
        e.preventDefault();
        e.returnValue = 'You are in an active interview. Changes you made may not be saved.';
        return e.returnValue;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && step === 'interview' && !isInterviewComplete) {
        triggerWarning('Tab switching or minimizing the window detected');
      }
    };

    const handleWindowBlur = () => {
      if (step === 'interview' && !isInterviewComplete) {
        triggerWarning('Clicked outside the interview window');
      }
    };

    const handleMouseLeave = (e) => {
      // If mouse leaves the top boundary of the viewport (usually aiming for tabs/URL bar)
      if (e.clientY <= 0 && step === 'interview' && !isInterviewComplete) {
        triggerWarning('Cursor moved out of the interview screen boundary');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [step, isInterviewComplete]);

  // Get available audio input devices
  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setMics(audioInputs);
      
      // Set first device as default if none selected
      if (audioInputs.length > 0 && !selectedMic) {
        setSelectedMic(audioInputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  };

  // Request permission and get device list on mount
  useEffect(() => {
    const requestPermissionAndGetDevices = async () => {
      try {
        // Dummy request to get permission and unlock device labels
        const dummyStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        dummyStream.getTracks().forEach(track => track.stop());
        
        // Now get the full device list with labels
        await getDevices();
      } catch (error) {
        console.error('Error requesting microphone permission:', error);
        // Still try to get devices even if permission denied
        await getDevices();
      }
    };

    requestPermissionAndGetDevices();
  }, []);

  // Initialize Webcam with selected microphone
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const constraints = {
          video: true,
          audio: selectedMic ? { deviceId: { exact: selectedMic } } : true
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing webcam/mic:', error);
        alert('Please allow camera and microphone access to continue.');
      }
    };

    if (step === 'interview' && selectedMic) {
      initWebcam();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [step, selectedMic]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Loop through all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Append final transcript to currentTranscript (the editable field)
        if (finalTranscript) {
          setCurrentTranscript(prev => (prev + ' ' + finalTranscript).trim());
        }
        
        // Show interim results in a separate display (optional)
        if (interimTranscript && !finalTranscript) {
          // You can add a separate state for interim if needed
          console.log('Interim:', interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Don't stop listening on minor errors
        if (event.error === 'no-speech') {
          console.log('No speech detected, continuing to listen...');
        } else if (event.error === 'network') {
          console.log('Network error, will retry...');
        } else if (event.error === 'aborted') {
          console.log('Recognition aborted');
          setIsListening(false);
        } else {
          // For other errors, stop listening
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        
        // CRITICAL: Only auto-restart if user is still in listening mode AND interview is active
        if (isListening && step === 'interview' && !isInterviewComplete && !loading) {
          console.log('Auto-restarting speech recognition...');
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
            setIsListening(false);
          }
        } else {
          console.log('Not restarting - isListening:', isListening, 'step:', step, 'complete:', isInterviewComplete, 'loading:', loading);
          setIsListening(false);
        }
      };
      
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };
    } else {
      console.warn('Speech Recognition API not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition on cleanup:', error);
        }
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [isListening, step, isInterviewComplete, loading]);

  // AI Voice - Ask Question
  const askQuestion = (questionText) => {
    if (!questionText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };



  // Fetch next question from backend
  const fetchNextQuestion = async (historyToSend = null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const currentHistory = historyToSend || conversationHistory;
      const response = await axios.post('/api/ai-interview/next-question', {
        jobRole,
        skills,
        topic,
        conversationHistory: currentHistory
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        if (response.data.isComplete) {
          // Interview is complete
          setIsInterviewComplete(true);
          await gradeInterview(currentHistory);
        } else {
          // Set next question
          setCurrentQuestion(response.data.nextQuestion);
          setTimeout(() => askQuestion(response.data.nextQuestion), 500);
        }
      }
    } catch (error) {
      console.error('Error fetching next question:', error);
      alert('Failed to fetch next question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Grade Interview
  const gradeInterview = async (historyToGrade = null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      const response = await axios.post('/api/interviews/grade', {
        fullTranscript: historyToGrade || conversationHistory,
        jobId: sessionId,
        jobRole,
        skills,
        topic
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.sessionId) {
        // Navigate to detailed results page
        navigate(`/interview-results/${response.data.sessionId}`);
      } else if (response.data.success) {
        // Fallback to inline results if no sessionId
        setGradingResult(response.data);
        setStep('results');
      } else {
        // Handle unsuccessful response
        alert('Grading failed: ' + (response.data.error || 'Unknown error'));
        setStep('results');
      }
    } catch (error) {
      console.error('Error grading interview:', error);
      
      // Show error to user
      const errorMessage = error.response?.data?.error || 'Failed to grade interview. Please try again.';
      alert('Grading Error: ' + errorMessage);
      
      // Still show results page but with error state
      setStep('results');
    } finally {
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    if (step === 'interview' && timeLeft > 0 && !isInterviewComplete) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step, timeLeft, isInterviewComplete]);

  // Start interview and auto-start speech recognition
  const handleBeginInterview = async () => {
    setStep('interview');
    setTimeLeft(120);
    await fetchNextQuestion(); // Fetch first question
    
    // Auto-start speech recognition
    setTimeout(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Error auto-starting recognition:', error);
        }
      }
    }, 1000);
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    console.log("Submit clicked!");
    
    // CRITICAL: Stop speech recognition BEFORE processing
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    let finalAnswer = currentTranscript.trim();
    
    if (!finalAnswer) {
      if (isAutoSubmit === true) {
        finalAnswer = "[Candidate ran out of time - No answer provided]";
      } else {
        alert('Please provide an answer before continuing.');
        return;
      }
    }

    const newHistory = [...conversationHistory, {
      question: currentQuestion,
      answer: finalAnswer
    }];
    setConversationHistory(newHistory);
    setCurrentTranscript('');
    setTimeLeft(120);

    // If it's the last question (4 questions answered, this is the 5th)
    if (isLastQuestion) {
      setIsInterviewComplete(true);
      await gradeInterview(newHistory);
    } else {
      await fetchNextQuestion(newHistory);
    }
  };

  // Auto-submit when time is up
  useEffect(() => {
    if (step === 'interview' && timeLeft === 0 && !isInterviewComplete && !loading) {
      handleSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Instructions Step
  if (step === 'instructions') {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold">AI-Powered Dynamic Interview</h2>
              <p className="text-gray-400 mt-2">
                Position: {jobRole} | Skills: {skills}
              </p>
              <p className="text-teal-400 text-sm mt-2">
                📋 Topic: {topic} | ✨ Questions adapt based on your answers
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { icon: Brain, title: 'Dynamic Questions', desc: 'AI generates contextual follow-ups based on your answers' },
                { icon: Mic, title: 'Voice & Text', desc: 'Speak or type your responses' },
                { icon: Clock, title: '2 Minutes per Question', desc: 'Manage your time wisely' },
                { icon: Target, title: 'Smart Evaluation', desc: 'Get comprehensive feedback at the end' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                  <div className="w-12 h-12 bg-teal-600/20 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBeginInterview}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
              Start Interview
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Interview Step
  if (step === 'interview') {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white p-4 md:p-6 relative">
        
        {/* Proctoring Warning Overlay */}
        {showWarningOverlay && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-red-900/95 border-2 border-red-500 rounded-2xl p-5 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-start gap-4">
              <div className="bg-red-500/20 p-2 rounded-full shrink-0 mt-1">
                <Target className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h4 className="text-red-100 font-bold text-lg mb-1 tracking-wide">PROCTORING ALERT</h4>
                <p className="text-red-200 text-sm leading-relaxed font-medium">{warningMessage}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Question {currentQuestionIndex + 1}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-teal-500/20 text-teal-400">
                  Dynamic AI Interview
                </span>
                {warnings > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                    ⚠️ {warnings}/3 Warnings
                  </span>
                )}
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              timeLeft <= 30 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-gray-800 text-gray-300'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-2 gap-6 h-[85vh] w-full max-w-7xl mx-auto">
            
            {/* LEFT COLUMN - AI SIDE */}
            <div className="flex flex-col h-full gap-4">
              
              {/* AI Avatar Box (Top) */}
              <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-700 relative flex items-center justify-center overflow-hidden">
                <motion.div
                  animate={{
                    scale: isAiSpeaking ? [1, 1.02, 1] : 1
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isAiSpeaking ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {/* Robot Avatar */}
                  <div className="relative w-full max-w-md aspect-square">
                    {/* Outer Glow Ring */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 blur-3xl opacity-40 ${
                      isAiSpeaking ? 'animate-pulse' : ''
                    }`} />
                    
                    {/* Main Robot Container */}
                    <div className={`relative w-full h-full rounded-2xl overflow-hidden border-4 transition-all duration-300 bg-gradient-to-br from-gray-900 to-gray-800 ${
                      isAiSpeaking ? 'border-purple-500 shadow-2xl shadow-purple-500/50' : 'border-gray-700'
                    }`}>
                      <img 
                        src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80"
                        alt="AI Robot"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay gradient when speaking */}
                      {isAiSpeaking && (
                        <motion.div
                          animate={{ opacity: [0.3, 0.5, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-gradient-to-t from-purple-600/40 to-transparent"
                        />
                      )}
                    </div>
                    
                    {/* Pulsing Rings when speaking */}
                    {isAiSpeaking && (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1.1], opacity: [0.5, 0, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-2xl border-2 border-purple-400"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.15, 1.15], opacity: [0.3, 0, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          className="absolute inset-0 rounded-2xl border-2 border-pink-400"
                        />
                      </>
                    )}
                  </div>
                  
                  {/* AI Status Text */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center bg-black/60 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      AI Robot Interviewer
                    </h3>
                    {isAiSpeaking && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-purple-400 mt-1 flex items-center justify-center gap-2"
                      >
                        <Volume2 className="w-4 h-4 animate-pulse" />
                        Speaking...
                      </motion.p>
                    )}
                    {loading && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-pink-400 mt-1 flex items-center justify-center gap-2"
                      >
                        <Loader className="w-4 h-4 animate-spin" />
                        Thinking...
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Question Box (Bottom - fixed, docked) */}
              <div className="h-48 bg-gray-800 rounded-2xl border border-gray-700 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-400" />
                    Current Question
                  </h3>
                  <button
                    onClick={() => askQuestion(currentQuestion)}
                    disabled={isAiSpeaking || !currentQuestion}
                    className={`p-2 rounded-lg transition-all ${
                      isAiSpeaking ? 'bg-teal-600 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    title="AI Read Question"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {loading && !currentQuestion ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-teal-400" />
                    <p className="text-gray-400 text-sm">AI is generating your next question...</p>
                  </div>
                ) : (
                  <motion.div key={currentQuestion} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-base text-gray-200 leading-relaxed">
                      {currentQuestion || 'Waiting for question...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Answered: <span className="text-teal-400 font-semibold">{conversationHistory.length}</span> / 5
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN - USER SIDE */}
            <div className="flex flex-col h-full gap-4">

              {/* User Camera Box (Top - grows to fill) */}
              <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-700 relative overflow-hidden flex flex-col p-4">
                <div className="flex items-center justify-between mb-3 w-full">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Video className="w-5 h-5 text-teal-400" />
                      Your Video
                    </h3>
                    {isFaceTrackerLoaded ? (
                      <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        AI Proctoring Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-yellow-400 font-medium">
                        <Loader className="w-3 h-3 animate-spin" />
                        Loading AI Proctor...
                      </span>
                    )}
                  </div>
                  {/* Mic Status Indicator */}
                  {isListening && (
                    <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                      <Mic className="w-3 h-3 animate-pulse" />
                      Auto-Listening
                    </span>
                  )}
                </div>
                
                {/* Microphone Selector */}
                {mics.length > 0 && (
                  <select
                    className="w-full mb-3 p-2 bg-gray-800 text-white rounded-xl border border-teal-500 font-medium text-sm"
                    value={selectedMic}
                    onChange={(e) => setSelectedMic(e.target.value)}
                  >
                    {mics.map(mic => (
                      <option key={mic.deviceId} value={mic.deviceId}>
                        {mic.label || 'Microphone'}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex-1 bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Transcript/Submit Box (Bottom - fixed h-48, docked) */}
              <div className="h-48 bg-gray-800 rounded-2xl border border-gray-700 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    Live Transcript
                  </h3>
                  {isListening && (
                    <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Listening
                    </span>
                  )}
                </div>

                <textarea
                  value={currentTranscript}
                  onChange={(e) => setCurrentTranscript(e.target.value)}
                  placeholder="Microphone is auto-listening. Start speaking..."
                  className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none text-sm leading-relaxed"
                  disabled={loading}
                />

                <motion.button
                  whileHover={{ scale: isGenerating || !currentTranscript.trim() ? 1 : 1.02 }}
                  whileTap={{ scale: isGenerating || !currentTranscript.trim() ? 1 : 0.98 }}
                  onClick={() => handleSubmit(false)}
                  disabled={isGenerating || !currentTranscript.trim()}
                  className="w-full mt-2 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      {loadingText}
                    </>
                  ) : (
                    <>
                      {isLastQuestion ? "Finish Interview & Get Score" : "Submit Answer & Next"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Step
  if (step === 'results') {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-600 to-blue-600 rounded-full mb-6">
              <Star className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Interview Complete!</h1>
            <p className="text-gray-400 text-lg">Your AI-powered interview evaluation</p>
          </motion.div>

          {/* Score Card */}
          {gradingResult && (
            <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-8 mb-8 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="#1F2937" strokeWidth="12" fill="none" />
                    <circle 
                      cx="80" cy="80" r="70" 
                      stroke="url(#gradient)" 
                      strokeWidth="12" 
                      fill="none"
                      strokeDasharray={`${(gradingResult.overallScore / 100) * 440} 440`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold">{gradingResult.overallScore}%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-300 mb-4">{gradingResult.overallFeedback}</p>
              <p className="text-center text-gray-400">
                You answered {conversationHistory.length} questions
              </p>
            </div>
          )}

          {/* Transcript Summary */}
          <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Your Answers</h2>
            <div className="space-y-4">
              {conversationHistory.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-800/50 rounded-xl">
                  <h3 className="font-medium mb-2">Q{idx + 1}: {item.question}</h3>
                  <p className="text-gray-400 text-sm">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold"
            >
              Practice Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-4 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AIInterviewRoomDynamic;
