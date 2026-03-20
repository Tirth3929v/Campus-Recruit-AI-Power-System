import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, Moon, Sun, BookOpen, 
  Bot, Briefcase, CreditCard, ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);

  // Mock data
  const streak = user?.currentStreak || 12;
  const progress = 90;

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300 font-sans`}>
      {/* Top Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-opacity-80 border-b border-gray-700/50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Campus Recruit
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Streak */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20 text-orange-400">
            <Flame size={18} className="fill-orange-500" />
            <span className="font-bold">{streak} Day Streak</span>
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-700/50 transition-colors">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Profile Dropdown */}
          <Link to="/student/profile" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <span className="hidden md:block font-medium">{user?.name || 'User'}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10 p-8 md:p-12"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 🚀
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl">
              You're making great progress. You are <span className="text-white font-bold">{progress}%</span> through <span className="text-purple-400">Advanced React Patterns</span>. Keep it up!
            </p>
            
            <div className="w-full max-w-md bg-gray-800/50 rounded-full h-3 mb-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              />
            </div>
            <p className="text-sm text-gray-400">Level 4 • 1200 XP</p>
          </div>
        </motion.div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickAccessCard to="/course/1" icon={<BookOpen size={24} className="text-blue-400" />} title="Continue Learning" desc="Resume your last lesson" color="bg-blue-500/10 border-blue-500/20" />
          <QuickAccessCard to="/interview" icon={<Bot size={24} className="text-purple-400" />} title="AI Interview Room" desc="Practice with AI Coach" color="bg-purple-500/10 border-purple-500/20" />
          <QuickAccessCard to="/jobs" icon={<Briefcase size={24} className="text-green-400" />} title="Job Portal" desc="Explore new opportunities" color="bg-green-500/10 border-green-500/20" />
          <QuickAccessCard to="/premium" icon={<CreditCard size={24} className="text-orange-400" />} title="Go Premium" desc="Unlock exclusive features" color="bg-orange-500/10 border-orange-500/20" />
        </div>
      </main>
    </div>
  );
};

const QuickAccessCard = ({ to, icon, title, desc, color }) => (
  <Link to={to}>
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`h-full p-6 rounded-2xl border backdrop-blur-sm transition-all cursor-pointer ${color} hover:bg-opacity-20`}
    >
      <div className="mb-4 p-3 bg-gray-900/30 rounded-xl w-fit">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-400 flex items-center gap-1">
        {desc} <ChevronRight size={14} />
      </p>
    </motion.div>
  </Link>
);

export default UserDashboard;