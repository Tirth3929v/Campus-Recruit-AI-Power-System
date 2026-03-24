import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, Briefcase, DollarSign, Clock, ArrowUpRight, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import JobApplicationModal from '../components/JobApplicationModal';
import axiosInstance from './axiosInstance';

// ─── Toast ────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
    useEffect(() => {
        const t = setTimeout(onDone, 3500);
        return () => clearTimeout(t);
    }, [onDone]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}
        >
            {type === 'success' ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
            {message}
        </motion.div>
    );
};

// ─── Scroll Reveal ────────────────────────────────────────────
const Reveal = ({ children, delay = 0, className = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });
    return (
        <motion.div ref={ref} className={className}
            initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
            animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
};

// ─── Job Card ─────────────────────────────────────────────────
const JobCard = ({ job, index, onApplyClick, onApply, appliedIds }) => {
    const navigate = useNavigate();
    const alreadyApplied = appliedIds.has(job.id || job._id);
    
    const handleCardClick = () => {
        navigate(`/student/jobs/${job.id || job._id}`);
    };
    
    return (
        <Reveal delay={index * 0.08}>
            <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={handleCardClick}
                className="glass-card-interactive rounded-2xl p-6 group gradient-border h-full flex flex-col cursor-pointer"
            >
                <div className="flex justify-between items-start mb-4">
                    <motion.div whileHover={{ rotate: 5, scale: 1.1 }}
                        className={`h-12 w-12 rounded-xl ${job.color || 'bg-gradient-to-br from-emerald-500 to-teal-600'} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {job.logo || job.company?.charAt(0) || '?'}
                    </motion.div>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-white/10">
                        {job.posted}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{job.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">{job.company}</p>

                <div className="space-y-2 mb-5 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin size={14} className="text-gray-400 flex-shrink-0" /> {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <DollarSign size={14} className="text-gray-400 flex-shrink-0" /> {job.salary}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock size={14} className="text-gray-400 flex-shrink-0" /> {job.type}
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                    {(job.tags || []).map((tag, i) => (
                        <span key={i} className="text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-medium border border-emerald-100 dark:border-emerald-500/20">
                            {tag}
                        </span>
                    ))}
                </div>

                {alreadyApplied ? (
                    <div className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                        <CheckCircle2 size={15} /> Applied
                    </div>
                ) : (
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (typeof onApplyClick === 'function') {
                                onApplyClick(job);
                            } else if (typeof onApply === 'function') {
                                onApply(job);
                            } else {
                                console.error('ERROR: Neither onApplyClick nor onApply were passed to this card!');
                            }
                        }}
                        className="relative z-50 w-full py-3 rounded-xl btn-gradient font-bold flex items-center justify-center gap-2"
                    >
                        Apply Now <ArrowUpRight size={16} />
                    </motion.button>
                )}
            </motion.div>
        </Reveal>
    );
};

// ─── Page ─────────────────────────────────────────────────────
const JobsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [selectedJob, setSelectedJob] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [appliedIds, setAppliedIds] = useState(new Set());

    // Toast state
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => setToast({ message, type });

    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    const isLoggedIn = !!token;

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/jobs', { credentials: 'include' });
                if (res.ok) setJobs(await res.json() || []);
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
        
        // Fetch user's applied jobs if logged in
        if (isLoggedIn) {
            fetchAppliedJobs();
        }
    }, [isLoggedIn]);

    const fetchAppliedJobs = async () => {
        try {
            const res = await axiosInstance.get('/jobs/applications/my-applications');
            if (res.data) {
                const appliedJobIds = res.data.map(app => app.job?._id || app.job).filter(Boolean);
                setAppliedIds(new Set(appliedJobIds));
            }
        } catch (err) {
            console.error('Failed to fetch applied jobs:', err);
        }
    };

    const handleApplyClick = (job) => {
        console.log('Apply button clicked! Job data:', job);
        
        // Check if user is logged in
        if (!isLoggedIn) {
            showToast('Please login to apply for jobs', 'error');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
            return;
        }
        
        setSelectedJob(job);
    };

    const handleModalSubmit = async (coverLetter) => {
        if (!selectedJob) return;
        const jobId = selectedJob.id || selectedJob._id;
        setSubmitting(true);
        try {
            await axiosInstance.post(`/jobs/${jobId}/apply`, { coverLetter });
            setAppliedIds(prev => new Set([...prev, jobId]));
            setSelectedJob(null);
            showToast(`Application submitted for ${selectedJob.title}!`);
        } catch (err) {
            console.error('Application error:', err);
            console.error('Error response:', err.response?.data);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit application';
            showToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.company || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-full relative">
            <div className="ambient-bg" />

            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast key="toast" {...toast} onDone={() => setToast(null)} />}
            </AnimatePresence>

            {/* Application Modal */}
            <JobApplicationModal
                isOpen={!!selectedJob}
                onClose={() => !submitting && setSelectedJob(null)}
                onSubmit={handleModalSubmit}
                jobTitle={selectedJob?.title || ''}
                submitting={submitting}
            />

            <div className="relative z-10 space-y-8">
                {/* ── Header & Search ────────────────────────── */}
                <Reveal>
                    <div className="glass-panel rounded-2xl p-8">
                        <div className="mb-6">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Find Your <span className="text-gradient-vivid">Dream Job</span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Discover opportunities from top companies</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2 relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                <input type="text" placeholder="Search by job title or company..."
                                    className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="relative group">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                <input type="text" placeholder="Location"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white" />
                            </div>
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                className="btn-gradient px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
                                <Filter size={18} /> Filter
                            </motion.button>
                        </div>
                    </div>
                </Reveal>

                {/* ── Job Grid ───────────────────────────────── */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-teal-500" size={40} />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredJobs.map((job, index) => (
                                <JobCard
                                    key={job.id || job._id}
                                    job={job}
                                    index={index}
                                    onApplyClick={handleApplyClick}
                                    appliedIds={appliedIds}
                                />
                            ))}
                        </div>

                        {filteredJobs.length === 0 && (
                            <Reveal>
                                <div className="text-center py-20 glass-panel rounded-2xl">
                                    <Briefcase size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
                                </div>
                            </Reveal>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default JobsPage;
