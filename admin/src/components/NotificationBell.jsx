import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NotificationBell = ({ basePath = '' }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?._id) return;

        // Fetch initial via API
        fetchNotifications();

        // Connect socket
        const socket = io('/', {
            withCredentials: true
        });

        socket.on('connect', () => {
            socket.emit('join_room', { userId: user._id, role: user.role });
        });

        socket.on('new_notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Optional: Show native browser notification or toast here
        });

        return () => socket.disconnect();
    }, [user?._id]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/notifications', { 
                credentials: 'include',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        const token = localStorage.getItem('adminToken');
        try {
            await fetch(`/api/notifications/${id}/read`, { 
                method: 'PUT', 
                credentials: 'include',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            await fetch('/api/notifications/read-all', { 
                method: 'PUT', 
                credentials: 'include',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
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
        <div className="relative z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-500 dark:text-gray-400 transition-colors"
            >
                <Bell size={18} />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1 right-1 h-3.5 w-3.5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 text-[9px] font-bold text-white shadow-sm"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-gray-400">
                                    <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">You're all caught up!</p>
                                </div>
                            ) : (
                                notifications.slice(0, 10).map(n => (
                                    <div
                                        key={n._id}
                                        className={`p-4 border-b border-gray-100 dark:border-slate-800/60 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 ${!n.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(n.type)}`}>
                                            <Bell size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm truncate pr-2 ${!n.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                                    {n.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className={`text-xs line-clamp-2 ${!n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                                                {n.message}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <button
                                                onClick={(e) => markAsRead(n._id, e)}
                                                className="mt-1 h-5 w-5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center text-blue-500 transition-colors"
                                                title="Mark read"
                                            >
                                                <Check size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-2 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <button
                                onClick={() => { setIsOpen(false); navigate(`${basePath}/notifications`); }}
                                className="w-full py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                View all notifications <ExternalLink size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
