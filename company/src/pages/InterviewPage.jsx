import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Send, StopCircle, AlertCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const mockQuestions = [
    "Tell me about yourself and your background.",
    "What are the key differences between React and Angular?",
    "Explain the concept of closures in JavaScript.",
    "How do you handle state management in complex applications?",
    "Describe a challenging technical problem you solved recently."
];

const InterviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { interviewId, subject } = location.state || { interviewId: null, subject: 'General' };

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sessionScore, setSessionScore] = useState(0);
    const [scores, setScores] = useState([]);

    const currentQuestion = mockQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === mockQuestions.length - 1;

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) return;
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/interview/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: currentQuestion, answer }),
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setFeedback(data);
                setScores(prev => [...prev, data.score]);
                setSessionScore(Math.round((sessionScore * scores.length + data.score) / (scores.length + 1)));
            }
        } catch (error) {
            console.error(error);
            alert("Failed to get feedback");
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
        if (!interviewId) return navigate('/student/dashboard');
        
        const finalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) || 0;
        let status = 'Average';
        if (finalScore >= 85) status = 'Outstanding';
        else if (finalScore >= 70) status = 'Good';

        try {
            await fetch(`http://localhost:5000/api/interviews/${interviewId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: finalScore, status }),
                credentials: 'include'
            });
            navigate('/student/history');
        } catch (error) {
            console.error("Failed to save interview", error);
            navigate('/student/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 font-sans flex flex-col items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            {subject} Interview
                        </h1>
                        <p className="text-gray-400 text-sm">Question {currentQuestionIndex + 1} of {mockQuestions.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Current Score</p>
                        <p className="text-2xl font-bold text-emerald-400">{sessionScore}</p>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 backdrop-blur-sm">
                    <h2 className="text-xl font-medium text-white mb-6 leading-relaxed">
                        {currentQuestion}
                    </h2>

                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full h-40 bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-4"
                        disabled={!!feedback || loading}
                    />

                    {!feedback ? (
                        <div className="flex justify-end">
                            <button 
                                onClick={handleSubmitAnswer} 
                                disabled={loading || !answer.trim()}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                Submit Answer
                            </button>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <CheckCircle className="text-emerald-400 mt-1" size={24} />
                                <div>
                                    <h3 className="font-bold text-emerald-400 text-lg">Feedback ({feedback.score}/100)</h3>
                                    <p className="text-gray-300 mt-1">{feedback.feedback}</p>
                                    <p className="text-sm text-emerald-300/80 mt-2 font-medium">💡 Tip: {feedback.improvement}</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={handleNext} className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                                    {isLastQuestion ? "Finish Interview" : "Next Question"} <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default InterviewPage;