import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import {
  Rocket, Trophy, Target, Clock, Activity, FileText, Zap, Calendar, Crown, Sun, Moon, Bell, Search, ChevronLeft, ChevronRight, BookOpen, Layers, Code, Briefcase, ExternalLink, X, LogOut, HelpCircle, MessageCircle, FileQuestion, Send, User, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// --- Mock Data Configuration ---
const mockData = {
  user: {
    name: "Tirth",
    course: "BCA Final Year",
    readiness: 85,
    weeklyGoal: 3
  },
  stats: [
    { label: "Total Interviews", value: "12", icon: Activity, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10" },
    { label: "Average Score", value: "78%", icon: Target, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/10" },
    { label: "Global Rank", value: "Top 5%", icon: Trophy, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-500/10" },
    { label: "Hours Practiced", value: "4.5 hrs", icon: Clock, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10" }
  ],
  skills: [
    { subject: 'React', A: 120, fullMark: 150 },
    { subject: 'Node.js', A: 98, fullMark: 150 },
    { subject: 'Communication', A: 86, fullMark: 150 },
    { subject: 'Confidence', A: 99, fullMark: 150 },
    { subject: 'Logic', A: 85, fullMark: 150 },
  ],
  recentActivity: [
    { id: 1, date: "Feb 18, 2024", subject: "React JS", score: 85, status: "Excellent" },
    { id: 2, date: "Feb 15, 2024", subject: "Node.js Backend", score: 72, status: "Good" },
    { id: 3, date: "Feb 10, 2024", subject: "HR Round", score: 90, status: "Outstanding" },
  ],
  leaderboard: [
    { name: "Alice Johnson", course: "B.Tech CS", score: 98 },
    { name: "Bob Smith", course: "BCA Final", score: 92 },
    { name: "Charlie Davis", course: "MCA", score: 88 },
    { name: "Diana Evans", course: "B.Tech IT", score: 85 },
    { name: "Ethan Hunt", course: "BCA Second", score: 82 }
  ],
  studyResources: [
    { id: 1, title: "React Documentation", type: "Documentation", link: "https://react.dev", icon: BookOpen, color: "text-cyan-600 dark:text-cyan-400" },
    { id: 2, title: "System Design Primer", type: "Guide", link: "https://github.com/donnemartin/system-design-primer", icon: Layers, color: "text-purple-600 dark:text-purple-400" },
    { id: 3, title: "JavaScript.info", type: "Tutorial", link: "https://javascript.info", icon: Code, color: "text-yellow-600 dark:text-yellow-400" },
    { id: 4, title: "Tech Interview Handbook", type: "Guide", link: "https://www.techinterviewhandbook.org", icon: Briefcase, color: "text-emerald-600 dark:text-emerald-400" },
  ]
};

const mockNotifications = [
  { id: 1, text: "New interview result available: React JS", time: "2 hrs ago", read: false },
  { id: 2, text: "You maintained a 5-day streak! 🔥", time: "5 hrs ago", read: false },
  { id: 3, text: "System maintenance scheduled for tonight.", time: "1 day ago", read: true },
];

const iconMap = {
  Activity, Target, Trophy, Clock, Zap
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState('faq');
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [weeklyGoal, setWeeklyGoal] = useState(mockData.user.weeklyGoal);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  
  useEffect(() => {
    document.title = "Student Dashboard | Campus Recruit";
  }, []);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard', { credentials: 'include' });
        if (res.ok) {
          const result = await res.json();
          setData(result);
          if (result.user.weeklyGoal) setWeeklyGoal(result.user.weeklyGoal);
        } else if (res.status === 401) {
          logout();
          navigate('/login');
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, [user, logout, navigate]);

  // Scroll to bottom of chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, showChat]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const filteredLeaderboard = (data?.leaderboard || mockData.leaderboard).filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecentActivity = (data?.recentActivity || mockData.recentActivity).filter(activity => 
    activity.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveGoal = async () => {
    try {
      await fetch('http://localhost:5000/api/user/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyGoal }),
        credentials: 'include'
      });
      setShowGoalModal(false);
      alert("Weekly goal updated!");
    } catch (e) { console.error(e); }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
        credentials: 'include'
      });
      alert("Support ticket submitted! We'll reach out via email.");
      setContactForm({ subject: '', message: '' });
      setShowHelpModal(false);
    } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: userMessage.text,
                history: chatMessages 
            }),
            credentials: 'include'
        });
        
        if (!res.ok) throw new Error(`Server Error: ${res.status}`);

        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (e) { 
        setChatMessages(prev => [...prev, { role: 'model', text: "⚠️ AI Offline. Please check if the backend server is running." }]);
    }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6 font-sans selection:bg-purple-500/30 overflow-x-hidden transition-colors duration-300">
        
        {/* Ambient Background Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        </div>

        {/* Goal Setting Modal */}
        {showGoalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Target className="text-purple-600 dark:text-purple-400" /> Set Weekly Goal
                        </h3>
                        <button onClick={() => setShowGoalModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">How many mock interviews do you want to complete this week?</p>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <input 
                            type="range" min="1" max="20" value={weeklyGoal} 
                            onChange={(e) => setWeeklyGoal(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 w-12 text-center">{weeklyGoal}</span>
                    </div>
                    <button onClick={handleSaveGoal} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all">Save Goal</button>
                </motion.div>
            </div>
        )}

        {/* Help & Support Modal */}
        {showHelpModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-0 w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[80vh]"
                >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <HelpCircle className="text-blue-600 dark:text-blue-400" /> Help & Support
                        </h3>
                        <button onClick={() => setShowHelpModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={() => setActiveHelpTab('faq')}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeHelpTab === 'faq' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <FileQuestion size={16} /> FAQs
                        </button>
                        <button 
                            onClick={() => setActiveHelpTab('contact')}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeHelpTab === 'contact' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <MessageCircle size={16} /> Contact Us
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        {activeHelpTab === 'faq' ? (
                            <div className="space-y-4">
                                {[
                                    { q: "How is my interview score calculated?", a: "Scores are generated based on keyword matching, speech clarity, confidence analysis, and visual attention metrics." },
                                    { q: "Can I download my interview recordings?", a: "Yes, you can download the full session video immediately after the interview ends from the feedback screen." },
                                    { q: "Is my camera data stored?", a: "No, video streams are processed in real-time for analysis and are not stored on our servers permanently." },
                                    { q: "How do I improve my rank?", a: "Practice consistently! Your rank is based on your average score across all mock interviews." }
                                ].map((faq, i) => (
                                    <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">Q.</span> {faq.q}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 pl-6">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</label>
                                    <input 
                                        type="text" required placeholder="e.g., Technical Issue"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={contactForm.subject} onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                                    <textarea 
                                        required rows="5" placeholder="Describe your issue or question..."
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                        value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                                    ></textarea>
                                </div>
                                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">Submit Ticket</button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        )}

        {/* Live Chat Widget */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[500px]"
                    >
                        <div className="p-4 bg-purple-600 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2"><MessageCircle size={18} /> Live Support</h3>
                            <button onClick={() => setShowChat(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900 space-y-4">
                            {chatMessages.length === 0 && (
                                <div className="text-center text-gray-500 text-sm mt-10">
                                    <p>👋 Hi there! How can we help you today?</p>
                                </div>
                            )}
                            {chatMessages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-purple-600 text-white rounded-br-none' 
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-bl-none'
                                    }`}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-600">
                                        <Loader2 className="animate-spin w-4 h-4 text-purple-600" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Type a message..." 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                            />
                            <button 
                                type="submit" 
                                disabled={!chatInput.trim()}
                                className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={() => setShowChat(!showChat)}
                className="p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg shadow-purple-500/30 transition-all hover:scale-110"
            >
                {showChat ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>

        <motion.div
            className="relative z-10 max-w-7xl mx-auto space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-end md:items-center pb-4 border-b border-gray-200 dark:border-white/5 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> 
                        {data?.user?.course || mockData.user.course}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search dashboard..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowGoalModal(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 transition-all"
                    >
                        <Target size={16} className="text-purple-600 dark:text-purple-400" /> Set Goal
                    </button>

                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Current Date</p>
                        <p className="text-sm font-mono text-gray-600 dark:text-gray-300 flex items-center justify-end gap-2">
                            <Calendar size={14} /> {new Date().toLocaleDateString()}
                        </p>
                    </div>
                    
                    {/* Notification Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-white/20 transition-all relative"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-50 dark:border-gray-900" />
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Mark all read</button>
                                    )}
                                </div>
                                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? (
                                        notifications.map(notification => (
                                            <div key={notification.id} className={`p-4 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-500/10' : ''}`}>
                                                <p className="text-sm text-gray-800 dark:text-gray-200">{notification.text}</p>
                                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-white/20 transition-all"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <button 
                        onClick={() => navigate('/student/jobs')}
                        className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                        title="Job Board"
                    >
                        <Briefcase size={20} />
                    </button>

                    <button 
                        onClick={() => navigate('/student/courses')}
                        className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all"
                        title="Courses"
                    >
                        <BookOpen size={20} />
                    </button>

                    <button 
                        onClick={() => navigate('/student/profile')}
                        className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                        title="Profile Settings"
                    >
                        <User size={20} />
                    </button>

                    <button 
                        onClick={() => setShowHelpModal(true)}
                        className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                        title="Help & Support"
                    >
                        <HelpCircle size={20} />
                    </button>

                    <button 
                        onClick={handleLogout}
                        className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* A. Hero Section */}
            <motion.div variants={itemVariants} className="w-full">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border border-white/20 dark:border-white/10 p-8 backdrop-blur-md shadow-xl dark:shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 transform translate-x-10 -translate-y-10">
                        <Rocket size={250} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">{data?.user?.name || mockData.user.name}</span>!
                        </h2>
                        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 max-w-2xl leading-relaxed">
                            You are <span className="text-emerald-600 dark:text-emerald-400 font-bold text-2xl">{data?.user?.readiness || mockData.user.readiness}%</span> ready for your dream job. 
                            Your consistency is paying off.
                        </p>

                        {/* Weekly Goal Progress Bar */}
                        <div className="mb-8 max-w-md">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                                <span className="text-gray-500 dark:text-gray-400">Weekly Goal Progress</span>
                                <span className="text-purple-600 dark:text-purple-400">
                                    {data?.interviewsThisWeek || 0} / {weeklyGoal} Interviews
                                </span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, ((data?.interviewsThisWeek || 0) / weeklyGoal) * 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {((data?.interviewsThisWeek || 0) >= weeklyGoal) 
                                    ? "🎉 Goal reached! You're on fire!" 
                                    : `${Math.max(0, weeklyGoal - (data?.interviewsThisWeek || 0))} more to reach your target.`}
                            </p>
                        </div>

                        <button 
                            onClick={async () => {
                                try {
                                    const res = await fetch('/api/start-interview', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ subject: 'General Interview' }),
                                        credentials: 'include'
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        navigate('/student/interview', { state: { interviewId: data.interviewId, subject: 'General Interview' } });
                                    } else {
                                        alert("Failed to start interview session.");
                                    }
                                } catch (e) { console.error(e); }
                            }}
                            className="group relative px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative flex items-center gap-3 group-hover:text-white dark:group-hover:text-white transition-colors">
                                <Rocket className="animate-bounce" /> Start New Interview
                            </span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* B. Quick Stats (Row of 4) */}
                {(data?.stats || mockData.stats).map((stat, index) => {
                    const Icon = typeof stat.icon === 'string' ? iconMap[stat.icon] : stat.icon;
                    return (
                        <motion.div 
                        key={index} 
                        variants={itemVariants}
                        className="col-span-1 md:col-span-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 backdrop-blur-md hover:shadow-lg dark:hover:bg-white/10 transition-all hover:-translate-y-1 group shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <Icon size={24} />
                            </div>
                            {index === 0 && <Zap size={16} className="text-yellow-400 fill-yellow-400" />}
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{stat.value}</h3>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                    );
                })}

                {/* C. Skill Radar (Medium Card) */}
                <motion.div variants={itemVariants} className="col-span-1 md:col-span-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md flex flex-col min-h-[300px] sm:min-h-[350px] shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Activity size={18} className="text-purple-600 dark:text-purple-400" /> Skill Analysis
                    </h3>
                    <div className="w-full h-[250px] sm:h-[300px] overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data?.skills || mockData.skills}>
                                <PolarGrid stroke={theme === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar
                                    name={data?.user?.name || "Student"}
                                    dataKey="A"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="#8b5cf6"
                                    fillOpacity={0.4}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* E. Leaderboard (New Component) */}
                <motion.div variants={itemVariants} className="col-span-1 md:col-span-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col min-h-[350px] shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Crown size={18} className="text-yellow-500 dark:text-yellow-400" /> Top Performers
                        </h3>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Global Rank</span>
                    </div>
                    
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredLeaderboard.map((student, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                                        index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/50' :
                                        index === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/50' :
                                        'bg-gray-200 dark:bg-gray-800 text-gray-500'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{student.name}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{student.course}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{student.score}</span>
                                    <span className="text-[10px] text-gray-500 block">Avg. Score</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* D. Recent Activity (Large Card) */}
                <motion.div variants={itemVariants} className="col-span-1 md:col-span-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock size={18} className="text-blue-600 dark:text-blue-400" /> Recent Activity
                        </h3>
                        <button onClick={() => navigate('/student/history')} className="text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wider">View All</button>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                        {filteredRecentActivity.map((activity) => (
                            <div key={activity.id} className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/20 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 group-hover:text-white transition-colors">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{activity.subject}</h4>
                                        <p className="text-xs text-gray-500">{activity.date}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                        activity.score >= 80 ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 
                                        activity.score >= 60 ? 'bg-yellow-100 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-600 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
                                    }`}>
                                        {activity.score}/100
                                    </span>
                                    <button className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-all shadow-lg shadow-purple-500/20">
                                        View Report
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* F. Calendar / Upcoming Schedule */}
                <motion.div variants={itemVariants} className="col-span-1 md:col-span-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col min-h-[350px] shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar size={18} className="text-pink-600 dark:text-pink-400" /> Upcoming Schedule
                        </h3>
                        <div className="flex items-center gap-2">
                            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                <ChevronLeft size={16} className="text-gray-500" />
                            </button>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[100px] text-center">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                <ChevronRight size={16} className="text-gray-500" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                            <div key={idx} className="text-xs font-bold text-gray-400">{day}</div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 flex-1">
                        {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const today = isToday(day);
                            // Mock event logic: 15th and 25th of any month
                            const hasEvent = day === 15 || day === 25; 
                            
                            return (
                                <div key={day} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative cursor-pointer transition-all ${
                                    today ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/30' : 
                                    'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                                }`}>
                                    {day}
                                    {hasEvent && !today && (
                                        <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-pink-500" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        <span className="text-xs text-gray-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-pink-500 inline-block" /> Next: System Design (25th)</span>
                    </div>
                </motion.div>

                {/* G. Study Resources */}
                <motion.div variants={itemVariants} className="col-span-1 md:col-span-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" /> Study Resources
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {mockData.studyResources.map((resource) => (
                            <a 
                                key={resource.id} 
                                href={resource.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 hover:border-indigo-500/30 transition-all group"
                            >
                                <div className={`p-3 rounded-lg bg-gray-200 dark:bg-gray-800 ${resource.color} group-hover:scale-110 transition-transform`}>
                                    <resource.icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{resource.title}</h4>
                                    <p className="text-xs text-gray-500">{resource.type}</p>
                                </div>
                                <ExternalLink size={14} className="ml-auto text-gray-400 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
                            </a>
                        ))}
                    </div>
                </motion.div>

            </div>
        </motion.div>
    </div>
  );
};

export default Dashboard;
