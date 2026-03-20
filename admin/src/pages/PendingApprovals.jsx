import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Toast = ({ message, type, onDone }) => {
    useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
    return (
        <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
            {type === 'success' ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />} {message}
        </motion.div>
    );
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return 'Just now';
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const PendingApprovals = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    useEffect(() => {
        fetch('/api/admin/pending', { credentials: 'include' })
            .then(r => r.json()).then(setPending).catch(() => showToast('Failed to load', 'error'))
            .finally(() => setLoading(false));
    }, []);

    const handleApprove = async (user) => {
        setActionLoading(p => ({ ...p, [user._id]: 'approving' }));
        try {
            await fetch(`/api/admin/users/${user._id}/approve`, { method: 'PUT', credentials: 'include' });
            setPending(prev => prev.filter(u => u._id !== user._id));
            showToast(`✅ ${user.name} approved!`);
        } catch { showToast('Failed to approve', 'error'); }
        finally { setActionLoading(p => { const n = { ...p }; delete n[user._id]; return n; }); }
    };

    const handleReject = async (user) => {
        setActionLoading(p => ({ ...p, [user._id]: 'rejecting' }));
        try {
            await fetch(`/api/admin/users/${user._id}/reject`, { method: 'DELETE', credentials: 'include' });
            setPending(prev => prev.filter(u => u._id !== user._id));
            showToast(`${user.name}'s request rejected`);
        } catch { showToast('Failed to reject', 'error'); }
        finally { setActionLoading(p => { const n = { ...p }; delete n[user._id]; return n; }); }
    };

    return (
        <div className="space-y-6 w-full">
            <AnimatePresence>
                {toast && <Toast key="toast" {...toast} onDone={() => setToast(null)} />}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Clock size={22} className="text-amber-400" /> Pending Approvals
                    </h2>
                    <p className="text-white/30 text-sm mt-1">
                        {loading ? 'Loading...' : `${pending.length} employee${pending.length !== 1 ? 's' : ''} awaiting approval`}
                    </p>
                </div>
                {!loading && pending.length > 0 && (
                    <span className="bg-amber-400/15 border border-amber-400/20 text-amber-400 text-sm font-bold px-3 py-1.5 rounded-full animate-pulse">
                        {pending.length} Pending
                    </span>
                )}
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-400" /></div>
            ) : pending.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-2xl p-16 text-center">
                    <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                        <CheckCircle size={28} className="text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">All caught up!</h3>
                    <p className="text-white/30 text-sm">No pending employee registration requests.</p>
                </motion.div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                    {pending.map(user => (
                        <motion.div key={user._id} variants={cardVariants} layout
                            className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                            style={{ borderColor: 'rgba(251,191,36,0.12)' }}>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-amber-400 text-lg font-bold border border-amber-400/15 flex-shrink-0">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-white">{user.name}</h3>
                                    <span className="text-xs bg-amber-400/10 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-400/15">Pending</span>
                                </div>
                                <p className="text-sm text-white/40">{user.email}</p>
                                <p className="text-xs text-white/20 mt-0.5">Requested {timeAgo(user.createdAt)}</p>
                            </div>
                            <div className="flex gap-2.5 flex-shrink-0">
                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleApprove(user)} disabled={!!actionLoading[user._id]}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 text-sm font-bold rounded-xl disabled:opacity-50">
                                    {actionLoading[user._id] === 'approving' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                    Approve
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleReject(user)} disabled={!!actionLoading[user._id]}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 text-sm font-bold rounded-xl disabled:opacity-50">
                                    {actionLoading[user._id] === 'rejecting' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
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
