import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, Clock, TrendingUp, ArrowRight, BookOpen } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
  >
    <div className={`p-4 rounded-xl ${color} bg-opacity-10`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  </motion.div>
);

const CourseCard = ({ title, category, progress, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ scale: 1.03 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full"
  >
    <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center mb-4 text-white shadow-md`}>
      <BookOpen size={20} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 mb-4">{category}</p>
    
    <div className="mt-auto">
      <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: delay + 0.2 }}
          className={`h-full rounded-full ${color}`} 
        />
      </div>
      <button className="w-full py-2 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group">
        Continue
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </motion.div>
);

const DashboardHome = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, Student! 👋</h2>
        <p className="text-gray-500 mt-2">Here's what's happening with your job applications today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Jobs Applied" value="12" icon={Briefcase} color="bg-blue-600" delay={0.1} />
        <StatCard title="Interviews" value="3" icon={Clock} color="bg-orange-500" delay={0.2} />
        <StatCard title="Offers" value="1" icon={CheckCircle} color="bg-green-500" delay={0.3} />
        <StatCard title="Profile Views" value="48" icon={TrendingUp} color="bg-purple-600" delay={0.4} />
      </div>

      {/* Recommended Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recommended Courses</h3>
          <button className="text-blue-600 font-medium text-sm hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CourseCard title="Data Structures & Algorithms" category="Technical Interview" progress={65} color="bg-indigo-500" delay={0.5} />
          <CourseCard title="System Design Fundamentals" category="Architecture" progress={30} color="bg-pink-500" delay={0.6} />
          <CourseCard title="React.js Advanced Patterns" category="Frontend Development" progress={10} color="bg-cyan-500" delay={0.7} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;