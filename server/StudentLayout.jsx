import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { 
  Search, Flame, Sun, Moon, Menu, X, 
  BookOpen, Code, Terminal, GraduationCap, 
  ChevronRight, Zap, Sparkles, Layers
} from 'lucide-react';

// --- Google AdSense Component ---
// NOTE: Ensure you add the AdSense script to your index.html head:
// <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID" crossorigin="anonymous"></script>
const GoogleAd = ({ slotId, style, format = 'auto', className }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className={`overflow-hidden bg-gray-100 dark:bg-slate-800 flex justify-center items-center ${className}`}>
      <ins className="adsbygoogle"
           style={style || { display: 'block' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" /* REPLACE WITH YOUR PUBLISHER ID */
           data-ad-slot={slotId}
           data-ad-format={format}
           data-full-width-responsive="true"></ins>
    </div>
  );
};

/**
 * StudentLayout - Modern Educational Platform Layout
 * Inspired by W3Schools with premium, modern aesthetic
 * 
 * Layout Structure:
 * - Top Navbar: Sticky with Logo, Search, Dark/Light toggle, Streak Fire, User Profile
 * - Left Sidebar (w-64): Learning navigation
 * - Center Content (flex-1): Main educational space with Ad Space 1
 * - Right Sidebar (w-72): Monetization Zone with Ad Space 2
 */
const StudentLayout = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [courseProgress, setCourseProgress] = useState(33); // Initial progress state

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Navigation links for learning paths
  const navLinks = [
    { title: 'Web Tutorials', icon: <BookOpen size={18} />, active: true, badge: 'Popular' },
    { title: 'React JS', icon: <Code size={18} />, active: false, badge: null },
    { title: 'Python for AI', icon: <Terminal size={18} />, active: false, badge: 'New' },
    { title: 'Interview Prep', icon: <GraduationCap size={18} />, active: false, badge: null },
  ];

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300`}>
      
      {/* ==================== TOP NAVBAR (Sticky) ==================== */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 lg:px-6 shadow-sm">
        
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Layers size={20} />
            </div>
            <span className="hidden md:block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 font-extrabold">
              CampusDev
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search tutorials, courses, or documentation..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-slate-900 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Streak Fire Icon */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm font-bold border border-orange-200 dark:border-orange-500/20 shadow-sm">
            <Flame size={16} className="fill-current animate-pulse" />
            <span>12</span>
          </div>

          {/* Dark/Light Mode Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-2.5 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors hover:scale-110"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Profile */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-lg">
            <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-950 flex items-center justify-center overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* ==================== MAIN CONTAINER ==================== */}
      <div className="flex pt-0 max-w-[1920px] mx-auto">
        
        {/* ==================== LEFT SIDEBAR (Navigation) ==================== */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] lg:overflow-y-auto ${mobileMenuOpen ? 'translate-x-0 top-16' : '-translate-x-full top-16'}`}>
          
          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Learning Path</p>
            {navLinks.map((link) => (
              <Link 
                key={link.title} 
                to="#" 
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${
                  link.active 
                    ? 'bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {link.icon}
                  <span>{link.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {link.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                      {link.badge}
                    </span>
                  )}
                  {link.active && <ChevronRight size={16} />}
                </div>
              </Link>
            ))}
          </div>

          {/* Premium Upgrade Card */}
          <div className="p-4 mt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white text-center hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 group">
              <Sparkles size={28} className="mx-auto mb-2 text-yellow-300 fill-yellow-300 animate-pulse" />
              <h3 className="font-bold text-lg mb-1">Go Premium</h3>
              <p className="text-xs text-indigo-100 mb-4">Remove ads & unlock advanced courses.</p>
              <button className="w-full py-2.5 bg-white text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-sm group-hover:shadow-md">
                Upgrade Now
              </button>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="p-4 border-t border-gray-100 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Progress</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">React JS</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">{courseProgress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: `${courseProgress}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Python for AI</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">42%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 w-[42%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ==================== CENTER CONTENT AREA ==================== */}
        <main className="flex-1 min-w-0 min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
          
          {/* ==================== AD SPACE 1: LEADERBOARD ==================== */}
          {/* Wide horizontal banner at the very top, just below Navbar */}
          <GoogleAd 
            slotId="1234567890" 
            className="w-full h-24 mb-6 rounded-2xl border border-gray-200 dark:border-slate-800" 
            style={{ display: 'block', width: '100%', height: '90px' }} 
          />
          
          {/* Render child routes (LearningDashboard) */}
          <Outlet context={{ courseProgress, setCourseProgress }} />
        </main>

        {/* ==================== RIGHT SIDEBAR (Monetization Zone) ==================== */}
        <aside className="hidden xl:block w-72 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="space-y-8">
            
            {/* ==================== AD SPACE 2: SIDEBAR RECTANGLES ==================== */}
            <div className="space-y-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block text-center">Sponsored</span>
              
              {/* Ad Rectangle 1 */}
              <GoogleAd 
                slotId="0987654321" 
                className="w-full h-[250px] rounded-2xl border border-gray-200 dark:border-slate-800" 
                style={{ display: 'block', width: '300px', height: '250px' }} 
              />

              {/* Ad Rectangle 2 */}
              <GoogleAd 
                slotId="1122334455" 
                className="w-full h-[250px] rounded-2xl border border-gray-200 dark:border-slate-800" 
                style={{ display: 'block', width: '300px', height: '250px' }} 
              />
            </div>

            {/* Trending Topics (Content Filler) */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-violet-500" />
                Trending Now
              </h3>
              <div className="space-y-3">
                {['AI Agents with Python', 'React 19 Features', 'System Design Patterns', 'Next.js 14 Mastery'].map((topic, i) => (
                  <div key={i} className="flex items-start gap-3 group cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <span className="text-lg font-bold text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 transition-colors">0{i+1}</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-medium">{topic}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 rounded-2xl p-4">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-3 text-sm">Weekly Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-xl">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">24</p>
                  <p className="text-xs text-slate-500">Hours Learned</p>
                </div>
                <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-xl">
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">12</p>
                  <p className="text-xs text-slate-500">Courses</p>
                </div>
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default StudentLayout;
