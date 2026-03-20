import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Users, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import axiosInstance from './axiosInstance';

const Toast = ({ message, type, onDone }) => {
    useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}
        >
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {message}
        </motion.div>
    );
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const PendingApprovals = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    useEffect(() => { fetchPending(); }, []);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/admin/pending');
            setPending(res.data);
        } catch {
            showToast('Failed to load pending requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (user) => {
        setActionLoading(p => ({ ...p, [user._id]: 'approving' }));
        try {
            await axiosInstance.put(`/admin/users/${user._id}/approve`);
            setPending(prev => prev.filter(u => u._id !== user._id));
            showToast(`✅ ${user.name} has been approved!`);
        } catch {
            showToast('Failed to approve user', 'error');
        } finally {
            setActionLoading(p => { const n = { ...p }; delete n[user._id]; return n; });
        }
    };

    const handleReject = async (user) => {
        setActionLoading(p => ({ ...p, [user._id]: 'rejecting' }));
        try {
            await axiosInstance.delete(`/admin/users/${user._id}/reject`);
            setPending(prev => prev.filter(u => u._id !== user._id));
            showToast(`${user.name}'s request was rejected`);
        } catch {
            showToast('Failed to reject user', 'error');
        } finally {
            setActionLoading(p => { const n = { ...p }; delete n[user._id]; return n; });
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const m = Math.floor(seconds / 60);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {toast && <Toast key="toast" {...toast} onDone={() => setToast(null)} />}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={22} className="text-amber-500" /> Pending Approvals
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {loading ? 'Loading...' : `${pending.length} employee${pending.length !== 1 ? 's' : ''} awaiting approval`}
                    </p>
                </div>
                {!loading && pending.length > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1.5 rounded-full animate-pulse">
                        {pending.length} Pending
                    </span>
                )}
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 size={32} className="animate-spin text-amber-500" />
                </div>
            ) : pending.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={30} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">All caught up!</h3>
                    <p className="text-gray-400 text-sm">No pending employee registration requests.</p>
                </motion.div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                    {pending.map(user => (
                        <motion.div key={user._id} variants={cardVariants} layout
                            className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                        >
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-bold text-gray-900">{user.name}</h3>
                                    <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Pending</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                {user.course && <p className="text-xs text-gray-400 mt-0.5">Department: {user.course}</p>}
                                <p className="text-xs text-gray-300 mt-1">Requested {timeAgo(user.createdAt)}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 flex-shrink-0">
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleApprove(user)}
                                    disabled={!!actionLoading[user._id]}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60"
                                >
                                    {actionLoading[user._id] === 'approving'
                                        ? <Loader2 size={15} className="animate-spin" />
                                        : <CheckCircle size={15} />}
                                    Approve
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleReject(user)}
                                    disabled={!!actionLoading[user._id]}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors disabled:opacity-60"
                                >
                                    {actionLoading[user._id] === 'rejecting'
                                        ? <Loader2 size={15} className="animate-spin" />
                                        : <XCircle size={15} />}
                                    Reject
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default PendingApprovals;
