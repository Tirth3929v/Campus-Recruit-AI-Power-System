import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, Clock, LogOut,
  ShieldCheck, Menu, X, ChevronRight, Bell, BookOpen,
  Kanban, BarChart2, UserCheck, Send, Sparkles,
  FileText, Code2, Image, ChevronDown, CheckSquare, Award, DollarSign, ClipboardList, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

// ── Role-based nav config ────────────────────────────────────
const ADMIN_NAV = (pendingCount, pendingCoursesCount) => [
  { path: '/dashboard',          label: 'Dashboard',        icon: LayoutDashboard },
  { path: '/users',              label: 'Manage Users',     icon: Users },
  { path: '/jobs',               label: 'Manage Jobs',      icon: Briefcase },
  { path: '/pending',            label: 'Pending Approvals',icon: Clock,    badge: pendingCount },
  { path: '/courses',            label: 'Manage Courses',   icon: BookOpen, badge: pendingCoursesCount },
  { path: '/course-updates',     label: 'Course Updates',   icon: CheckSquare },
  { path: '/interview-scores',   label: 'Interview Scores', icon: Award },
  { path: '/revenue',            label: 'Revenue Analytics',icon: DollarSign },
  { path: '/tasks',              label: 'Task Manager',     icon: ClipboardList },
  { path: '/skill-analytics',    label: 'Skill Analytics',  icon: BarChart2 },
  { path: '/notifications/send', label: 'Send Notification',icon: Send },
  {
    label: 'AI Assistant',
    icon: Sparkles,
    isDropdown: true,
    children: [
      { path: '/ai/text',  label: 'Text Generator',  icon: FileText },
      { path: '/ai/code',  label: 'Code Generator',  icon: Code2 },
    ],
  },
];

const EMPLOYEE_NAV = () => [
  { path: '/dashboard',          label: 'Dashboard',        icon: LayoutDashboard },
  { path: '/jobs',               label: 'Job Board',        icon: Briefcase },
  { path: '/tasks',              label: 'Task Manager',     icon: ClipboardList },
  { path: '/courses',            label: 'Courses',          icon: BookOpen },
  { path: '/notifications/send', label: 'Send Notification',icon: Send },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingCoursesCount, setPendingCoursesCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);

  // Strictly trust the User context role (Fixes the sidebar switching glitch)
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    const token = localStorage.getItem('adminToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // Fetch pending user registrations
    fetch('/api/admin/pending', { credentials: 'include', headers })
      .then(r => r.json()).then(d => setPendingCount(Array.isArray(d) ? d.length : 0)).catch(() => {});
    // Fetch pending courses for approval
    fetch('/api/courses/admin/pending', { credentials: 'include', headers })
      .then(r => r.json()).then(d => setPendingCoursesCount(Array.isArray(d) ? d.length : 0)).catch(() => {});
  }, [isAdmin]);

  const navItems = isAdmin ? ADMIN_NAV(pendingCount, pendingCoursesCount) : EMPLOYEE_NAV();

  const currentPage = navItems.find(i => {
    if (i.isDropdown) return i.children?.some(c => location.pathname.startsWith(c.path));
    return i.path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(i.path);
  });

  const currentLabel = (() => {
    for (const item of navItems) {
      if (item.isDropdown) {
        const child = item.children?.find(c => location.pathname.startsWith(c.path));
        if (child) return child.label;
      } else if (item.path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.path)) {
        return item.label;
      }
    }
    return 'Dashboard';
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#080C16] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#080C16] text-white font-sans overflow-hidden relative">
      {/* Ambient background */}
      <div className="ambient-bg" />

      {/* ─── Sidebar ─── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 flex flex-col h-full flex-shrink-0"
        style={{ background: 'rgba(8,12,22,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/5 flex-shrink-0 gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                className="text-base font-bold tracking-tight whitespace-nowrap overflow-hidden">
                Campus<span className="text-blue-400">Admin</span>
              </motion.span>
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => setSidebarOpen(p => !p)}
            className="ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            {sidebarOpen ? <X size={16} className="text-white/50" /> : <Menu size={16} className="text-white/50" />}
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            if (item.isDropdown) {
              const isAnyChildActive = item.children.some(c => location.pathname.startsWith(c.path));
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
                    onClick={() => sidebarOpen ? setAiOpen(p => !p) : null}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${
                      isAnyChildActive
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                    }`}>
                    <Icon size={18} className="flex-shrink-0" />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-sm font-medium whitespace-nowrap flex-1">{item.label}</motion.span>
                      )}
                    </AnimatePresence>
                    {sidebarOpen && (
                      <motion.div animate={{ rotate: aiOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={14} className="text-white/30" />
                      </motion.div>
                    )}
                  </motion.div>

                  <AnimatePresence>
                    {aiOpen && sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-3 mt-1 space-y-1 border-l border-white/8 pl-3"
                      >
                        {item.children.map(child => {
                          const CIcon = child.icon;
                          const isActive = location.pathname.startsWith(child.path);
                          return (
                            <Link key={child.path} to={child.path}>
                              <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                                  isActive
                                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20'
                                    : 'text-white/35 hover:text-white/70 hover:bg-white/5'
                                }`}>
                                <CIcon size={15} className="flex-shrink-0" />
                                <span className="font-medium">{child.label}</span>
                              </motion.div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const isActive = item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                    }`}>

                  <Icon size={18} className="flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-sm font-medium whitespace-nowrap flex-1">{item.label}</motion.span>
                    )}
                  </AnimatePresence>
                  {item.badge > 0 && sidebarOpen && (
                    <span className="bg-amber-400 text-slate-900 text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {item.badge > 0 && !sidebarOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-900 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/5 space-y-2 flex-shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {(user?.name?.[0] || 'A').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-white/30 truncate">Administrator</p>
              </div>
            </div>
          )}
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium">
            <LogOut size={17} className="flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* ─── Content ─── */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 flex-shrink-0"
          style={{ background: 'rgba(8,12,22,0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <ChevronRight size={14} />
            <span className="text-white font-semibold">{currentLabel}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <NotificationBell basePath="/admin" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>System Online</span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar" style={{ display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;