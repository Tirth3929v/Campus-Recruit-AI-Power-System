import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useCourses } from '../../../context/CourseContext';
import { Users, Briefcase, Activity, Settings, LogOut, Search, Bell, Menu, X, BookOpen, Plus, Trash2, Pencil, Check } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { courses, addCourse, deleteCourse, updateCourse } = useCourses();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (newCourseTitle.trim()) {
      addCourse({ title: newCourseTitle });
      setNewCourseTitle('');
    }
  };

  const startEditing = (course) => {
    setEditingId(course.id);
    setEditValue(course.title);
  };

  const saveEdit = () => {
    if (editValue.trim()) {
      updateCourse(editingId, { title: editValue });
      setEditingId(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Mock Data for Admin View
  const stats = [
    { title: 'Total Students', value: '1,234', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Jobs', value: '45', change: '+5%', icon: Briefcase, color: 'bg-emerald-500' },
    { title: 'Active Courses', value: courses.length.toString(), change: '+2', icon: BookOpen, color: 'bg-orange-500' },
  ];

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Applied for React Developer', time: '2 mins ago' },
    { id: 2, user: 'Jane Smith', action: 'Completed AI Interview', time: '15 mins ago' },
    { id: 3, user: 'Mike Johnson', action: 'Updated Profile', time: '1 hour ago' },
    { id: 4, user: 'Sarah Williams', action: 'Enrolled in Python Course', time: '3 hours ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-20 shadow-xl`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16">
          {isSidebarOpen && <h1 className="font-bold text-xl tracking-wider">ADMIN<span className="text-indigo-400">PANEL</span></h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-2">
          <SidebarItem icon={Activity} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} isOpen={isSidebarOpen} />
          <SidebarItem icon={BookOpen} label="Courses" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} isOpen={isSidebarOpen} />
          <SidebarItem icon={Users} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} isOpen={isSidebarOpen} />
          <SidebarItem icon={Briefcase} label="Jobs" active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} isOpen={isSidebarOpen} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isOpen={isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <SidebarItem 
            icon={LogOut} 
            label="Logout" 
            onClick={() => setShowLogoutConfirm(true)} 
            isOpen={isSidebarOpen} 
            className="text-red-400 hover:bg-red-900/20 hover:text-red-300" 
          />
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-100"
            >
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-500 mb-6 text-sm">Are you sure you want to end your session?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm shadow-lg shadow-red-600/30"
                >
                  Logout
                </button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800 capitalize tracking-tight">{activeTab}</h2>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all" />
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className={`${stat.color} p-4 rounded-lg text-white shadow-lg shadow-indigo-500/20`}>
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                      <span className="text-xs text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">{stat.change}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 text-lg">Recent Activity</h3>
                  <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentActivity.map((activity, index) => (
                    <motion.div 
                      key={activity.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                          {activity.user.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{activity.user}</p>
                          <p className="text-xs text-gray-500">{activity.action}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{activity.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 text-lg mb-4">Add New Course</h3>
                <form onSubmit={handleAddCourse} className="flex gap-4">
                  <input 
                    type="text" 
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="Enter course title (e.g. Advanced Python)" 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <Plus size={18} /> Add Course
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-lg">Available Courses</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  <AnimatePresence>
                  {courses.map((course) => (
                    <motion.div 
                      key={course.id} 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors group"
                    >
                      {editingId === course.id ? (
                        <div className="flex items-center gap-3 flex-1">
                          <input 
                            type="text" 
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 bg-white border border-indigo-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-1.5 rounded-full transition-colors">
                            <Check size={16} />
                          </button>
                          <button onClick={cancelEdit} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                              {course.title.charAt(0)}
                            </div>
                            <p className="font-medium text-gray-800">{course.title}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => startEditing(course)} className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-colors">
                              <Pencil size={18} />
                            </button>
                            <button onClick={() => deleteCourse(course.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                  </AnimatePresence>
                  {courses.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No courses available. Add one above.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'students' || activeTab === 'jobs' || activeTab === 'settings') && (
             <div className="bg-white p-16 rounded-xl shadow-sm text-center text-gray-400 border border-dashed border-gray-200">
                <Settings size={64} className="mx-auto mb-6 opacity-20 animate-spin-slow" />
                <h3 className="text-lg font-medium text-gray-600">Module Under Construction</h3>
                <p className="mt-2">The {activeTab} management module is currently being developed.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, isOpen, className = '' }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${className}`}
  >
    <Icon size={20} className={`${active ? 'text-white' : 'group-hover:text-white'} transition-colors`} />
    {isOpen && <span className="font-medium text-sm">{label}</span>}
  </button>
);

export default AdminDashboard;