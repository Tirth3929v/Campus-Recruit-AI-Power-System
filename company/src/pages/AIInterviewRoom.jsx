import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, Clock, CheckCircle, Target, Brain, Video, Mic, 
  Volume2, ArrowRight, FileText, Star, Loader
} from 'lucide-react';
import ScreenRecorder from '../components/ScreenRecorder';

const AIInterviewRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobRole = 'Software Developer', skills = 'JavaScript, React, Node.js' } = location.state || {};
  
  const [step, setStep] = useState('instructions'); // instructions, interview, results
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Voice & Transcription State
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [fullTranscript, setFullTranscript] = useState([]);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setCurrentTranscript(prev => (prev + ' ' + transcript).trim());
          setAnswer(prev => (prev + ' ' + transcript).trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

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

  // User Dictation - Start/Stop Listening
  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setCurrentTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Fetch next question from API
  const fetchNextQuestion = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai-interview/next-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobRole,
          skills,
          conversationHistory: fullTranscript
        })
      });

      const data = await response.json();
      if (data.success) {
        if (data.isComplete) {
          // Interview is complete, trigger grading
          await handleFinishInterview();
        } else {
          // Set next question
          setCurrentQuestion(data.nextQuestion);
          setTimeLeft(120);
          setTimeout(() => askQuestion(data.nextQuestion), 500);
        }
      } else {
        console.error('Failed to fetch next question:', data.message);
        alert('Failed to generate next question. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching next question:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Grade Interview
  const gradeInterview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/interview/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullTranscript, jobId: sessionId })
      });
      const data = await response.json();
      if (data.success) {
        console.log('Interview graded:', data);
      }
    } catch (error) {
      console.error('Error grading interview:', error);
    }
  };

  // Timer
  useEffect(() => {
    if (step === 'interview' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step, timeLeft]);

  // Fetch first question on interview start
  useEffect(() => {
    if (step === 'interview' && !currentQuestion && !isGenerating) {
      fetchNextQuestion();
    }
  }, [step]);

  // Start interview
  const handleBeginInterview = () => {
    setStep('interview');
  };

  // Next question - Submit answer and fetch next
  const handleNextQuestion = async () => {
    if (!answer.trim() && !currentTranscript.trim()) {
      alert('Please provide an answer before continuing.');
      return;
    }

    // Add current Q&A to transcript
    const answerText = currentTranscript.trim() || answer.trim();
    const updatedTranscript = [...fullTranscript, {
      question: currentQuestion,
      answer: answerText
    }];
    setFullTranscript(updatedTranscript);

    // Reset answer fields
    setAnswer('');
    setCurrentTranscript('');

    // Fetch next question with updated history
    await fetchNextQuestion();
  };

  // Finish interview
  const handleFinishInterview = async () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setLoading(true);
    await gradeInterview();
    setLoading(false);
    setStep('results');
  };

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
              <h2 className="text-3xl font-bold">Ready to Begin!</h2>
              <p className="text-gray-400 mt-2">
                AI-Powered Dynamic Interview
              </p>
              <p className="text-teal-400 text-sm mt-2">
                Position: {jobRole} | Skills: {skills}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { icon: Video, title: 'Enable Camera', desc: 'Allow camera access for video recording' },
                { icon: Mic, title: 'Answer Questions', desc: 'Speak or type your responses' },
                { icon: Clock, title: '2 Minutes per Question', desc: 'Manage your time wisely' },
                { icon: Brain, title: 'AI Evaluation', desc: 'Get instant feedback on your answers' },
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
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 rounded-xl font-semibold text-lg flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" />
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
      <div className="min-h-screen bg-[#0B0F19] text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">Question {fullTranscript.length + 1}</h2>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-teal-500/20 text-teal-400">
                Dynamic AI Interview
              </span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              timeLeft <= 30 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-gray-800 text-gray-300'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Card */}
            <div className="lg:col-span-2">
              {isGenerating && !currentQuestion ? (
                <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-6 mb-6 backdrop-blur-sm flex items-center justify-center">
                  <Loader className="w-8 h-8 animate-spin text-teal-400" />
                  <span className="ml-3 text-gray-400">AI is generating your next question...</span>
                </div>
              ) : (
                <motion.div 
                  key={currentQuestion}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-6 mb-6 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-teal-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{currentQuestion || 'Loading question...'}</h3>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Answer Section */}
              <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Your Answer
                  </label>
                  {/* Voice Controls */}
                  <div className="flex items-center gap-2">
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
                    <button
                      onClick={startListening}
                      disabled={isAiSpeaking}
                      className={`p-2 rounded-lg transition-all ${
                        isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                      title={isListening ? 'Stop Listening' : 'Start Voice Input'}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={isListening ? "Listening... Speak now!" : "Type your answer here or click the mic to speak"}
                  className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none"
                  disabled={isGenerating}
                />

                {currentTranscript && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <span className="text-xs text-blue-400 font-medium">Live Transcript:</span>
                    <p className="text-sm text-gray-300 mt-1">{currentTranscript}</p>
                  </div>
                )}

                {isListening && (
                  <div className="flex items-center gap-2 mt-2 text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm">Listening... Speak your answer</span>
                  </div>
                )}

                {isAiSpeaking && (
                  <div className="flex items-center gap-2 mt-2 text-teal-400">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">AI is speaking...</span>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleNextQuestion}
                    disabled={isGenerating || (!answer.trim() && !currentTranscript.trim()) || !currentQuestion}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        AI is thinking...
                      </>
                    ) : (
                      <>
                        Submit & Continue
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Recording & Progress */}
            <div className="space-y-4">
              {/* Screen Recorder */}
              <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-4 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4 text-teal-400" />
                  Interview Recording
                </h3>
                <ScreenRecorder 
                  jobId={sessionId}
                  onRecordingComplete={(data) => console.log('Recording:', data)}
                  maxDuration={600}
                />
              </div>

              {/* Progress */}
              <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-4 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-teal-400" />
                  Interview Progress
                </h3>
                <div className="space-y-2">
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-teal-400">{fullTranscript.length}</div>
                    <div className="text-sm text-gray-400">Questions Answered</div>
                  </div>
                  {fullTranscript.slice(-3).map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center gap-3"
                    >
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm truncate flex-1">{item.question.substring(0, 30)}...</span>
                    </div>
                  ))}
                  {currentQuestion && (
                    <div className="p-3 rounded-xl bg-teal-600/20 border border-teal-500 flex items-center gap-3">
                      <Play className="w-4 h-4 text-teal-400" />
                      <span className="text-sm truncate flex-1">Current Question</span>
                    </div>
                  )}
                </div>
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
            <p className="text-gray-400 text-lg">Your responses have been submitted</p>
          </motion.div>

          {/* Transcript Summary */}
          <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Your Answers</h2>
            <div className="space-y-4">
              {fullTranscript.map((item, idx) => (
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

export default AIInterviewRoom;
