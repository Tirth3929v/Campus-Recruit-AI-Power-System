import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, CheckCircle, AlertTriangle, Send, Loader2, User, Building2, Users } from 'lucide-react';
import axiosInstance from './axiosInstance';

const Toast = ({ message, type, onDone }) => {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [onDone]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white font-semibold text-sm ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}
        >
            {type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {message}
        </motion.div>
    );
};

const SendNotification = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [toast, setToast] = useState(null);
    const [isBroadcast, setIsBroadcast] = useState(false);

    const [targetRole, setTargetRole] = useState('student');

    const searchTimeout = useRef(null);

    const handleSearch = (e, roleOverride = targetRole) => {
        const q = e.target.value;
        setSearchQuery(q);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (q.length < 2) {
            setSearchResults([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await axiosInstance.get(`/notifications/users-list?q=${q}&role=${roleOverride}`);
                setSearchResults(res.data);
            } catch (err) {
                console.error('Search error', err);
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };

    const handleSend = async (e) => {
        e.preventDefault();

        if (isBroadcast) {
            if (!title || !message) {
                setToast({ message: 'Please fill all fields', type: 'error' });
                return;
            }
        } else {
            if (!selectedRecipient || !title || !message) {
                setToast({ message: 'Please fill all fields', type: 'error' });
                return;
            }
        }

        setIsSending(true);
        try {
            if (isBroadcast) {
                await axiosInstance.post('/notifications/broadcast', {
                    targetRole,
                    title,
                    message
                });
            } else {
                await axiosInstance.post('/notifications/send', {
                    recipientId: selectedRecipient._id,
                    title,
                    message
                });
            }

            setToast({ message: isBroadcast ? `Broadcast sent to all ${targetRole}s!` : 'Notification sent successfully!', type: 'success' });

            // Reset form
            setSearchQuery('');
            setSearchResults([]);
            setSelectedRecipient(null);
            setTitle('');
            setMessage('');
            setIsBroadcast(false);
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Failed to send notification', type: 'error' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full space-y-8">
            <AnimatePresence>
                {toast && <Toast key="toast" message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Bell size={24} className="text-emerald-400" /> Send Notification
                </h2>
                <p className="text-white/40 text-sm mt-1">Send a direct message to a student or company</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-[#0A121A] border border-white/5 rounded-2xl p-6 sm:p-8 relative">
                <form onSubmit={handleSend} className="space-y-6">

                    {/* Recipient Selection */}
                    <div className="space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-semibold text-white/70 ml-1">Select Recipient</label>
                                <button
                                    type="button"
                                    onClick={() => { setIsBroadcast(!isBroadcast); setSelectedRecipient(null); setSearchQuery(''); setSearchResults([]); }}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${isBroadcast ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-[#060D12] text-white/40 border-white/10 hover:text-white/70'}`}
                                >
                                    <Users size={14} /> Send to All
                                </button>
                            </div>
                            {/* Role Filter Tabs (Employees can only target students & companies usually, but we'll show both) */}
                            <div className="flex bg-[#0A121A] border border-white/10 rounded-lg p-1">
                                {['student', 'company'].map(role => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => {
                                            setTargetRole(role);
                                            setSearchResults([]);
                                            setSelectedRecipient(null);
                                            if (searchQuery.length > 1 && !isBroadcast) {
                                                handleSearch({ target: { value: searchQuery } }, role);
                                            }
                                        }}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${targetRole === role ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40 hover:text-white/70'}`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isBroadcast ? (
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-center text-center">
                                <p className="text-indigo-300 text-sm font-medium">
                                    <AlertTriangle size={16} className="inline mr-2 -mt-0.5" />
                                    This will send a notification to <strong>every {targetRole}</strong> in the system.
                                </p>
                            </div>
                        ) : !selectedRecipient ? (
                            <div className="relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    type="text"
                                    placeholder={`Search for a ${targetRole}...`}
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e, targetRole)}
                                    className="w-full bg-[#060D12] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-white/20"
                                />
                                {isSearching && (
                                    <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 animate-spin" />
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 pl-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        {selectedRecipient.role === 'company' ? <Building2 size={14} className="text-emerald-400" /> : <User size={14} className="text-emerald-400" />}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-semibold">{selectedRecipient.name}</p>
                                        <p className="text-white/40 text-xs">{selectedRecipient.email}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => { setSelectedRecipient(null); setSearchQuery(''); }} className="text-xs text-red-400 hover:text-red-300 px-3 transition-colors">
                                    Change
                                </button>
                            </div>
                        )}

                        {/* Search Dropdown */}
                        {searchResults.length > 0 && !selectedRecipient && !isBroadcast && (
                            <div className="absolute z-10 w-full mt-2 bg-[#0A121A] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                                {searchResults.map(user => (
                                    <button
                                        key={user._id}
                                        type="button"
                                        onClick={() => { setSelectedRecipient(user); setSearchResults([]); }}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                            {user.role === 'company' ? <Building2 size={14} className="text-emerald-400" /> : <User size={14} className="text-emerald-400" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                            <p className="text-xs text-white/40 truncate">{user.email}</p>
                                        </div>
                                        <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/60">
                                            {user.role}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/70 ml-1">Notification Title</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Account Approved, Profile Missing Details..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-[#060D12] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-white/20"
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/70 ml-1">Message Body</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Write the notification detail here..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full bg-[#060D12] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-white/20 resize-none custom-scrollbar"
                        />
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSending || (!selectedRecipient && !isBroadcast)}
                            className={`w-full py-3.5 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${isBroadcast ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 shadow-indigo-500/20' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20'}`}
                        >
                            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            {isSending ? 'Sending...' : (isBroadcast ? `Broadcast to All ${targetRole}s` : 'Send Notification')}
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
};

export default SendNotification;
