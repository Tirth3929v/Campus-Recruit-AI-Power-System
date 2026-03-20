import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/jobs', label: 'Jobs' },
    { path: '/courses', label: 'Courses (Technical)' },
    { path: '/language', label: 'Language Prep' },
    { path: '/interview', label: 'AI Interview' },
    { path: '/profile', label: 'My Profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-gray-200 flex flex-col fixed md:relative z-20 h-full overflow-hidden"
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-100 min-w-[260px]">
          <span className="text-2xl font-bold text-blue-600">Campus</span>
          <span className="text-2xl font-bold text-gray-800">Recruit</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 min-w-[260px]">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <div className={`px-6 py-3 mx-4 rounded-lg mb-1 transition-all duration-200 ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}>
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-100 min-w-[260px]">
          <Link to="/about" className="text-sm text-gray-500 hover:text-blue-600">About Us</Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">Student User</p>
                <p className="text-xs text-gray-500">Computer Science</p>
             </div>
             <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
               SU
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;