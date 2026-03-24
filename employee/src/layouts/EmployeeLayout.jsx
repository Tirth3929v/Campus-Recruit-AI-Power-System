import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Calendar, Briefcase, LogOut, ClipboardCheck } from 'lucide-react';

const EmployeeLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/employee', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employee/candidates', label: 'Candidates', icon: Users },
    { path: '/employee/interviews', label: 'Interviews', icon: Calendar },
    { path: '/employee/jobs', label: 'My Jobs', icon: Briefcase },
    { path: '/employee/job-reviews', label: 'Job Reviews', icon: ClipboardCheck },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400">
            <Briefcase size={28} />
            <span className="text-xl font-bold tracking-tight text-white">Recruiter<span className="text-indigo-500">Panel</span></span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/employee' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link key={item.path} to={item.path} className="relative block">
                {isActive && (
                  <motion.div
                    layoutId="employee-active-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
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
            {navItems.find(i => i.path === location.pathname)?.label || 'Recruiter Dashboard'}
          </h1>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">Sarah Recruiter</p>
                <p className="text-xs text-gray-500">HR Manager</p>
             </div>
             <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white">
               SR
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8 flex flex-col">
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
              <p>&copy; {new Date().getFullYear()} CampusRecruit. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;