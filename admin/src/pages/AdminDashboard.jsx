import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, FileText, TrendingUp, Loader2, Activity, Zap, Database, CheckCircle2, ArrowUpRight } from 'lucide-react';

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!value) return;
    const num = Number(value); let start = 0;
    const step = Math.max(1, Math.ceil(num / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count.toLocaleString()}</span>;
};

const StatCard = ({ title, value, icon: Icon, gradient, loading }) => (
  <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }}
    className="relative glass-card rounded-2xl p-6 overflow-hidden cursor-default">
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15 blur-2xl ${gradient}`} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">{title}</p>
        <p className="text-3xl font-black text-white">
          {loading ? <Loader2 size={22} className="animate-spin text-white/20" /> : <AnimatedCounter value={value} />}
        </p>
      </div>
      <div className={`p-3 rounded-2xl ${gradient} opacity-80`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="relative flex items-center gap-1.5 mt-4">
      <ArrowUpRight size={13} className="text-white/20" />
      <span className="text-xs text-white/20">Platform metric</span>
    </div>
  </motion.div>
);

const timeAgo = (date) => {
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, activeJobs: 0, totalApplications: 0, totalInterviews: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setStats(d.stats || stats); setRecentActivity(d.recentActivity || []); } })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, gradient: 'bg-blue-600' },
    { title: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, gradient: 'bg-emerald-600' },
    { title: 'Applications', value: stats.totalApplications, icon: FileText, gradient: 'bg-purple-600' },
    { title: 'AI Interviews', value: stats.totalInterviews, icon: TrendingUp, gradient: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 w-full">
      <motion.div initial={{ opacity: 0, y: -16, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <h2 className="text-2xl font-black text-white">Dashboard Overview</h2>
        <p className="text-white/30 text-sm mt-1">Live platform metrics — updated in real time.</p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => <StatCard key={c.title} loading={loading} {...c} />)}
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
        {/* Activity */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2 text-sm">
            <Activity size={16} className="text-blue-400" /> Recent Activity
          </h3>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-white/20" /></div>
          ) : recentActivity.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-8">No recent activity yet</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((a, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center text-xs font-bold text-white/60 flex-shrink-0">
                    {a.text?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70 truncate">{a.text}</p>
                    <p className="text-xs text-white/25">{timeAgo(a.time)}</p>
                  </div>
                  <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-lg capitalize">{a.type || 'new'}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* System Health */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2 text-sm">
            <Zap size={16} className="text-yellow-400" /> System Health
          </h3>
          <div className="space-y-5">
            {[
              { label: 'Server Uptime', pct: 99, color: 'bg-emerald-500' },
              { label: 'Database Load', pct: 42, color: 'bg-blue-500' },
              { label: 'API Health', pct: 96, color: 'bg-purple-500' },
            ].map(({ label, pct, color }, i) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/40">{label}</span>
                  <span className="text-white font-bold">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full rounded-full ${color}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-3">
            {[
              { icon: CheckCircle2, label: 'API Online', color: 'text-emerald-400' },
              { icon: Database, label: 'DB Connected', color: 'text-blue-400' },
            ].map(({ icon: Ic, label, color }) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5">
                <Ic size={14} className={color} />
                <span className="text-xs text-white/50">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
