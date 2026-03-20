import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, Clock, LogOut,
  ShieldCheck, Menu, X, ChevronRight, Bell, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch('/api/admin/pending', { credentials: 'include' })
      .then(r => r.json()).then(d => setPendingCount(d.length)).catch(() => { });
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'Manage Users', icon: Users },
    { path: '/jobs', label: 'Manage Jobs', icon: Briefcase },
    { path: '/notifications/send', label: 'Send Notification', icon: Bell },
    { path: '/pending', label: 'Pending Approvals', icon: Clock, badge: pendingCount },
    { path: '/courses', label: 'Manage Courses', icon: BookOpen },
  ];

  const currentPage = navItems.find(i =>
    i.path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(i.path)
  );

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
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
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
            <span className="text-white font-semibold">{currentPage?.label || 'Dashboard'}</span>
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

export default AdminLayout;