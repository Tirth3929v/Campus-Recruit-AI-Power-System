import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Loader2, Info } from 'lucide-react';
import axiosInstance from './axiosInstance';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axiosInstance.get('/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axiosInstance.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const markAllRead = async () => {
        try {
            await axiosInstance.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'account_approval': return 'text-emerald-500 bg-emerald-500/10';
            case 'job_update': return 'text-blue-500 bg-blue-500/10';
            default: return 'text-amber-500 bg-amber-500/10';
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell size={22} className="text-emerald-600 dark:text-emerald-400" /> Notifications
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Stay updated on your journey</p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button onClick={markAllRead} className="text-sm font-medium px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        Mark all as read
                    </button>
                )}
            </motion.div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-emerald-500" />
                </div>
            ) : notifications.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Bell size={32} className="text-gray-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No notifications yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">We'll let you know when there's an update on your profile, jobs, or courses.</p>
                </motion.div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100 dark:divide-slate-800/60">
                        {notifications.map((notif, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={notif._id}
                                className={`p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/30 ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            >
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(notif.type)}`}>
                                    <Bell size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`text-base truncate ${!notif.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                            {notif.title}
                                        </h4>
                                        {!notif.isRead && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                                    </div>
                                    <p className={`text-sm ${!notif.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                                        {notif.message}
                                    </p>
                                    <div className="mt-2 text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wide">
                                        {new Date(notif.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </div>
                                {!notif.isRead && (
                                    <button
                                        onClick={() => markAsRead(notif._id)}
                                        className="h-9 w-9 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center text-blue-500 transition-colors flex-shrink-0 self-start sm:self-center"
                                        title="Mark as read"
                                    >
                                        <Check size={18} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
