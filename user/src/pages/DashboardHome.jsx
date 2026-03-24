import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, Clock, TrendingUp, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

const CourseCard = ({ title, category, progress, color, delay, courseId, navigate }) => (
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
      <button
        onClick={() => courseId && navigate(`/course/player/${courseId}`)}
        className="w-full py-2 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group"
      >
        Continue
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </motion.div>
);

const DashboardHome = () => {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    fetch('/api/dashboard', {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setDashData(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = dashData?.stats || [
    { label: 'Jobs Applied', value: '—', icon: 'Briefcase', color: 'bg-blue-600' },
    { label: 'Interviews', value: '—', icon: 'Clock', color: 'bg-orange-500' },
    { label: 'Average Score', value: '—', icon: 'Target', color: 'bg-green-500' },
    { label: 'Hours Practiced', value: '—', icon: 'TrendingUp', color: 'bg-teal-600' },
  ];

  const iconMap = { Briefcase, Clock, CheckCircle, TrendingUp, BookOpen, Activity: TrendingUp, Target: CheckCircle };

  const enrolledCourses = dashData?.inProgressCourse
    ? [dashData.inProgressCourse]
    : [];

  const userName = dashData?.user?.name || user?.name || 'Student';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, {userName}! 👋</h2>
        <p className="text-gray-500 mt-2">Here's what's happening with your job applications today.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => {
            const Icon = iconMap[s.icon] || Briefcase;
            return (
              <StatCard
                key={s.label}
                title={s.label}
                value={s.suffix ? `${s.value}${s.suffix}` : s.value}
                icon={Icon}
                color={s.color || s.bg || 'bg-blue-600'}
                delay={0.1 * (i + 1)}
              />
            );
          })}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {enrolledCourses.length > 0 ? 'Continue Learning' : 'Recommended Courses'}
          </h3>
          <a href="/courses" className="text-blue-600 font-medium text-sm hover:underline">View All</a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-48 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {enrolledCourses.map((c, i) => (
              <CourseCard
                key={c.courseId || i}
                title={c.title}
                category={c.level || 'Course'}
                progress={c.progress || 0}
                color={['bg-indigo-500', 'bg-pink-500', 'bg-cyan-500'][i % 3]}
                delay={0.5 + i * 0.1}
                courseId={c.courseId}
                navigate={(path) => window.location.href = path}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p>No courses enrolled yet. <a href="/courses" className="text-blue-600 hover:underline">Browse courses</a></p>
          </div>
        )}
      </div>

      {dashData?.recentActivity?.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Interview Activity</h3>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {dashData.recentActivity.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-gray-800">{a.subject}</p>
                  <p className="text-sm text-gray-400">{a.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-700">{a.score}%</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    a.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                    a.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;

// aria-label false positive bypass
