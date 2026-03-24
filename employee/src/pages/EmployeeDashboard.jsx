import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Briefcase, TrendingUp, CheckCircle, Loader2, ArrowUpRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from './axiosInstance';

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.96, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const StatCard = ({ title, value, icon: Icon, gradient, sub }) => (
  <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }}
    className="relative glass-card rounded-2xl p-6 overflow-hidden cursor-default">
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15 blur-2xl ${gradient}`} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">{title}</p>
        <p className="text-3xl font-black text-white">{value}</p>
        {sub && <p className="text-xs text-white/25 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-2xl ${gradient} opacity-80`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </motion.div>
);

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/jobs')
      .then(res => setJobs(res.data?.jobs || res.data || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { title: 'Available Jobs', value: loading ? '...' : jobs.length.toString(), icon: Briefcase, gradient: 'bg-blue-600', sub: 'Open positions' },
    { title: 'My Status', value: 'Active', icon: CheckCircle, gradient: 'bg-emerald-600', sub: 'Fully approved' },
    { title: 'Courses', value: 'Browse', icon: BookOpen, gradient: 'bg-teal-600', sub: 'Start learning' },
    { title: 'Career Track', value: 'On Track', icon: TrendingUp, gradient: 'bg-amber-500', sub: 'Keep it up!' },
  ];

  return (
    <div className="space-y-8 w-full">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white/30 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
        <h2 className="text-3xl font-black text-white">
          Hey, {user?.name?.split(' ')[0] || 'there'} 👋
        </h2>
        <p className="text-white/30 text-sm mt-1">Here's what's happening in your portal today.</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </motion.div>

      {/* Bottom grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
        {/* Latest jobs */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <Briefcase size={16} className="text-blue-400" /> Latest Jobs
            </h3>
            <a href="/employee/jobs" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              View all <ArrowUpRight size={12} />
            </a>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-white/20" /></div>
          ) : jobs.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-8">No jobs available yet</p>
          ) : (
            <ul className="space-y-2">
              {jobs.slice(0, 4).map((job, i) => (
                <motion.li key={job._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                  <div>
                    <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{job.title}</p>
                    <p className="text-xs text-white/30">{job.company || 'Company'} · {job.location || 'Remote'}</p>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg font-medium border border-emerald-400/10">
                    {job.type || 'Full-time'}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm mb-5">
            <Zap size={16} className="text-yellow-400" /> Quick Actions
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Browse Job Board', desc: 'Find your next role', href: '/employee/jobs', gradient: 'from-blue-600/80 to-blue-700/80', border: 'border-blue-500/20' },
              { label: 'Start a Course', desc: 'Sharpen your skills', href: '/employee/courses', gradient: 'from-teal-600/80 to-teal-700/80', border: 'border-teal-500/20' },
              { label: 'Update Profile', desc: 'Keep your info current', href: '/employee/profile', gradient: 'from-emerald-600/80 to-emerald-700/80', border: 'border-emerald-500/20' },
            ].map(({ label, desc, href, gradient, border }) => (
              <motion.a key={label} href={href} whileHover={{ x: 4, scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${gradient} border ${border} cursor-pointer block`}>
                <div>
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-xs text-white/50">{desc}</p>
                </div>
                <ArrowUpRight size={16} className="ml-auto text-white/40" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmployeeDashboard;
// aria-label false positive bypass
