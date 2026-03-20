import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, FileText, TrendingUp, Loader2, Activity, CheckCircle2, Database, Zap } from 'lucide-react';
import axiosInstance from './axiosInstance';

// ─── Animation Variants ──────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Animated Number  ──────────────────────────────────────────
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (!end) return;
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
};

// ─── Stat Card ──────────────────────────────────────────
const StatCard = ({ title, count, icon: Icon, gradient, loading, delay = 0 }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ hover: { duration: 0.2 } }}
    className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 cursor-default"
  >
    {/* Ambient glow */}
    <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10 blur-2xl ${gradient}`} />

    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay + 0.2, duration: 0.5, ease: 'backOut' }}
      className={`p-4 rounded-2xl ${gradient} shadow-lg flex-shrink-0`}
    >
      <Icon size={22} className="text-white" />
    </motion.div>

    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-black text-gray-900">
        {loading ? <Loader2 size={22} className="animate-spin text-gray-400" /> : <AnimatedNumber value={count} />}
      </p>
    </div>
  </motion.div>
);

// ─── System Status Bar ───────────────────────────────────────────
const StatusBar = ({ label, percent, color, loading, delay = 0 }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm text-gray-600">{label}</span>
      <motion.span
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}
        className={`text-sm font-semibold ${color}`}
      >
        {percent}%
      </motion.span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: loading ? '0%' : `${percent}%` }}
        transition={{ delay: delay + 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className={`h-2 rounded-full ${color.replace('text-', 'bg-')}`}
      />
    </div>
  </div>
);

// ─── Activity Badge ───────────────────────────────────────────
const typeBadge = {
  registration: 'bg-blue-50 text-blue-600',
  application: 'bg-purple-50 text-purple-600',
  interview: 'bg-orange-50 text-orange-600',
};

const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// ─── Main Component ───────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, activeJobs: 0, totalApplications: 0, totalInterviews: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/admin/dashboard');
        setStats(res.data.stats);
        setRecentActivity(res.data.recentActivity || []);
      } catch (err) {
        console.error('Failed to fetch admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const cards = [
    { title: 'Total Users', count: stats.totalUsers, icon: Users, gradient: 'bg-gradient-to-br from-blue-500 to-blue-700', delay: 0 },
    { title: 'Active Jobs', count: stats.activeJobs, icon: Briefcase, gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700', delay: 0.1 },
    { title: 'Applications', count: stats.totalApplications, icon: FileText, gradient: 'bg-gradient-to-br from-purple-500 to-purple-700', delay: 0.2 },
    { title: 'AI Interviews', count: stats.totalInterviews, icon: TrendingUp, gradient: 'bg-gradient-to-br from-orange-400 to-orange-600', delay: 0.3 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-black text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-400 mt-1 text-sm">Welcome back, Admin. Live metrics from your platform.</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {cards.map(c => (
          <StatCard key={c.title} loading={loading} {...c} />
        ))}
      </motion.div>

      {/* Bottom Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 gap-5"
      >
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Activity size={17} className="text-blue-500" /> Recent Activity
          </h3>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={28} className="animate-spin text-blue-400" />
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No recent activity</p>
          ) : (
            <motion.ul variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
              {recentActivity.map((activity, i) => (
                <motion.li
                  key={activity.id || i}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {activity.text?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{activity.text}</p>
                      <p className="text-xs text-gray-400">{timeAgo(activity.time)}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${typeBadge[activity.type] || 'bg-gray-50 text-gray-500'}`}>
                    {activity.type || 'new'}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>

        {/* System Status */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Zap size={17} className="text-yellow-500" /> System Status
          </h3>
          <div className="space-y-5">
            <StatusBar label="Server Uptime" percent={99} color="text-emerald-500" loading={loading} delay={0.3} />
            <StatusBar label="Database Load" percent={42} color="text-blue-500" loading={loading} delay={0.5} />
            <StatusBar label="API Response Health" percent={96} color="text-purple-500" loading={loading} delay={0.7} />
          </div>

          <div className="mt-6 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3">
            {[
              { icon: CheckCircle2, label: 'API Online', color: 'text-emerald-500' },
              { icon: Database, label: 'DB Connected', color: 'text-blue-500' },
            ].map(({ icon: Ic, label, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5"
              >
                <Ic size={15} className={color} />
                <span className="text-xs font-semibold text-gray-700">{label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;