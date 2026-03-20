import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Briefcase, BookOpen, LogOut, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from './axiosInstance';

const EmployeeLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    axiosInstance.get('/admin/pending').then(r => setPendingCount(r.data.length)).catch(() => { });
  }, []);

  const navItems = [
    { path: '/employee', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/employee/users', label: 'Manage Users', icon: Users },
    { path: '/employee/jobs', label: 'Manage Jobs', icon: Briefcase },
    { path: '/employee/courses', label: 'Course Builder', icon: BookOpen },
    { path: '/employee/pending', label: 'Pending Approvals', icon: Clock, badge: pendingCount },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-700">
          <div className="flex items-center gap-2 text-emerald-400">
            <LayoutDashboard size={28} />
            <span className="text-xl font-bold tracking-tight text-white">Employee<span className="text-emerald-500">Panel</span></span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <Link key={item.path} to={item.path} className="relative block">
                {isActive && (
                  <motion.div
                    layoutId="admin-active-pill"
                    className="absolute inset-0 bg-emerald-600 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto bg-amber-400 text-slate-900 text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-gray-800">
            {navItems.find(i => i.path === location.pathname)?.label || 'Employee Dashboard'}
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'Employee'}</p>
              <p className="text-xs text-gray-500">{user?.course || 'HR & Recruitment'}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white">
              {(user?.name?.[0] || 'E').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8 flex flex-col">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <Outlet />
          </motion.div>

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} CampusRecruit Employee Portal. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;