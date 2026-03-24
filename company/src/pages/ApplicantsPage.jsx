import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Search, Filter, Eye, CheckCircle, XCircle, Clock, Star, Mail, FileText, X, Loader2 } from 'lucide-react';
import axiosInstance from './axiosInstance';

const Reveal = ({ children, delay = 0, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });
    return (
        <motion.div ref={ref} className={className}
            initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
};

const statusConfig = {
    pending: { color: "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20", icon: Clock },
    reviewed: { color: "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20", icon: Eye },
    shortlisted: { color: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20", icon: CheckCircle },
    rejected: { color: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20", icon: XCircle },
};

const ResumeModal = ({ resumeData, onClose }) => {
    if (!resumeData) return null;
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden relative"
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FileText size={20} className="text-amber-500" />
                        {resumeData.name}
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-black p-2 overflow-hidden">
                    {resumeData.url ? (
                        <iframe
                            src={resumeData.url}
                            title="Resume Viewer"
                            className="w-full h-full rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner bg-white"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <FileText size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
                            <p>Preview not available</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const ApplicantsPage = () => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingResume, setViewingResume] = useState(null);

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        try {
            const res = await axiosInstance.get('/company/applicants');
            setApplicants(res.data);
        } catch (error) {
            console.error('Failed to fetch applicants:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = applicants.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="relative min-h-full">
            <div className="ambient-bg" />
            <div className="relative z-10 space-y-5">

                <Reveal>
                    <div className="glass-panel rounded-2xl p-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                            <span className="text-gradient-vivid">Applicants</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">{applicants.length} total candidates</p>

                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative group flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                                <input type="text" placeholder="Search by name or role..." value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white text-sm" />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {['all', 'pending', 'reviewed', 'shortlisted', 'rejected'].map(status => (
                                    <motion.button key={status} whileTap={{ scale: 0.95 }}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${statusFilter === status
                                            ? 'btn-gradient text-white'
                                            : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                                            }`}>
                                        {status}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Applicant Cards */}
                <div className="space-y-3">
                    {filtered.map((applicant, i) => {
                        const StatusIcon = statusConfig[applicant.status]?.icon || Clock;
                        // Use _id first, fall back to id, then to index-based key
                        const uniqueKey = applicant._id || applicant.id || `applicant-${i}`;
                        return (
                            <Reveal key={uniqueKey} delay={i * 0.06}>
                                <motion.div whileHover={{ scale: 1.005, x: 4 }}
                                    className="glass-card-interactive rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer">
                                    <div className="flex items-center gap-4 flex-1">
                                        <motion.div whileHover={{ rotate: 5, scale: 1.1 }}
                                            className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg flex-shrink-0">
                                            {applicant.name[0]}
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{applicant.name}</h3>
                                            <p className="text-xs text-gray-500">{applicant.role} · Applied {applicant.applied}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {applicant.skills.map((skill, si) => (
                                                    <span key={si} className="text-[10px] bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md font-medium">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Score */}
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${applicant.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : applicant.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {applicant.score}
                                            </div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Score</p>
                                        </div>

                                        {/* Status */}
                                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border capitalize flex items-center gap-1 ${statusConfig[applicant.status]?.color}`}>
                                            <StatusIcon size={10} /> {applicant.status}
                                        </span>

                                        {/* Actions */}
                                        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {applicant.resume ? (
                                                <a
                                                    href={applicant.resume}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 hover:bg-amber-100 dark:hover:bg-amber-500/10 rounded-lg transition-colors flex items-center justify-center"
                                                    title="View Resume"
                                                >
                                                    <FileText size={16} className="text-amber-600 dark:text-amber-400" />
                                                </a>
                                            ) : (
                                                <span className="p-2 rounded-lg opacity-30 cursor-not-allowed" title="No resume uploaded">
                                                    <FileText size={16} className="text-gray-400" />
                                                </span>
                                            )}
                                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Send Email">
                                                <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                                            </motion.button>
                                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" title="Shortlist">
                                                <Star size={16} className="text-emerald-600 dark:text-emerald-400" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            </Reveal>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <Reveal>
                        <div className="text-center py-16 glass-panel rounded-2xl">
                            <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 text-lg">No applicants match your criteria.</p>
                        </div>
                    </Reveal>
                )}
            </div>

            {viewingResume && <ResumeModal resumeData={viewingResume} onClose={() => setViewingResume(null)} />}
        </div>
    );
};

export default ApplicantsPage;
