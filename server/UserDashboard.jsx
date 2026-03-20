import React from 'react';
import { Play, Clock, Award, ArrowRight, Star, MoreHorizontal } from 'lucide-react';

const UserDashboard = () => {
  // Mock Data for BCA Students
  const lastCourse = {
    title: 'Advanced Node.js: Microservices',
    module: 'Building Scalable APIs',
    progress: 65,
    timeLeft: '45 min left',
    image: 'https://images.unsplash.com/photo-1627398242450-2701705d7e00?q=80&w=2670&auto=format&fit=crop'
  };

  const recommendedPaths = [
    {
      id: 1,
      title: 'MERN Stack Full Course',
      tags: ['Web Dev', 'Full Stack'],
      duration: '42h',
      rating: 4.9,
      color: 'from-blue-500 to-cyan-400',
      icon: '⚛️'
    },
    {
      id: 2,
      title: 'Python for Data Science',
      tags: ['Data', 'Python'],
      duration: '28h',
      rating: 4.8,
      color: 'from-yellow-500 to-orange-400',
      icon: '🐍'
    },
    {
      id: 3,
      title: 'PHP & MySQL Masterclass',
      tags: ['Backend', 'Legacy'],
      duration: '35h',
      rating: 4.7,
      color: 'from-indigo-500 to-purple-500',
      icon: '🐘'
    }
  ];

  return (
    <div className="space-y-10">
      
      {/* --- HERO SECTION: Resume Learning --- */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resume Learning</h1>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View History</button>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-100 dark:from-slate-800/50 to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row p-6 md:p-8 gap-8 items-center">
            {/* Thumbnail */}
            <div className="relative w-full md:w-64 aspect-video rounded-2xl overflow-hidden shadow-lg">
              <img src={lastCourse.image} alt="Course" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center pl-1 shadow-xl">
                  <Play size={24} className="text-slate-900 fill-slate-900" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase">In Progress</span>
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock size={12} /> {lastCourse.timeLeft}
                </span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">{lastCourse.title}</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{lastCourse.module}</p>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${lastCourse.progress}%` }}></div>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{lastCourse.progress}%</span>
              </div>

              <button className="mt-6 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                Continue Learning <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- GRID: Recommended Paths --- */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recommended Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedPaths.map((path) => (
            <div key={path.id} className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center text-2xl shadow-lg mb-4`}>
                {path.icon}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">{path.title}</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {path.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-md font-medium">{tag}</span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-gray-100 dark:border-slate-800">
                <span className="flex items-center gap-1"><Clock size={14} /> {path.duration}</span>
                <span className="flex items-center gap-1 text-amber-500"><Star size={14} className="fill-current" /> {path.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Additional Content Area (Video/Text Placeholder) --- */}
      <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Complete Your Daily Challenge</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Solve a quick coding problem to keep your streak alive and earn badges.</p>
          <button className="px-5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            Start Challenge
          </button>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;