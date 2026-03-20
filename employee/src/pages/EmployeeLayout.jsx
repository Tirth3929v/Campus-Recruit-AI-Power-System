import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, Briefcase, User, LogOut, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

const EmployeeLayout = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/employee', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/employee/jobs', label: 'Job Board', icon: Briefcase },
        { path: '/employee/courses', label: 'Courses', icon: BookOpen },
        { path: '/employee/notifications/send', label: 'Send Notification', icon: Bell },
        { path: '/employee/profile', label: 'My Profile', icon: User },
    ];

    const currentPage = navItems.find(i =>
        i.exact ? location.pathname === i.path : location.pathname.startsWith(i.path)
    );

    return (
        <div className="flex h-screen bg-[#060D12] text-white font-sans overflow-hidden relative">
            <div className="ambient-bg" />

            {/* ─── Sidebar ─── */}
            <aside className="relative z-30 w-60 flex flex-col h-full flex-shrink-0"
                style={{ background: 'rgba(6,13,18,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
                {/* Logo */}
                <div className="h-16 flex items-center px-5 border-b border-white/5 gap-3 flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <Briefcase size={15} className="text-white" />
                    </div>
                    <span className="text-base font-bold tracking-tight">
                        Campus<span className="text-emerald-400">Recruit</span>
                    </span>
                </div>

                {/* User chip */}
                <div className="px-4 pt-5 pb-2">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md">
                            {(user?.name?.[0] || 'E').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Employee'}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                <span className="text-[10px] text-emerald-400/70">Approved Member</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-3 mb-2">Menu</p>
                    {navItems.map((item) => {
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link key={item.path} to={item.path}>
                                <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
                                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${isActive
                                        ? 'text-emerald-400 border border-emerald-500/20'
                                        : 'text-white/35 hover:text-white/70 hover:bg-white/5'
                                        }`}
                                    style={isActive ? { background: 'rgba(16,185,129,0.08)' } : {}}>
                                    {isActive && (
                                        <motion.div layoutId="emp-pill"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-400 rounded-full"
                                            transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
                                    )}
                                    <Icon size={17} className="flex-shrink-0" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign Out */}
                <div className="p-3 border-t border-white/5 flex-shrink-0">
                    <button onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 w-full text-white/25 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ─── Content ─── */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 flex-shrink-0"
                    style={{ background: 'rgba(6,13,18,0.8)', backdropFilter: 'blur(20px)' }}>
                    <div className="flex items-center gap-2 text-white/30 text-sm">
                        <ChevronRight size={14} />
                        <span className="text-white font-semibold">{currentPage?.label || 'Dashboard'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/25">
                        <NotificationBell basePath="/employee" />
                        <div>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    </div>
                </header>

                {/* Page */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div key={location.pathname}
                            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default EmployeeLayout;
