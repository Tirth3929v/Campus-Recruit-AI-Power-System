import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Monitor, Video, VideoOff, AlertTriangle, Play, Bot, CheckCircle } from 'lucide-react';

const SAMPLE_QUESTIONS = [
  "Tell me about yourself and your background in software development.",
  "Describe a challenging technical problem you solved recently.",
  "How do you handle tight deadlines and pressure?",
  "Explain the concept of RESTful APIs and when you'd use them.",
  "Where do you see yourself in 5 years?",
];

const AIAvatar = ({ isSpeaking }) => (
  <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
    <motion.div
      animate={isSpeaking ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ repeat: isSpeaking ? Infinity : 0, duration: 0.8 }}
      className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-600/30 to-blue-600/30"
    />
    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-teal-600 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-900/50">
      <Bot className="w-12 h-12 text-white" />
    </div>
    {isSpeaking && (
      <div className="absolute -bottom-2 flex gap-1 items-end">
        {[1, 2, 3, 4, 3].map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: [`${h * 4}px`, `${h * 10}px`, `${h * 4}px`] }}
            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
            className="w-1.5 bg-teal-400 rounded-full"
            style={{ height: `${h * 4}px` }}
          />
        ))}
      </div>
    )}
  </div>
);

const AIInterviewRoom = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const recognitionRef = useRef(null);

  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userTranscript, setUserTranscript] = useState('');
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');

  // --- Camera Setup ---
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamActive(true);
      } catch {
        setCamActive(false);
      }
    };
    initCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  // --- Tab Switch Detection ---
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && interviewStarted) {
        setCheatWarnings(prev => {
          const next = prev + 1;
          setWarningMsg(`⚠️ Tab switch detected! Warning ${next}/3`);
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 4000);
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [interviewStarted]);

  // --- Speech Synthesis ---
  const speakQuestion = useCallback((text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      startListening();
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  // --- Speech Recognition ---
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current?.stop();
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      setUserTranscript(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // --- Screen Share ---
  const requestScreenShare = async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screen;
      screen.getVideoTracks()[0].onended = () => setScreenShared(false);
      setScreenShared(true);
    } catch {
      setScreenShared(false);
    }
  };

  // --- Start Interview ---
  const handleStart = () => {
    if (!screenShared) return;
    setInterviewStarted(true);
    setUserTranscript('');
    speakQuestion(SAMPLE_QUESTIONS[0]);
  };

  // --- Next Question ---
  const handleNext = () => {
    stopListening();
    const next = currentQuestionIdx + 1;
    if (next < SAMPLE_QUESTIONS.length) {
      setCurrentQuestionIdx(next);
      setUserTranscript('');
      speakQuestion(SAMPLE_QUESTIONS[next]);
    } else {
      setIsInterviewComplete(true);
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    }
  };

  const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIdx];

  if (isInterviewComplete) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-2xl bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-10 backdrop-blur-sm shadow-2xl"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-600 to-blue-600 rounded-full mb-6 shadow-lg shadow-teal-500/30">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">Interview Complete!</h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Thank you for completing the AI Interview. Your responses have been recorded successfully.
          </p>
          <div className="flex gap-4 justify-center">
             <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl font-semibold hover:from-teal-700 hover:to-blue-700 transition"
              >
                Return to Dashboard
              </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#0d1220]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="font-semibold text-sm tracking-wide">AI Interview Room</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {cheatWarnings > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              {cheatWarnings} warning{cheatWarnings > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-gray-400">
            Q {currentQuestionIdx + 1} / {SAMPLE_QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Warning Toast */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 px-5 py-3 rounded-xl text-sm font-medium backdrop-blur-sm"
          >
            {warningMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Split Layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT PANE — AI */}
        <div className="flex-1 flex flex-col items-center justify-between p-8 border-r border-gray-800 bg-[#0e1322]">
          <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-md">
            <AIAvatar isSpeaking={isSpeaking} />

            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-teal-400 mb-2 font-medium">AI Interviewer</p>
              <h2 className="text-lg font-semibold text-gray-200">
                {isSpeaking ? 'Speaking...' : interviewStarted ? 'Listening to you' : 'Ready to begin'}
              </h2>
            </div>
          </div>

          {/* Question Box */}
          <div className="w-full max-w-md">
            <div className="bg-[#151C2C] border border-gray-700 rounded-2xl p-5">
              <p className="text-xs text-teal-400 font-medium mb-2 uppercase tracking-wider">Current Question</p>
              <p className="text-gray-100 leading-relaxed text-sm">
                {interviewStarted ? currentQuestion : 'Start the interview to receive your first question.'}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANE — User */}
        <div className="flex-1 flex flex-col items-center justify-between p-8 bg-[#0B0F19]">
          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-md">

            {/* Webcam Feed */}
            <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {!camActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <VideoOff className="w-10 h-10" />
                  <span className="text-sm">Camera unavailable</span>
                </div>
              )}
              {/* Status badges */}
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${camActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  <Video className="w-3 h-3" />
                  {camActive ? 'Live' : 'Off'}
                </span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${isListening ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/60 text-gray-400'}`}>
                  {isListening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  {isListening ? 'Listening' : 'Mic off'}
                </span>
              </div>
            </div>

            {/* Controls */}
            {!interviewStarted && (
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={requestScreenShare}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                    screenShared
                      ? 'bg-green-600/20 border border-green-500/50 text-green-400'
                      : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-teal-500 hover:text-teal-400'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  {screenShared ? '✓ Screen Sharing Active' : 'Share Screen to Enable Start'}
                </button>

                <motion.button
                  whileHover={screenShared ? { scale: 1.02 } : {}}
                  whileTap={screenShared ? { scale: 0.98 } : {}}
                  onClick={handleStart}
                  disabled={!screenShared || !camActive}
                  className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Play className="w-4 h-4" />
                  Start Interview
                </motion.button>
              </div>
            )}

            {interviewStarted && (
              <button
                onClick={handleNext}
                disabled={false}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl font-semibold text-sm hover:from-teal-700 hover:to-blue-700 transition-all"
              >
                {currentQuestionIdx < SAMPLE_QUESTIONS.length - 1 ? 'Next Question →' : 'Submit & Complete'}
              </button>
            )}
          </div>

          {/* Transcript Box */}
          <div className="w-full max-w-md">
            <div className="bg-[#151C2C] border border-gray-700 rounded-2xl p-5 min-h-[100px]">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">Live Transcript</p>
                {isListening && (
                  <span className="flex gap-0.5 items-end">
                    {[1, 2, 1].map((h, i) => (
                      <motion.span
                        key={i}
                        animate={{ height: [`${h * 3}px`, `${h * 8}px`, `${h * 3}px`] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                        className="w-1 bg-blue-400 rounded-full inline-block"
                        style={{ height: `${h * 3}px` }}
                      />
                    ))}
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed min-h-[40px]">
                {userTranscript || (
                  <span className="text-gray-600 italic">
                    {interviewStarted ? 'Start speaking — your answer will appear here...' : 'Waiting for interview to start...'}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewRoom;
