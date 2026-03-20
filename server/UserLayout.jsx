import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Search, Flame, Sun, Moon, Bell, Menu, X, 
  ChevronDown, ChevronRight, BookOpen, Code, 
  Terminal, Cpu, Layout as LayoutIcon, Server,
  PanelRightClose, PanelRightOpen
} from 'lucide-react';

const UserLayout = () => {
  const [darkMode, setDarkMode] = useState(true); // Default to dark for premium feel
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState('react');
  const location = useLocation();

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Mock Navigation Data (W3Schools style)
  const courses = [
    {
      id: 'react', title: 'React JS', icon: <Code size={18} />,
      topics: ['Introduction', 'Components', 'Props', 'State', 'Hooks', 'Context API']
    },
    {
      id: 'node', title: 'Node.js', icon: <Server size={18} />,
      topics: ['Modules', 'File System', 'Events', 'Express', 'MongoDB']
    },
    {
      id: 'python', title: 'Python', icon: <Terminal size={18} />,
      topics: ['Syntax', 'Variables', 'Lists', 'Dictionaries', 'Functions']
    },
    {
      id: 'php', title: 'PHP', icon: <Cpu size={18} />,
      topics: ['Intro', 'Install', 'Syntax', 'Variables', 'Echo/Print']
    }
  ];

  return (
    <div className={`${darkMode ? 'dark' : ''} flex min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300`}>
      
      {/* --- LEFT SIDEBAR (Course Navigation) --- */}
      <aside className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-16 lg:hover:w-64 group'}`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-slate-800">
          <div className={`font-bold text-xl tracking-tight flex items-center gap-2 ${!sidebarOpen && 'lg:hidden'}`}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <BookOpen size={20} />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              CampusDev
            </span>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-4rem)] p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl overflow-hidden">
              <button 
                onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                className={`w-full flex items-center justify-between p-3 text-sm font-medium rounded-lg transition-all ${expandedCourse === course.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  {course.icon}
                  <span className={`${!sidebarOpen && 'lg:hidden lg:group-hover:block'}`}>{course.title}</span>
                </div>
                {expandedCourse === course.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {/* Accordion Content */}
              {expandedCourse === course.id && (
                <div className={`mt-1 ml-4 space-y-1 border-l-2 border-gray-200 dark:border-slate-800 pl-3 ${!sidebarOpen && 'lg:hidden lg:group-hover:block'}`}>
                  {course.topics.map((topic) => (
                    <Link 
                      key={topic} 
                      to="#" 
                      className="block py-2 text-sm text-slate-500 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {topic}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* --- MAIN WRAPPER --- */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'} ${rightSidebarOpen ? 'lg:mr-80' : 'lg:mr-0'}`}>
        
        {/* --- TOP NAVBAR (Sticky) --- */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg lg:hidden">
              <Menu size={20} />
            </button>
            
            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center text-sm text-slate-500 dark:text-slate-400">
              <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer">Courses</span>
              <ChevronRight size={14} className="mx-2" />
              <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer font-medium text-slate-900 dark:text-slate-200">React</span>
              <ChevronRight size={14} className="mx-2" />
              <span className="text-indigo-600 dark:text-indigo-400">Hooks</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-900 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              />
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm font-bold border border-orange-200 dark:border-orange-500/20">
              <Flame size={16} className="fill-current" />
              <span>12</span>
            </div>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Profile */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] cursor-pointer">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
              </div>
            </div>

            {/* Right Sidebar Toggle */}
            <button onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className="hidden lg:block p-2 text-slate-500 hover:text-indigo-500 transition-colors">
              {rightSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
            </button>
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-5xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* --- RIGHT SIDEBAR (Analytics) --- */}
      <aside className={`fixed right-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 z-30 transition-all duration-300 overflow-y-auto ${rightSidebarOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full'}`}>
        <div className="p-6 space-y-8">
          
          {/* Skills Radar Chart Placeholder */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Skill Analysis</h3>
            <div className="aspect-square bg-gray-100 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden group">
              {/* Mock Radar Visual */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-40 h-40 border border-indigo-500 rounded-full"></div>
                <div className="w-24 h-24 border border-indigo-500 rounded-full absolute"></div>
              </div>
              <div className="relative z-10 text-center">
                <p className="text-xs text-slate-500">Radar Chart</p>
                <p className="text-xs text-indigo-500 font-medium">React • Node • Python</p>
              </div>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Schedule</h3>
            <div className="space-y-3">
              {[
                { title: 'React Hooks Deep Dive', time: '10:00 AM', type: 'Live' },
                { title: 'System Design Interview', time: '02:00 PM', type: 'Practice' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.type === 'Live' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}`}>
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
            <p className="text-xs text-indigo-100 mb-1">Weekly Goal</p>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold">85%</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">On Track</span>
            </div>
            <div className="w-full bg-black/20 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-white h-full rounded-full w-[85%]"></div>
            </div>
          </div>

        </div>
      </aside>
    </div>
  );
};

export default UserLayout;