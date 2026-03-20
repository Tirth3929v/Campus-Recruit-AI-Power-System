import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, FileText, ArrowLeft, Download, Share2 } from 'lucide-react';

const InterviewResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { messages, duration, course } = location.state || { messages: [], duration: 0, course: 'Unknown' };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Mock Analysis Logic
  const calculateScore = () => {
    // In a real app, this would be based on AI analysis of the answers
    return Math.min(100, Math.max(60, messages.filter(m => m.sender === 'user').length * 10));
  };

  const score = calculateScore();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/student/interview')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Results</h1>
          <p className="text-gray-500">Review your performance for {course}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-100 text-blue-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Overall Score</p>
            <h3 className="text-2xl font-bold text-gray-900">{score}/100</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-orange-100 text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Duration</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatTime(duration)}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-purple-100 text-purple-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Questions Answered</p>
            <h3 className="text-2xl font-bold text-gray-900">{messages.filter(m => m.sender === 'user').length}</h3>
          </div>
        </motion.div>
      </div>

      {/* Transcript Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Interview Transcript</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Download size={16} /> Export
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6 bg-gray-50/50 max-h-[500px] overflow-y-auto">
          {messages.filter(m => m.text).map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-400 mb-1 capitalize">{msg.sender === 'ai' ? 'AI Interviewer' : 'You'}</span>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewResultsPage;