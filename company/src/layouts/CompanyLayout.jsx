import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Briefcase, Users, Building2, LogOut, Menu, Bell, Sun, Moon, ChevronRight, Flame, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

const CompanyLayout = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('companySidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('companySidebarOpen', JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    const navItems = [
        { path: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/company/jobs', label: 'Job Postings', icon: Briefcase },
        { path: '/company/applicants', label: 'Applicants', icon: Users },
        { path: '/company/courses', label: 'Courses', icon: BookOpen },
        { path: '/company/profile', label: 'Company Profile', icon: Building2 },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0B0F19] font-sans text-gray-900 dark:text-white overflow-hidden">

            {/* ═══ Sidebar ══════════════════════════════════════════ */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 260 : 80 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-slate-900 text-white flex flex-col shadow-2xl z-30 h-full flex-shrink-0 overflow-hidden relative"
            >
                {/* Ambient gradient */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-30%] w-[80%] h-[40%] rounded-full bg-amber-600/10 blur-[80px] animate-float" />
                    <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[30%] rounded-full bg-orange-600/10 blur-[60px] animate-float" style={{ animationDelay: '-4s' }} />
                </div>

                {/* ── Brand ──────────────────────────────────── */}
                <div className="h-20 flex items-center px-5 border-b border-slate-800/80 relative z-10">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <motion.div whileHover={{ rotate: 10, scale: 1.1 }}
                            className="h-10 w-10 min-w-[40px] rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Flame size={20} className="text-white" />
                        </motion.div>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-xl font-bold tracking-tight text-white whitespace-nowrap overflow-hidden"
                                >
                                    Campus<span className="text-amber-400">Hire</span>
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Navigation ─────────────────────────────── */}
                <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link key={item.path} to={item.path} className="relative block group">
                                {isActive && (
                                    <motion.div
                                        layoutId="company-active-pill"
                                        className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl shadow-lg shadow-amber-500/20"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${isActive
                                    ? 'text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                    }`}>
                                    <Icon size={22} className="min-w-[22px]" />
                                    <AnimatePresence>
                                        {isSidebarOpen && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="font-medium whitespace-nowrap overflow-hidden text-sm"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {!isSidebarOpen && (
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity duration-200">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Logout ─────────────────────────────────── */}
                <div className="p-3 border-t border-slate-800/80 relative z-10">
                    <button onClick={logout}
                        className="flex items-center gap-3 px-3 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group">
                        <LogOut size={22} className="min-w-[22px] group-hover:animate-pulse" />
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-medium text-sm">
                                    Sign Out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>

            {/* ═══ Main Content ════════════════════════════════════ */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* ── Top Navbar ──────────────────────────────── */}
                <header className="h-16 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-b border-gray-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 z-20 sticky top-0">
                    <div className="flex items-center gap-3">
                        <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-500 dark:text-gray-400 transition-colors">
                            <Menu size={20} />
                        </motion.button>
                        <nav className="hidden md:flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
                            <Link to="/company/dashboard" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">Company</Link>
                            {location.pathname.split('/').filter(x => x && x !== 'company').map((name, index, array) => {
                                const to = `/company/${array.slice(0, index + 1).join('/')}`;
                                const isLast = index === array.length - 1;
                                return (
                                    <React.Fragment key={name}>
                                        <ChevronRight size={14} />
                                        {isLast ? (
                                            <span className="font-semibold text-gray-900 dark:text-white capitalize">{name.replace('-', ' ')}</span>
                                        ) : (
                                            <Link to={to} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors capitalize font-medium">{name.replace('-', ' ')}</Link>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <motion.button whileTap={{ scale: 0.9, rotate: 180 }} onClick={toggleTheme}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-500 dark:text-gray-400 transition-all">
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </motion.button>

                        <NotificationBell basePath="/company" />

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.name || 'Company'}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">Recruiter</p>
                            </div>
                            <motion.div whileHover={{ scale: 1.1 }}
                                className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white dark:ring-slate-800 cursor-pointer text-sm">
                                {(user?.name?.[0] || 'C').toUpperCase()}
                            </motion.div>
                        </div>
                    </div>
                </header>

                {/* ── Page Content ────────────────────────────── */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-[#0B0F19] p-4 lg:p-5 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-7xl mx-auto"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default CompanyLayout;
