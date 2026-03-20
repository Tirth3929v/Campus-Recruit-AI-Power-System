import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Clock, ChevronRight, ChevronLeft, CheckCircle, XCircle, 
  Target, Brain, Zap, MessageSquare, Video, Mic, AlertCircle,
  Sparkles, ArrowRight, FileText, Star
} from 'lucide-react';
import ScreenRecorder from '../components/ScreenRecorder';

const FOCUS_AREAS = [
  { id: 'JavaScript', label: 'JavaScript', icon: '⚡' },
  { id: 'React', label: 'React', icon: '⚛️' },
  { id: 'Node.js', label: 'Node.js', icon: '🟢' },
  { id: 'Python', label: 'Python', icon: '🐍' },
  { id: 'Data Structures', label: 'Data Structures', icon: '📊' },
  { id: 'Algorithms', label: 'Algorithms', icon: '🔢' },
  { id: 'Behavioral', label: 'Behavioral', icon: '💬' },
  { id: 'Problem Solving', label: 'Problem Solving', icon: '🧩' },
];

const DIFFICULTIES = [
  { id: 'Easy', label: 'Easy', description: '3 questions', color: 'bg-green-500' },
  { id: 'Medium', label: 'Medium', description: '5 questions', color: 'bg-yellow-500' },
  { id: 'Hard', label: 'Hard', description: '8 questions', color: 'bg-red-500' },
];

const InterviewRoom = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('setup'); // setup, instructions, interview, results
  const [selectedAreas, setSelectedAreas] = useState(['JavaScript']);
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [overallScore, setOverallScore] = useState(0);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);

  const timerRef = useRef(null);

  // Timer for each question
  useEffect(() => {
    if (step === 'interview' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step, timeLeft]);

  // Generate questions
  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai-interview/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          focusAreas: selectedAreas,
          difficulty
        })
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setQuestions(data.questions);
        setStep('instructions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Start the actual interview
  const handleBeginInterview = () => {
    setStep('interview');
    setTimeLeft(120);
  };

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai-interview/evaluate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          questionIndex: currentQuestion,
          userAnswer: answer
        })
      });

      const data = await response.json();
      if (data.success) {
        setEvaluation(data.evaluation);
        setOverallScore(data.overallScore);
        setSubmittedAnswers(prev => [...prev, {
          question: questions[currentQuestion],
          answer,
          evaluation: data.evaluation
        }]);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Next question
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setAnswer('');
      setEvaluation(null);
      setTimeLeft(120);
    } else {
      handleFinishInterview();
    }
  };

  // Finish interview
  const handleFinishInterview = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai-interview/submit-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();
      if (data.success) {
        setStep('results');
      }
    } catch (error) {
      console.error('Error finishing interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleArea = (area) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  // Setup Step
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Interview Practice
            </h1>
            <p className="text-gray-400 mt-3 text-lg">
              Master your interview skills with AI-powered practice sessions
            </p>
          </motion.div>

          {/* Focus Areas */}
          <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Select Focus Areas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {FOCUS_AREAS.map(area => (
                <button
                  key={area.id}
                  onClick={() => toggleArea(area.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    selectedAreas.includes(area.id)
                      ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                      : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{area.icon}</span>
                  <span className="font-medium">{area.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Select Difficulty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id)}
                  className={`p-5 rounded-xl border transition-all duration-200 ${
                    difficulty === diff.id
                      ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">{diff.label}</span>
                    <div className={`w-3 h-3 rounded-full ${diff.color}`} />
                  </div>
                  <span className="text-gray-400 text-sm">{diff.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartInterview}
            disabled={loading || selectedAreas.length === 0}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate AI Questions
              </>
            )}
          </motion.button>
        </div>
      </div>
    );
  }

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
                Your interview is configured with {questions.length} questions
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
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-purple-400" />
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
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold text-lg flex items-center justify-center gap-3"
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
    const question = questions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">Question {currentQuestion + 1} of {questions.length}</h2>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                question.category === 'Technical' ? 'bg-blue-500/20 text-blue-400' :
                question.category === 'Behavioral' ? 'bg-green-500/20 text-green-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {question.category}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                timeLeft <= 30 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-gray-800 text-gray-300'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Card */}
            <div className="lg:col-span-2">
              <motion.div 
                key={currentQuestion}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-6 mb-6 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{question.question}</h3>
                  </div>
                </div>
              </motion.div>

              {/* Answer Section */}
              <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Your Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here... (Press submit when ready)"
                  className="w-full h-48 bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  disabled={evaluation !== null}
                />

                {evaluation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="font-semibold">AI Feedback</span>
                      <span className="ml-auto text-2xl font-bold text-purple-400">{evaluation.score}%</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{evaluation.feedback}</p>
                    {evaluation.strengths?.length > 0 && (
                      <div className="mb-2">
                        <span className="text-green-400 text-sm font-medium">✓ Strengths:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {evaluation.strengths.map((s, i) => (
                            <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {evaluation.improvements?.length > 0 && (
                      <div>
                        <span className="text-yellow-400 text-sm font-medium">↑ Areas to improve:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {evaluation.improvements.map((imp, i) => (
                            <span key={i} className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg text-xs">
                              {imp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="flex gap-3 mt-4">
                  {!evaluation ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={loading || !answer.trim()}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Submit Answer
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                      {currentQuestion < questions.length - 1 ? (
                        <>
                          Next Question
                          <ArrowRight className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          Finish Interview
                          <CheckCircle className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recording & Progress */}
            <div className="space-y-4">
              {/* Screen Recorder */}
              <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-4 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-400" />
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
                  <Target className="w-4 h-4 text-purple-400" />
                  Your Progress
                </h3>
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-xl flex items-center gap-3 ${
                        idx === currentQuestion 
                          ? 'bg-purple-600/20 border border-purple-500' 
                          : idx < currentQuestion 
                            ? 'bg-green-500/20 border border-green-500/50'
                            : 'bg-gray-800/50 border border-gray-700'
                      }`}
                    >
                      {idx < currentQuestion ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : idx === currentQuestion ? (
                        <Play className="w-4 h-4 text-purple-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-600" />
                      )}
                      <span className="text-sm truncate flex-1">{q.question.substring(0, 30)}...</span>
                    </div>
                  ))}
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
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-6">
              <Star className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Interview Complete!</h1>
            <p className="text-gray-400 text-lg">Here's how you performed</p>
          </motion.div>

          {/* Score Card */}
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
                    strokeDasharray={`${(overallScore / 100) * 440} 440`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold">{overallScore}%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400">
              You answered {submittedAnswers.length} questions
            </p>
          </div>

          {/* Answer Summary */}
          <div className="bg-[#151C2C]/80 border border-gray-800 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Question Summary</h2>
            <div className="space-y-4">
              {submittedAnswers.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">Q{idx + 1}: {item.question.question}</h3>
                    <span className="text-purple-400 font-semibold">{item.evaluation?.score}%</span>
                  </div>
                  <p className="text-gray-400 text-sm">{item.answer.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Practice Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold flex items-center justify-center gap-2"
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

const RefreshCw = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default InterviewRoom;
