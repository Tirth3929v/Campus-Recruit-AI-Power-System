import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Play, CheckCircle2, Lock, FileText, Video, 
  Clock, Award, ChevronRight, BookMarked, 
  Zap, Target, TrendingUp, Search, ChevronLeft
} from 'lucide-react';

/**
 * LearningDashboard - Modern Educational Platform Dashboard
 * Features:
 * - Resume Course banner
 * - Course Modules grid
 * - Premium styling with hover effects
 * - Light/Dark mode support
 */
const LearningDashboard = () => {
  const { courseProgress } = useOutletContext() || { courseProgress: 33 };
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Sample course data
  const courseModules = [
    { title: 'Introduction to Hooks', type: 'Video', duration: '12m', status: 'completed', category: 'React' },
    { title: 'The useState Hook', type: 'Video', duration: '18m', status: 'completed', category: 'React' },
    { title: 'The useEffect Hook', type: 'Video', duration: '25m', status: 'completed', category: 'React' },
    { title: 'Custom Hooks Pattern', type: 'Practice', duration: '45m', status: 'in-progress', category: 'React' },
    { title: 'The useContext Hook', type: 'Video', duration: '15m', status: 'locked', category: 'React' },
    { title: 'Performance Hooks', type: 'Quiz', duration: '10m', status: 'locked', category: 'React' },
    { title: 'useReducer Deep Dive', type: 'Video', duration: '20m', status: 'locked', category: 'React' },
    { title: 'Custom Hooks Library', type: 'Project', duration: '60m', status: 'locked', category: 'React' },
  ];

  // Upcoming content
  const upcomingCourses = [
    { title: 'Advanced TypeScript', progress: 0, icon: '🔷' },
    { title: 'Node.js Mastery', progress: 0, icon: '🟢' },
    { title: 'GraphQL Fundamentals', progress: 0, icon: '🟣' },
  ];

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = courseModules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(courseModules.length / itemsPerPage);

  return (
    <div className="space-y-8">
      
      {/* ==================== HERO: RESUME COURSE ==================== */}
      <section>
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <Zap size={20} className="text-indigo-500" />
             Resume Learning
           </h2>
           <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
             View All Courses <ChevronRight size={16} />
           </button>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
          {/* Background gradient effect */}
          <div className="absolute top-0 right-0 w-72 h-full bg-gradient-to-l from-indigo-50 dark:from-indigo-500/10 via-violet-50 dark:via-violet-500/5 to-transparent opacity-70 pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                ⚛️
            </div>
            
            {/* Content */}
            <div className="flex-1 w-full">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  In Progress • Last visited 2 hours ago
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  React Hooks
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Mastering useEffect, useState, and Custom Hooks</p>

                {/* Progress Bar */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-full relative overflow-hidden transition-all duration-1000" style={{ width: `${courseProgress}%` }}>
                          <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">
                      {courseProgress}%
                    </span>
                </div>
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => navigate('/course/player')}
              className="w-full lg:w-auto whitespace-nowrap px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <Play size={18} className="fill-current" />
              Continue Learning
            </button>
          </div>
        </div>
      </section>

      {/* ==================== COURSE MODULES GRID ==================== */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookMarked size={20} className="text-violet-500" />
            Course Modules
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hidden sm:inline">6 of 8 completed</span>
            <Award size={16} className="text-yellow-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentItems.map((module, i) => (
            <div 
              key={i} 
              onClick={() => module.status !== 'locked' && navigate('/course/player')}
              className={`group border rounded-2xl p-5 transition-all duration-300 hover:scale-105 ${
                module.status === 'locked' 
                  ? 'bg-gray-50/50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 opacity-60 cursor-not-allowed' 
                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer'
              }`}
            >
              {/* Status Icon & Type */}
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  module.status === 'completed' 
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-500/20 dark:to-emerald-500/20 text-green-600 dark:text-green-400' 
                    : module.status === 'in-progress'
                    ? 'bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 text-indigo-600 dark:text-indigo-400'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
                }`}>
                  {module.status === 'completed' ? <CheckCircle2 size={20} /> : 
                   module.status === 'locked' ? <Lock size={20} /> : 
                   <Play size={20} className="fill-current" />}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                  <Clock size={12} />
                  <span>{module.duration}</span>
                </div>
              </div>
              
              {/* Title & Category */}
              <div className="mb-3">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-2">
                  {module.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {module.title}
                </h3>
              </div>
              
              {/* Type Badge */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                {module.type === 'Video' ? <Video size={14} /> : 
                 module.type === 'Practice' ? <Target size={14} /> :
                 module.type === 'Quiz' ? <Award size={14} /> :
                 <FileText size={14} />}
                <span>{module.type}</span>
              </div>

              {/* Completed Checkmark */}
              {module.status === 'completed' && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle2 size={14} />
                  <span>Completed</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                  currentPage === number
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        )}
      </section>

      {/* ==================== UPCOMING COURSES ==================== */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-500" />
          Up Next
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingCourses.map((course, i) => (
            <div 
              key={i}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/20 flex items-center justify-center text-2xl">
                  {course.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500">Not started</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== ACHIEVEMENTS SECTION ==================== */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-2xl p-6 border border-amber-200 dark:border-amber-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={20} className="text-amber-500" />
              Achievements
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Keep learning to unlock more badges!</p>
          </div>
          <div className="flex -space-x-3">
            {['🏆', '⭐', '🔥', '💎'].map((emoji, i) => (
              <div 
                key={i}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-900 flex items-center justify-center text-lg shadow-md"
              >
                {emoji}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-sm font-medium text-slate-400">
              +12
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LearningDashboard;
