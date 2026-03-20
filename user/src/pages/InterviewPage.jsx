import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Send, StopCircle, AlertCircle, CheckCircle, ArrowRight, Loader2, Maximize, Settings } from 'lucide-react';
import ScreenRecorder from '../components/ScreenRecorder';
import axiosInstance from './axiosInstance';

const InterviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { interviewId, subject } = location.state || { interviewId: null, subject: 'General' };

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sessionScore, setSessionScore] = useState(0);

    const [questions, setQuestions] = useState([]);
    const [aiSessionId, setAiSessionId] = useState(null);
    const [isGenerating, setIsGenerating] = useState(true);

    // Voice Dictation State
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            // In some browsers continuous doesn't automatically stop, but we control it manually
            // Wait, continuous=false might be safer to let it auto-stop on silence
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    }
                }
                if (finalTranscript) {
                    setAnswer(prev => prev + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const currentQuestion = questions[currentQuestionIndex]?.question || 'Generating...';
    const isLastQuestion = questions.length > 0 && currentQuestionIndex === questions.length - 1;

    // Fetch questions on mount
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axiosInstance.post('/ai-interview/generate-questions', {
                    focusAreas: [subject],
                    difficulty: 'Medium',
                    jobId: interviewId
                });
                if (res.data.success) {
                    setAiSessionId(res.data.sessionId);
                    setQuestions(res.data.questions);
                }
            } catch (err) {
                console.error("Failed to fetch AI questions", err);
            } finally {
                setIsGenerating(false);
            }
        };
        fetchQuestions();
    }, [subject, interviewId]);

    const handleSubmitAnswer = async () => {
        if (!answer.trim() || !aiSessionId) return;
        setLoading(true);

        try {
            const res = await axiosInstance.post('/ai-interview/evaluate-answer', {
                sessionId: aiSessionId,
                questionIndex: currentQuestionIndex,
                userAnswer: answer
            });

            if (res.data.success) {
                setFeedback({
                    score: res.data.evaluation.score,
                    feedback: res.data.evaluation.feedback,
                    improvement: res.data.evaluation.improvements?.[0] || 'Keep practicing.'
                });
                setSessionScore(res.data.overallScore);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setAnswer('');
        setFeedback(null);
        if (isLastQuestion) {
            finishInterview();
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const finishInterview = async () => {
        if (!aiSessionId) return navigate('/student/history');

        try {
            await axiosInstance.post(`/ai-interview/submit-session`, {
                sessionId: aiSessionId
            });
        } catch (error) {
            console.error("Failed to submit session", error);
        } finally {
            navigate('/student/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-white/10 glass-panel flex items-center justify-between px-6 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 font-bold text-white text-lg">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        Live Session
                    </div>
                </div>

                <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-mono hidden md:block">
                    {subject} Interview
                </h1>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Session Score</p>
                        <p className="text-xl font-bold text-emerald-400">{sessionScore}</p>
                    </div>
                    <button onClick={finishInterview} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg text-sm font-bold border border-red-500/30 transition-colors flex items-center gap-2">
                        <StopCircle size={16} /> End Interview
                    </button>
                </div>
            </div>

            {/* Main Area: Split Layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* Left Column: Video Feed & Proctored Environment */}
                <div className="flex-1 p-6 flex flex-col bg-black/40 relative overflow-y-auto">
                    <ScreenRecorder
                        jobId={interviewId}
                        onRecordingComplete={(data) => console.log('Recording completed:', data)}
                        showScreenShare={true}
                    />
                </div>

                {/* Right Column: Q&A Pane */}
                <div className="w-full lg:w-[450px] xl:w-[500px] border-l border-white/10 glass-panel flex flex-col shrink-0 z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.3)]">

                    {/* Active Question Area */}
                    <div className="p-6 border-b border-white/5 bg-gradient-to-b from-purple-900/10 to-transparent">
                        <div className="flex justify-between items-center mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <span>Question {currentQuestionIndex + 1} of {questions.length || 5}</span>
                            <span className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">AI Evaluator</span>
                        </div>
                        <h2 className="text-xl font-bold text-white leading-relaxed">
                            {isGenerating ? "AI is fetching your questions..." : currentQuestion}
                        </h2>
                    </div>

                    {/* Answer Area */}
                    <div className="flex-1 p-6 flex flex-col overflow-y-auto custom-scrollbar relative">
                        <AnimatePresence mode="wait">
                            {!feedback ? (
                                <motion.div
                                    key="typing"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                    className="flex-1 flex flex-col"
                                >
                                    <label className="text-sm font-bold text-gray-400 mb-2 flex items-center justify-between">
                                        Your Response
                                        <button
                                            onClick={toggleListening}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'}`}
                                        >
                                            {isListening ? (
                                                <><MicOff size={14} /> Stop Dictation</>
                                            ) : (
                                                <><Mic size={14} /> Voice Dictation</>
                                            )}
                                        </button>
                                    </label>
                                    <textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        placeholder="Type your answer, or use voice dictation..."
                                        className="w-full flex-1 bg-black/20 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none shadow-inner"
                                        disabled={loading}
                                    />
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handleSubmitAnswer}
                                            disabled={loading || !answer.trim()}
                                            className="w-full py-4 btn-gradient rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                            {loading ? 'Analyzing Response...' : 'Submit Answer'}
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="feedback"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 shadow-inner flex-1">
                                        <div className="flex items-center gap-3 mb-6 border-b border-emerald-500/20 pb-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                                <CheckCircle className="text-emerald-400" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">AI Analysis Complete</h3>
                                                <p className="text-sm font-medium text-emerald-400">Score: {feedback.score}/100</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Feedback</p>
                                                <p className="text-gray-300 text-sm leading-relaxed">{feedback.feedback}</p>
                                            </div>
                                            <div className="bg-blue-500/10 border left-l-2 border-l-blue-500 p-3 rounded-r-lg">
                                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Improvement Area</p>
                                                <p className="text-blue-200/80 text-sm font-medium">{feedback.improvement}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handleNext}
                                            className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                        >
                                            {isLastQuestion ? "Finish Interview" : "Proceed to Next Question"} <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewPage;