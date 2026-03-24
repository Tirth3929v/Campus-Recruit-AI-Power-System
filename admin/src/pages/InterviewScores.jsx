import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Trophy, Clock, Target, User, Calendar } from 'lucide-react';
import axiosInstance from '../context/axiosInstance';

const InterviewScores = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sessions.filter(s =>
        s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSessions(filtered);
    } else {
      setFilteredSessions(sessions);
    }
  }, [searchTerm, sessions]);

  const fetchSessions = async () => {
    try {
      const { data } = await axiosInstance.get('/ai-interview/all-sessions');
      setSessions(data.sessions || []);
      setFilteredSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (session) => {
    try {
      const { data } = await axiosInstance.get(`/ai-interview/session/${session._id}`);
      setSelectedSession(data.session);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to fetch session details:', err);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Interview Scores</h1>
          <p className="text-white/40 text-sm mt-1">View all student interview performance</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search by student name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-white/30 outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Trophy size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/40">No interview sessions found</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{session.user?.name || 'Unknown User'}</h3>
                      <p className="text-white/40 text-sm">{session.user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-white/40 text-xs mb-1">Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(session.overallScore)}`}>
                        {session.overallScore}%
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">Questions</p>
                      <p className="text-white font-semibold">{session.questions?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">Time Taken</p>
                      <p className="text-white font-semibold">{formatTime(session.totalTimeTaken || 0)}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">Date</p>
                      <p className="text-white font-semibold">
                        {new Date(session.completedAt || session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {session.focusAreas?.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {session.focusAreas.map((area, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleViewDetails(session)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-semibold"
                >
                  <Eye size={14} />
                  View Details
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedSession && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Interview Details</h2>

            {/* Student Info */}
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {selectedSession.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-bold">{selectedSession.user?.name}</p>
                  <p className="text-white/40 text-sm">{selectedSession.user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-white/40 text-xs mb-1">Overall Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(selectedSession.overallScore)}`}>
                    {selectedSession.overallScore}%
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Difficulty</p>
                  <p className="text-white font-semibold">{selectedSession.difficulty}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Status</p>
                  <p className="text-emerald-400 font-semibold">{selectedSession.status}</p>
                </div>
              </div>
            </div>

            {/* Overall Feedback */}
            {selectedSession.overallFeedback && (
              <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-white/40 text-xs mb-2">Overall Feedback</p>
                <p className="text-white/70">{selectedSession.overallFeedback}</p>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Question-wise Performance</h3>
              {selectedSession.questions?.map((q, index) => (
                <div
                  key={index}
                  className="rounded-xl p-5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-white/40 text-xs mb-1">Question {index + 1}</p>
                      <p className="text-white font-semibold">{q.question}</p>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(q.aiEvaluation?.score || 0)}`}>
                      {q.aiEvaluation?.score || 0}%
                    </div>
                  </div>

                  {q.userAnswer && (
                    <div className="mb-3">
                      <p className="text-white/40 text-xs mb-1">Answer:</p>
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
                      <p className="text-emerald-400 text-xs mb-1">Strengths:</p>
                      <ul className="list-disc list-inside text-white/60 text-sm space-y-1">
                        {q.aiEvaluation.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {q.aiEvaluation?.improvements?.length > 0 && (
                    <div>
                      <p className="text-amber-400 text-xs mb-1">Improvements:</p>
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

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-semibold"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InterviewScores;
