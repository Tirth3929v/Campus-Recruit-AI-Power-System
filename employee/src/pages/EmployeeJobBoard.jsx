import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Search, Loader2, Building2, Send, Eye, X, Clock, CheckCircle } from 'lucide-react';
import axiosInstance from './axiosInstance';

const typeColors = {
    'Full-time': 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    'Internship': 'bg-teal-500/15 text-teal-400 border border-teal-500/20',
    'Part-time': 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    'Contract': 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
};

const statusColors = {
    pending: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
    'employee_review': 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    'admin_review': 'bg-teal-500/15 text-teal-400 border border-teal-500/20',
    approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    rejected: 'bg-red-500/15 text-red-400 border border-red-500/20',
};


const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const EmployeeJobBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ESC key close modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setShowModal(false);
            }
        };
        if (showModal) {
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }
    }, [showModal]);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            // Fetch both: jobs assigned to this employee + all pending jobs in the queue
            const userRes = await axiosInstance.get('/currentuser');
            const userId = userRes.data._id;
            const [assignedRes, pendingRes] = await Promise.all([
                axiosInstance.get(`/jobs/employee/${userId}`),
                axiosInstance.get('/jobs/employee/pending')
            ]);
            // Merge, deduplicate by _id
            const merged = [...(pendingRes.data || []), ...(assignedRes.data || [])];
            const seen = new Set();
            const unique = merged.filter(j => {
                if (seen.has(j._id)) return false;
                seen.add(j._id);
                return true;
            });
            setJobs(unique);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (job) => {
        setSelectedJob(job);
        setShowModal(true);
    };

    const handleSubmitToAdmin = async () => {
        if (!selectedJob) return;
        setSubmitting(true);
        try {
            // Check if job can be submitted
            if (!['pending', 'employee_review'].includes(selectedJob.status)) {
                alert(`Cannot submit job in '${selectedJob.status}' status. Only pending or employee_review jobs can be submitted.`);
                setSubmitting(false);
                return;
            }

            // If job is still pending (not yet assigned), claim it first
            if (selectedJob.status === 'pending') {
                await axiosInstance.put(`/jobs/${selectedJob._id}/assign`);
            }
            
            const res = await axiosInstance.put(`/jobs/${selectedJob._id}/submit-to-admin`, {
                employeeNotes: notes
            });
            
            if (res.data.success) {
                alert('Job submitted to admin for review!');
                setShowModal(false);
                setNotes('');
                fetchJobs();
            }
        } catch (err) {
            console.error('Error submitting:', err);
            const errorMsg = err.response?.data?.message || 'Failed to submit job';
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = jobs.filter(j => {
        const matchSearch = j.title?.toLowerCase().includes(search.toLowerCase()) ||
            j.company?.toLowerCase().includes(search.toLowerCase()) ||
            j.location?.toLowerCase().includes(search.toLowerCase());
        
        // Status filter
        const matchStatus = statusFilter === 'all' || j.status === statusFilter;
        return matchSearch && matchStatus;
    });


    return (
        <div className="space-y-6 w-full">
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Briefcase size={22} className="text-blue-400" /> Job Reviews
                </h2>
                <p className="text-white/30 text-sm mt-1">{jobs.length} jobs assigned to you</p>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mt-4 bg-white/5 rounded-xl p-2 border border-white/10">
                    {['all', 'pending', 'employee_review', 'admin_review', 'approved', 'rejected'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                statusFilter === filter
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {filter === 'all' ? 'All' : filter.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>
            </motion.div>


            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input aria-label="Input field"  value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, companies, locations..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <motion.div key={search} variants={containerVariants} initial="hidden" animate="show"
                        className="grid gap-4 md:grid-cols-2">
                        {filtered.length === 0 ? (
                            <div className="col-span-2 text-center py-20 text-white/20">
                                <Briefcase size={38} className="mx-auto mb-3 opacity-30" />
                                <p>No jobs assigned to you</p>
                            </div>
                        ) : filtered.map((job, idx) => (
                            <motion.div key={job._id || idx} variants={cardVariants} whileHover={{ y: -4 }}
                                className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
                                        <Building2 size={18} className="text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white">{job.title}</h3>
                                        <p className="text-sm text-white/40">{job.company || 'Company'}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${typeColors[job.type] || 'bg-white/10 text-white/40'}`}>
                                        {job.type || 'Full-time'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${statusColors[job.status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/20'}`}>
                                        <Clock size={10} />
                                        {job.status === 'pending' && 'Pending Review'}
                                        {job.status === 'employee_review' && 'In Review'}
                                        {job.status === 'admin_review' && 'Admin Review'}
                                        {job.status === 'approved' && '✅ Approved'}
                                        {job.status === 'rejected' && '❌ Rejected'}
                                    </span>
                                    {job.department && (
                                        <span className="text-[10px] text-white/40 px-2 py-1">
                                            Dept: {job.department}
                                        </span>
                                    )}
                                </div>


                                {job.description && <p className="text-sm text-white/30 line-clamp-2">{job.description}</p>}
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {job.location && (
                                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-white/35 border border-white/8">
                                            <MapPin size={10} />{job.location}
                                        </span>
                                    )}
                                    {job.salary && (
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/15">
                                            {job.salary}
                                        </span>
                                    )}
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => handleView(job)}
                                    className={`mt-1 w-full py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 ${
                                        ['approved', 'rejected'].includes(job.status.toLowerCase())
                                            ? 'bg-transparent border-2 border-gray-500 text-gray-300 hover:border-gray-400 hover:bg-gray-800/50'
                                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-indigo-500/25 text-white'
                                    }`}
                                    style={{ boxShadow: ['approved', 'rejected'].includes(job.status.toLowerCase()) ? 'none' : '0 4px 16px rgba(99,102,241,0.25)' }}>
                                    <Eye size={13} />
                                    {['approved', 'rejected'].includes(job.status.toLowerCase()) ? 'View Details' : 'Review Job'}
                                </motion.button>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Job Details Modal */}
            <AnimatePresence>
                {showModal && selectedJob && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 22, stiffness: 300 }}
                            className="w-full max-w-2xl bg-[#0f172a] rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
                                <h3 className="text-xl font-bold text-white">Job Details</h3>
                                <button 
                                    onClick={() => setShowModal(false)} 
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X size={20} className="text-white/70 hover:text-white" />
                                </button>
                            </div>

                            {/* Job Info */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-lg font-bold text-white">{selectedJob.title}</h4>
                                    <p className="text-sm text-white/60">{selectedJob.company}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div className="flex items-center gap-2 text-sm text-white/50">
                                        <MapPin size={16} className="text-blue-400 flex-shrink-0" />
                                        <span>{selectedJob.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold">
                                        <span>{selectedJob.salary}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${typeColors[selectedJob.type] || 'bg-white/10 text-white/40 border border-white/20'}`}>
                                        {selectedJob.type}
                                    </span>
                                    {selectedJob.department && (
                                        <span className="text-sm text-white/60 font-medium">
                                            {selectedJob.department}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="bg-white/5 rounded-xl p-3 mt-4">
                                    <h5 className="text-sm font-bold text-white mb-2">Description</h5>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedJob.description}</p>
                                </div>

                                {/* Requirements */}
                                {selectedJob.tags?.length > 0 && (
                                    <div>
                                        <h5 className="text-sm font-bold text-white/80 mb-2">Requirements</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.tags.map((tag, i) => (
                                                <span key={i} className="text-xs bg-blue-500/15 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes Input - Only for pending/employee_review */}
                                {['approved', 'rejected'].includes(selectedJob.status.toLowerCase()) ? null : (
                                    <div className="pt-4 border-t border-white/10">
                                        <h5 className="text-sm font-bold text-white/80 mb-3">Add Notes / Confirmation</h5>
                                        <textarea
                                            rows="3"
                                            placeholder="Add your review notes, confirmation details, or any feedback for admin..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:ring-2 focus:ring-green-500 outline-none resize-none"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6">
                                {['approved', 'rejected'].includes(selectedJob.status.toLowerCase()) ? (
                                    <motion.button
                                        onClick={() => setShowModal(false)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3 rounded-xl bg-gray-600 hover:bg-gray-500 font-semibold text-white flex items-center justify-center gap-2"
                                    >
                                        <X size={18} />
                                        Close
                                    </motion.button>
                                ) : (
                                    <>
                                        {['pending', 'employee_review'].includes(selectedJob.status) ? (
                                            <motion.button
                                                onClick={handleSubmitToAdmin}
                                                disabled={submitting}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={18} />
                                                        Submit to Admin for Review
                                                    </>
                                                )}
                                            </motion.button>
                                        ) : (
                                            <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 font-semibold text-white/40 flex items-center justify-center gap-2">
                                                <CheckCircle size={18} />
                                                {selectedJob.status === 'admin_review' && 'Already Submitted to Admin'}
                                                {selectedJob.status === 'approved' && 'Job Already Approved'}
                                                {selectedJob.status === 'rejected' && 'Job Rejected'}
                                                {!['admin_review', 'approved', 'rejected'].includes(selectedJob.status) && 'Cannot Submit'}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeJobBoard;
