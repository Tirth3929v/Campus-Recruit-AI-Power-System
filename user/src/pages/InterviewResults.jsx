import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, TrendingUp, Clock, CheckCircle, XCircle, 
  ArrowRight, BarChart3, Target, Award, Home 
} from 'lucide-react';
import axios from 'axios';

const InterviewResults = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await axios.get(`/api/ai-interview/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSession(data.session);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <XCircle size={64} className="text-red-400" />
        <p className="text-white/60">Interview session not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
            <Trophy size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Interview Complete!</h1>
          <p className="text-white/60">Here's how you performed</p>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-8 text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-white/40 text-sm mb-2">Overall Score</p>
          <div className={`text-7xl font-black mb-2 ${getScoreColor(session.overallScore)}`}>
            {session.overallScore}%
          </div>
          <div className="inline-block px-4 py-2 rounded-full bg-white/10 text-white font-semibold">
            Grade: {getScoreGrade(session.overallScore)}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <BarChart3 size={20} className="text-blue-400" />
              </div>
              <p className="text-white/60 text-sm">Questions</p>
            </div>
            <p className="text-3xl font-bold text-white">{session.questions.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock size={20} className="text-amber-400" />
              </div>
              <p className="text-white/60 text-sm">Time Taken</p>
            </div>
            <p className="text-3xl font-bold text-white">{formatTime(session.totalTimeTaken || 0)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Target size={20} className="text-emerald-400" />
              </div>
              <p className="text-white/60 text-sm">Difficulty</p>
            </div>
            <p className="text-3xl font-bold text-white">{session.difficulty}</p>
          </motion.div>
        </div>

        {/* Overall Feedback */}
        {session.overallFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Award size={20} className="text-purple-400" />
              <h2 className="text-xl font-bold text-white">Overall Feedback</h2>
            </div>
            <p className="text-white/70 leading-relaxed">{session.overallFeedback}</p>
          </motion.div>
        )}

        {/* Question-wise Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h2 className="text-xl font-bold text-white mb-6">Question-wise Performance</h2>
          <div className="space-y-4">
            {session.questions.map((q, index) => (
              <div
                key={index}
                className="rounded-xl p-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-white/40 text-xs mb-1">Question {index + 1}</p>
                    <p className="text-white font-semibold mb-2">{q.question}</p>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(q.aiEvaluation?.score || 0)}`}>
                    {q.aiEvaluation?.score || 0}%
                  </div>
                </div>

                {q.userAnswer && (
                  <div className="mb-3">
                    <p className="text-white/40 text-xs mb-1">Your Answer:</p>
                    <p className="text-white/70 text-sm">{q.userAnswer}</p>
                  </div>
                )}

                {q.aiEvaluation?.feedback && (
                  <div className="mb-3">
                    <p className="text-white/40 text-xs mb-1">Feedback:</p>
                    <p className="text-white/70 text-sm">{q.aiEvaluation.feedback}</p>
                  </div>
                )}

                {q.aiEvaluation?.strengths?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-emerald-400 text-xs mb-1 flex items-center gap-1">
                      <CheckCircle size={12} /> Strengths:
                    </p>
                    <ul className="list-disc list-inside text-white/60 text-sm space-y-1">
                      {q.aiEvaluation.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {q.aiEvaluation?.improvements?.length > 0 && (
                  <div>
                    <p className="text-amber-400 text-xs mb-1 flex items-center gap-1">
                      <TrendingUp size={12} /> Areas for Improvement:
                    </p>
                    <ul className="list-disc list-inside text-white/60 text-sm space-y-1">
                      {q.aiEvaluation.improvements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Home size={18} />
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/ai-interview')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
          >
            Take Another Interview
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewResults;
