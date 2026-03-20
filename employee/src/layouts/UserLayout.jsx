import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Briefcase, BookOpen, Bot, User, LogOut, Menu, Bell, ChevronDown, Sun, Moon, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const UserLayout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const navItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/jobs', label: 'Job Portal', icon: Briefcase },
    { path: '/student/courses', label: 'Skill Center', icon: BookOpen },
    { path: '/student/interview', label: 'AI Interview Room', icon: Bot },
    { path: '/student/profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-slate-900 text-white flex flex-col shadow-2xl z-30 fixed h-full"
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3 text-emerald-400 overflow-hidden">
            <LayoutDashboard size={28} className="min-w-[28px]" />
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-xl font-bold tracking-tight text-white whitespace-nowrap"
              >
                Campus<span className="text-emerald-500">Recruit</span>
              </motion.span>
            )}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} to={item.path} className="relative block group">
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-emerald-600 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <Icon size={24} className="min-w-[24px]" />
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>
                {!isSidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-4 px-3 py-3 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <LogOut size={24} className="min-w-[24px]" />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Wrapper */}
      <motion.div 
        initial={false}
        animate={{ marginLeft: isSidebarOpen ? 256 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col h-full overflow-hidden relative"
      >
        
        {/* Glassmorphism Navbar */}
        <header className="h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-300">
              <Menu size={24} />
            </button>
            
            <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/student/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Student</Link>
              {location.pathname.split('/').filter(x => x && x !== 'student').map((name, index, array) => {
                const to = `/student/${array.slice(0, index + 1).join('/')}`;
                const isLast = index === array.length - 1;
                return (
                  <React.Fragment key={name}>
                    <ChevronRight size={16} />
                    {isLast ? (
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">{name.replace('-', ' ')}</span>
                    ) : (
                      <Link to={to} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors capitalize">{name.replace('-', ' ')}</Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-6">
             <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <button className="relative p-2 hover:bg-gray-100 rounded-full text-gray-500">
               <Bell size={20} />
               <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             
             <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
                <div className="text-right hidden sm:block">
                   <p className="text-sm font-semibold text-gray-800 dark:text-white">Tirth</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Student • BCA (2026)</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white cursor-pointer">
                  T
                </div>
                <ChevronDown size={16} className="text-gray-400 cursor-pointer" />
             </div>
          </div>
        </header>

        {/* Page Content with Transitions */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-slate-950 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};

export default UserLayout;
