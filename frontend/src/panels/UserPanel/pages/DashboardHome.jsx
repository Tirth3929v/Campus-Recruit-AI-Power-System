import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Clock, CheckCircle, ArrowRight, Code, Terminal } from 'lucide-react';

const StatCard = ({ title, count, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4"
  >
    <div className={`p-4 rounded-xl ${color} bg-opacity-10`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{count}</p>
    </div>
  </motion.div>
);

const CourseCard = ({ title, level, color, icon: Icon }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-full relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`} />
    
    <div>
      <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-4 text-${color.split('-')[1]}-600`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{title}</h3>
      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-md font-medium">{level}</span>
    </div>
    
    <button className="mt-6 w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
      Start Now <ArrowRight size={16} />
    </button>
  </motion.div>
);

const DashboardHome = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h2>
        <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your job search today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Jobs Applied" count="12" icon={Briefcase} color="bg-blue-600" />
        <StatCard title="Pending Interviews" count="3" icon={Clock} color="bg-orange-500" />
        <StatCard title="Courses Completed" count="5" icon={CheckCircle} color="bg-green-600" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended for You</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard 
            title="Advanced React Patterns" 
            level="Advanced" 
            color="bg-blue-500" 
            icon={Code}
          />
          <CourseCard 
            title="Full Stack MERN Bootcamp" 
            level="Intermediate" 
            color="bg-indigo-500" 
            icon={Terminal}
          />
          <CourseCard 
            title="Data Structures & Algorithms" 
            level="Hard" 
            color="bg-purple-500" 
            icon={Code}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;