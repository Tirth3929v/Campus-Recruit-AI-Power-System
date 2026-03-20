import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Calendar, TrendingUp, ArrowUpRight, Clock, CheckCircle, XCircle, Eye, Plus, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Reveal = ({ children, delay = 0, direction = "up", className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    const dirs = { up: { y: 60 }, down: { y: -60 }, left: { x: -80 }, right: { x: 80 } };
    return (
        <motion.div ref={ref} className={className}
            initial={{ opacity: 0, ...dirs[direction], scale: 0.95, filter: "blur(8px)" }}
            animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
};

const AnimatedCounter = ({ value, suffix = "", duration = 1800 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    useEffect(() => {
        if (!isInView) return;
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(num)) { setCount(value); return; }
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const e = 1 - Math.pow(1 - p, 4);
            setCount(Number.isInteger(num) ? Math.round(num * e) : parseFloat((num * e).toFixed(1)));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [isInView, value, duration]);
    return <span ref={ref}>{typeof value === 'number' ? count : value}{typeof value === 'number' ? suffix : ''}</span>;
};

const iconMap = { Briefcase, Users, Calendar, TrendingUp };

const statusColors = {
    pending: "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20",
    applied: "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20",
    reviewed: "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    shortlisted: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    rejected: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
    hired: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
};

// Helper: time ago
function timeAgo(date) {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

const CompanyDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { document.title = "Company Dashboard | CampusHire"; }, []);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:5000/api/company/dashboard', { credentials: 'include' });
                if (res.ok) {
                    setDashboardData(await res.json());
                }
            } catch (err) {
                console.error('Failed to fetch company dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const stats = dashboardData?.stats || [];
    const recentApplications = dashboardData?.recentApplications || [];
    const activeJobs = dashboardData?.activeJobs || [];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
        );
    }

    return (
        <div className="relative min-h-full">
            <div className="ambient-bg" />

            <div className="relative z-10 space-y-5">
                {/* ── Hero ──────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="relative overflow-hidden rounded-3xl glass-panel p-8">
                        <motion.div animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-br from-amber-600/15 via-orange-600/10 to-red-600/5"
                            style={{ backgroundSize: "200% 200%" }} />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <motion.h1 initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    Welcome, <span className="text-gradient-vivid">{user?.name || 'Company'}</span>
                                </motion.h1>
                                <motion.p initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                    className="text-gray-500 dark:text-gray-400">
                                    Manage your job postings and find the best campus talent.
                                </motion.p>
                            </div>
                            <motion.button
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                whileHover={{ scale: 1.05, boxShadow: "0 15px 40px rgba(245, 158, 11, 0.3)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/company/jobs')}
                                className="btn-gradient px-6 py-3 rounded-xl font-bold flex items-center gap-2 flex-shrink-0"
                            >
                                <Plus size={20} /> Post New Job
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* ── Stat Cards ─────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.map((stat, i) => {
                        const Icon = iconMap[stat.icon] || Briefcase;
                        return (
                            <Reveal key={i} delay={0.1 * i}>
                                <motion.div whileHover={{ y: -6, scale: 1.02 }}
                                    className="glass-card-interactive rounded-2xl p-5 group cursor-pointer">
                                    <div className="flex justify-between items-start mb-3">
                                        <motion.div whileHover={{ rotate: 15, scale: 1.2 }}
                                            className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                            <Icon size={20} />
                                        </motion.div>
                                        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                            className={`h-7 w-7 rounded-full bg-gradient-to-br ${stat.accent} blur-sm`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix || ""} />
                                    </h3>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }}
                                        transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                                        className={`mt-3 h-1 rounded-full bg-gradient-to-r ${stat.accent} opacity-60`} />
                                </motion.div>
                            </Reveal>
                        );
                    })}
                </div>

                {/* ── Bento Grid ──────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* Recent Applications */}
                    <Reveal direction="left" className="lg:col-span-7">
                        <div className="glass-card rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users size={18} className="text-amber-600 dark:text-amber-400" /> Recent Applications
                                </h3>
                                <motion.button whileHover={{ x: 4 }} onClick={() => navigate('/company/applicants')}
                                    className="text-xs font-bold text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors uppercase tracking-wider flex items-center gap-1">
                                    View All <ArrowUpRight size={12} />
                                </motion.button>
                            </div>
                            <div className="space-y-2.5">
                                {recentApplications.length === 0 && (
                                    <p className="text-center text-gray-400 py-8">No applications yet</p>
                                )}
                                {recentApplications.map((app, i) => (
                                    <motion.div key={app.id}
                                        initial={{ opacity: 0, x: -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                        whileHover={{ scale: 1.01, x: 6 }}
                                        className="flex items-center justify-between p-3 rounded-xl glass-card group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
                                                {app.avatar}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{app.name}</h4>
                                                <p className="text-[11px] text-gray-500">{app.role} · {timeAgo(app.date)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusColors[app.status] || statusColors.pending}`}>
                                                {app.status}
                                            </span>
                                            <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                <Eye size={14} className="text-gray-400" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    {/* Active Job Postings */}
                    <Reveal direction="right" className="lg:col-span-5">
                        <div className="glass-card rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Briefcase size={18} className="text-orange-600 dark:text-orange-400" /> Active Postings
                                </h3>
                                <motion.button whileHover={{ x: 4 }} onClick={() => navigate('/company/jobs')}
                                    className="text-xs font-bold text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors uppercase tracking-wider flex items-center gap-1">
                                    Manage <ArrowUpRight size={12} />
                                </motion.button>
                            </div>
                            <div className="space-y-3">
                                {activeJobs.length === 0 && (
                                    <p className="text-center text-gray-400 py-8">No active job postings</p>
                                )}
                                {activeJobs.map((job, i) => (
                                    <motion.div key={job.id}
                                        initial={{ opacity: 0, x: 40 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                        whileHover={{ scale: 1.02, x: -4 }}
                                        className="p-4 rounded-xl glass-card group cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{job.title}</h4>
                                                <p className="text-[11px] text-gray-500 mt-0.5">Posted {timeAgo(job.posted)}</p>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Users size={12} /> {job.applicants} applicants</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(job.posted)}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;
