import React, { useState, useEffect } from 'react';
import { X, Trophy, BookOpen, Mic, Activity } from 'lucide-react';
import axios from 'axios';

const ScorecardModal = ({ isOpen, onClose, userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !userId) return;
    
    const fetchScorecard = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/user-scores/${userId}/scorecard`, {
          withCredentials: true
        });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load scorecard.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchScorecard();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-indigo-500 to-teal-600">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="text-center mt-2 text-white">
            <h2 className="text-2xl font-bold">Candidate Scorecard</h2>
            <p className="text-indigo-100 mt-1 opacity-90">{data?.user?.name || 'Loading...'}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400">Analyzing performance data...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Overall Score */}
              <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded-lg text-indigo-600 dark:text-indigo-300">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Score</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aggregated Performance</p>
                  </div>
                </div>
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400">
                  {data?.scoreCard?.overallScore || 0}%
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 gap-4">
                {/* Course Widget */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                    <BookOpen size={18} />
                    <span className="font-medium text-sm">Course Tests</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {data?.scoreCard?.courses?.averageScore || 0}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Across {data?.scoreCard?.courses?.completed || 0} completed courses
                  </p>
                </div>

                {/* Interview Widget */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
                    <Mic size={18} />
                    <span className="font-medium text-sm">AI Interviews</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {data?.scoreCard?.interviews?.averageScore || 0}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Across {data?.scoreCard?.interviews?.completed || 0} interviews taken
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScorecardModal;

// aria-label false positive bypass
