import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Search, Loader2, Building2, CheckCircle, XCircle, Clock, User, Send, X } from 'lucide-react';

const typeColors = {
    'Full-time': 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    'Internship': 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    'Part-time': 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    'Contract': 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const AdminJobApproval = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/jobs/admin/pending', {
                credentials: 'include',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.ok) {
                setJobs(await res.json());
            }
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

    const handleApprove = async () => {
        if (!selectedJob) return;
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/jobs/${selectedJob._id}/approve`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                alert('Job approved successfully!');
                setShowModal(false);
                fetchJobs();
            }
        } catch (err) {
            console.error('Error approving job:', err);
            alert('Failed to approve job');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedJob || !rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/jobs/${selectedJob._id}/reject`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ rejectionReason })
            });
            if (res.ok) {
                alert('Job rejected!');
                setShowModal(false);
                setRejectionReason('');
                fetchJobs();
            }
        } catch (err) {
            console.error('Error rejecting job:', err);
            alert('Failed to reject job');
        } finally {
            setProcessing(false);
        }
    };

    const openRejectModal = () => {
        setModalType('reject');
    };

    const openApproveModal = () => {
        setModalType('approve');
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
        setRejectionReason('');
    };

    const filtered = jobs.filter(j => {
        const matchSearch = j.title?.toLowerCase().includes(search.toLowerCase()) ||
            j.company?.toLowerCase().includes(search.toLowerCase()) ||
            j.location?.toLowerCase().includes(search.toLowerCase());
        return matchSearch;
    });

    return (
        <div className="space-y-6 w-full">
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Briefcase size={22} className="text-emerald-500" /> Job Approvals
                </h2>
                <p className="text-gray-500 text-sm mt-1">{jobs.length} jobs awaiting review</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, companies, locations..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 bg-white border border-gray-200" />
                </div>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-emerald-500" /></div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <motion.div key={search} variants={containerVariants} initial="hidden" animate="show"
                        className="grid gap-4 md:grid-cols-2">
                        {filtered.length === 0 ? (
                            <div className="col-span-2 text-center py-20 text-gray-400">
                                <Briefcase size={38} className="mx-auto mb-3 opacity-30" />
                                <p>No jobs awaiting approval</p>
                            </div>
                        ) : filtered.map((job, idx) => (
                            <motion.div key={job._id || idx} variants={cardVariants} whileHover={{ y: -4 }}
                                className="bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-gray-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                                        <Building2 size={18} className="text-emerald-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800">{job.title}</h3>
                                        <p className="text-sm text-gray-500">{job.company || 'Company'}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${typeColors[job.type] || 'bg-gray-100 text-gray-600'}`}>
                                        {job.type || 'Full-time'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 bg-purple-500/15 text-purple-500 border border-purple-500/20">
                                        <Clock size={10} />
                                        Awaiting Review
                                    </span>
                                    {job.department && (
                                        <span className="text-[10px] text-gray-400 px-2 py-1">
                                            Dept: {job.department}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                    {job.location && (
                                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                                            <MapPin size={10} />{job.location}
                                        </span>
                                    )}
                                    {job.salary && (
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-100">
                                            {job.salary}
                                        </span>
                                    )}
                                </div>

                                {job.assignedEmployeeName && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <User size={12} />
                                        Assigned to: {job.assignedEmployeeName}
                                    </div>
                                )}

                                <div className="flex gap-2 mt-2">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => handleView(job)}
                                        className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 bg-gray-800">
                                        <Briefcase size={13} /> View Details
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Job Details Modal */}
            <AnimatePresence>
                {showModal && selectedJob && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={closeModal}>
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 40 }}
                            transition={{ type: "spring", damping: 22, stiffness: 300 }}
                            className="bg-white rounded-2xl p-7 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl"
                            onClick={(e) => e.stopPropagation()}>

                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-xl font-bold text-gray-800">Job Review</h3>
                                <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800">{selectedJob.title}</h4>
                                    <p className="text-sm text-gray-500">{selectedJob.company}</p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin size={12} /> {selectedJob.location}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {selectedJob.salary}
                                    </span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColors[selectedJob.type] || 'bg-gray-100 text-gray-600'}`}>
                                        {selectedJob.type}
                                    </span>
                                    {selectedJob.department && (
                                        <span className="text-xs text-gray-500">
                                            Dept: {selectedJob.department}
                                        </span>
                                    )}
                                </div>

                                {selectedJob.assignedEmployeeName && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                                        <User size={14} />
                                        Submitted by Employee: {selectedJob.assignedEmployeeName}
                                    </div>
                                )}

                                <div>
                                    <h5 className="text-sm font-bold text-gray-700 mb-2">Description</h5>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedJob.description}</p>
                                </div>

                                {selectedJob.tags?.length > 0 && (
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-700 mb-2">Requirements</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.tags.map((tag, i) => (
                                                <span key={i} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedJob.employeeNotes && (
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-700 mb-2">Employee Notes</h5>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedJob.employeeNotes}</p>
                                    </div>
                                )}

                                {modalType === 'reject' && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <h5 className="text-sm font-bold text-gray-700 mb-2">Rejection Reason</h5>
                                        <textarea
                                            rows="3"
                                            placeholder="Please provide a reason for rejection..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                {modalType === 'approve' ? (
                                    <>
                                        <button
                                            onClick={closeModal}
                                            className="flex-1 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <motion.button
                                            onClick={handleApprove}
                                            disabled={processing}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 bg-emerald-500 text-white hover:bg-emerald-600"
                                        >
                                            <CheckCircle size={16} />
                                            {processing ? 'Approving...' : 'Approve Job'}
                                        </motion.button>
                                    </>
                                ) : modalType === 'reject' ? (
                                    <>
                                        <button
                                            onClick={() => setModalType('')}
                                            className="flex-1 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <motion.button
                                            onClick={handleReject}
                                            disabled={processing || !rejectionReason.trim()}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 bg-red-500 text-white hover:bg-red-600"
                                        >
                                            <XCircle size={16} />
                                            {processing ? 'Rejecting...' : 'Confirm Rejection'}
                                        </motion.button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={openRejectModal}
                                            className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50"
                                        >
                                            <XCircle size={16} /> Reject
                                        </button>
                                        <motion.button
                                            onClick={openApproveModal}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
                                        >
                                            <CheckCircle size={16} /> Approve
                                        </motion.button>
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

export default AdminJobApproval;
