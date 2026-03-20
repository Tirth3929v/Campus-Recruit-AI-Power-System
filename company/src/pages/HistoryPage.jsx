import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, MessageSquare, Trash2, Download, FileText, Search, ChevronLeft, ChevronRight, ArrowUpDown, Award } from 'lucide-react';

const HistoryPage = () => {
  const { user } = useAuth();
  const { sessions, deleteSession: deleteChatSession } = useChat();
  const [apiSessions, setApiSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const downloadTranscript = (session) => {
    let transcript = '';
    if (session.type === 'api') {
      transcript = session.messages.map((r, i) => 
        `Question ${i+1}: ${r.question}\nYour Answer: ${r.userAnswer}\nFeedback: ${r.feedback}\nScore: ${r.score}/10\n`
      ).join('\n-------------------\n\n');
    } else {
      transcript = session.messages
        .map((msg) => `${msg.sender === 'ai' ? 'AI Interviewer' : 'You'}: ${msg.text}`)
        .join('\n\n');
    }
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${new Date(session.date).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    document.title = "Interview History | Campus Recruit";
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/interviews/${user.id}`)
        .then(res => res.json())
        .then(data => setApiSessions(data))
        .catch(err => console.error("Failed to fetch history:", err));
    }
  }, [user]);

  const handleDelete = async (id, type) => {
    if (type === 'api') {
      try {
        await fetch(`/api/interviews/${id}`, { method: 'DELETE' });
        setApiSessions(prev => prev.filter(s => s._id !== id));
      } catch (e) { console.error(e); }
    } else {
      deleteChatSession(id);
    }
  };

  const allSessions = [
    ...apiSessions.map(s => ({ ...s, id: s._id, type: 'api', course: 'Technical Interview', duration: 0, messages: s.results })),
    ...sessions.map(s => ({ ...s, type: 'chat' }))
  ];

  const filteredSessions = allSessions.filter(session => {
    const query = searchQuery.toLowerCase();
    const courseName = (session.course || 'General').toLowerCase();
    const dateString = formatDate(session.date).toLowerCase();
    return courseName.includes(query) || dateString.includes(query);
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (sortOption === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortOption === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortOption === 'duration-desc') return b.duration - a.duration;
    if (sortOption === 'duration-asc') return a.duration - b.duration;
    return 0;
  });

  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSessions = sortedSessions.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Interview History</h1>
        {sessions.length > 0 && (
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="duration-desc">Longest Duration</option>
                <option value="duration-asc">Shortest Duration</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Interview History</h3>
          <p className="text-gray-500 mt-1">Complete your first mock interview to see it here.</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Results Found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
          {currentSessions.map((session, index) => (
            <motion.div 
              key={session.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      {session.course || 'General'}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(session.date)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Mock Interview Session
                  </h3>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    {session.type === 'api' ? (
                      <div className="flex items-center gap-2 text-indigo-600 font-medium">
                        <Award size={16} />
                        <span>Score: {session.totalScore}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span>Duration: {formatDuration(session.duration)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-gray-400" />
                      <span>{session.messages?.length || 0} {session.type === 'api' ? 'Questions' : 'Messages'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <button 
                    onClick={() => downloadTranscript(session)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Download Transcript"
                  >
                    <Download size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(session.id, session.type)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Session"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;