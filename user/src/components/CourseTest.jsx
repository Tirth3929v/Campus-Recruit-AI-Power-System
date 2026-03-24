import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, CheckCircle, XCircle, Award, ChevronRight, 
  RotateCcw, BookOpen, Brain
} from 'lucide-react';

const CourseTest = ({ courseId, courseTitle, onClose, onComplete }) => {
  const [testState, setTestState] = useState('idle'); // idle, loading, testing, results
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [loadingError, setLoadingError] = useState(null);
  const timerRef = useRef(null);

  const TOTAL_TIME = 60;
  const TOTAL_QUESTIONS = 10;

  const startTest = async () => {
    setTestState('loading');
    setLoadingError(null);

    try {
      const res = await fetch(`/api/courses/${courseId}/generate-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setQuestions(data.questions || []);
        setTestState('testing');
        setTimeLeft(TOTAL_TIME);
        setCurrentQuestion(0);
        setAnswers({});
      } else {
        setLoadingError(data.message || 'Failed to generate test');
        setTestState('idle');
      }
    } catch (err) {
      console.error('Test generation error:', err);
      setLoadingError('Failed to load test. Please try again.');
      setTestState('idle');
    }
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (testState === 'testing' && timeLeft > 0) {
      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testState, startTimer]);

  const handleSelectAnswer = (option) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: option
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmitTest = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    // Mark unanswered as incorrect
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = TOTAL_QUESTIONS - answeredCount;

    setScore(correctCount);
    setTestState('results');

    // Save MCQ result to backend
    try {
      await fetch(`/api/courses/${courseId}/mcq-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score: correctCount })
      });
    } catch (err) {
      console.error('Failed to save MCQ result:', err);
    }
  }, [answers, questions, courseId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = () => {
    const percentage = (score / TOTAL_QUESTIONS) * 100;
    if (percentage >= 70) return 'text-green-400';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-700 my-8"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="text-teal-400" size={28} />
              <div>
                <h2 className="text-xl font-bold text-white">Course Knowledge Test</h2>
                <p className="text-sm text-gray-400">{courseTitle}</p>
              </div>
            </div>
            {testState === 'testing' && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                timeLeft <= 10 ? 'bg-red-500/20 text-red-400' : 'bg-teal-500/20 text-teal-400'
              }`}>
                <Clock size={20} />
                <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
              </div>
            )}
            {testState === 'results' && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Idle State - Start Button */}
            {testState === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Award size={64} className="mx-auto text-yellow-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Test Your Knowledge</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Take a 10-question test to verify your understanding of the course material.
                  You have 60 seconds to complete all questions.
                </p>
                <div className="bg-gray-700/50 rounded-xl p-4 mb-6 max-w-sm mx-auto">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Questions:</span>
                    <span className="text-white">10</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Time Limit:</span>
                    <span className="text-white">1 minute</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Passing Score:</span>
                    <span className="text-green-400">70% (7/10)</span>
                  </div>
                </div>
                {loadingError && (
                  <p className="text-red-400 text-sm mb-4">{loadingError}</p>
                )}
                <button
                  onClick={startTest}
                  className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-xl hover:from-teal-500 hover:to-blue-500 transition-all flex items-center gap-2 mx-auto"
                >
                  <BookOpen size={20} />
                  Start Course Test
                </button>
              </motion.div>
            )}

            {/* Loading State */}
            {testState === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Generating test questions...</p>
              </motion.div>
            )}

            {/* Testing State */}
            {testState === 'testing' && currentQ && (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Progress */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-gray-400">
                    Question {currentQuestion + 1} of {TOTAL_QUESTIONS}
                  </span>
                  <div className="flex gap-1">
                    {questions.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full ${
                          answers[idx] ? 'bg-green-500' : idx === currentQuestion ? 'bg-teal-500' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Question */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">{currentQ.question}</h3>
                  
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((option) => {
                      const isSelected = answers[currentQuestion] === option;
                      return (
                        <button
                          key={option}
                          onClick={() => handleSelectAnswer(option)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'border-teal-500 bg-teal-500/10'
                              : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
                            isSelected ? 'bg-teal-500 text-white' : 'bg-gray-600 text-gray-300'
                          }`}>
                            {option}
                          </div>
                          <span className="text-gray-200">
                            {currentQ[`option${option}`]}
                          </span>
                          {isSelected && (
                            <CheckCircle size={20} className="ml-auto text-teal-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {currentQuestion === TOTAL_QUESTIONS - 1 ? (
                    <button
                      onClick={handleSubmitTest}
                      className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center gap-2"
                    >
                      Submit Test
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-2"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Results State */}
            {testState === 'results' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="mb-6">
                  {score >= 7 ? (
                    <Award size={72} className="mx-auto text-yellow-500 mb-4" />
                  ) : (
                    <RotateCcw size={72} className="mx-auto text-blue-500 mb-4" />
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {score >= 7 ? 'Congratulations!' : 'Test Completed'}
                  </h3>
                  <p className="text-gray-400">
                    {score >= 7 
                      ? 'You passed the course knowledge test!' 
                      : 'Keep learning and try again!'}
                  </p>
                </div>

                {/* Score Display */}
                <div className="bg-gray-700/50 rounded-2xl p-6 mb-6">
                  <div className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>
                    {score} / {TOTAL_QUESTIONS}
                  </div>
                  <p className="text-gray-400">
                    Score: {Math.round((score / TOTAL_QUESTIONS) * 100)}%
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <CheckCircle size={24} className="mx-auto text-green-400 mb-2" />
                    <p className="text-green-400 font-bold text-lg">{score}</p>
                    <p className="text-gray-400 text-sm">Correct</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <XCircle size={24} className="mx-auto text-red-400 mb-2" />
                    <p className="text-red-400 font-bold text-lg">{TOTAL_QUESTIONS - score}</p>
                    <p className="text-gray-400 text-sm">Wrong</p>
                  </div>
                </div>

                {/* Correct Answers Review */}
                <div className="text-left mb-6">
                  <h4 className="text-white font-bold mb-3">Review Answers:</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {questions.map((q, idx) => {
                      const userAnswer = answers[idx];
                      const isCorrect = userAnswer === q.correctAnswer;
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-xl border ${
                            isCorrect 
                              ? 'bg-green-500/10 border-green-500/20' 
                              : 'bg-red-500/10 border-red-500/20'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {isCorrect ? (
                              <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="text-white text-sm font-medium">{idx + 1}. {q.question}</p>
                              <p className="text-gray-400 text-xs mt-1">
                                Your answer: {userAnswer ? `${userAnswer}. ${q[`option${userAnswer}`]}` : 'Not answered'}
                              </p>
                              {!isCorrect && (
                                <p className="text-green-400 text-xs">
                                  Correct: {q.correctAnswer}. {q[`option${q.correctAnswer}`]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-500 transition-all"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => onComplete && onComplete(score)}
                    className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-xl hover:from-teal-500 hover:to-blue-500 transition-all flex items-center gap-2"
                  >
                    Continue
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseTest;
