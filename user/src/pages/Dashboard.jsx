import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import {
    Rocket, Trophy, Target, Clock, Activity, FileText, Zap, Calendar, Crown,
    ChevronLeft, ChevronRight, BookOpen, Layers, Code, Briefcase,
    ExternalLink, X, MessageCircle, Send,
    Loader2, Flame, Sparkles, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StreakWidget from '../components/StreakWidget';
import MyLearningWidget from '../components/MyLearningWidget';

const iconMap = { Activity, Target, Trophy, Clock, Zap, BookOpen };
const resourceIconMap = { BookOpen, Layers, Code, Briefcase };

// Default fallback data (shown while loading)
const defaultStats = [
    { label: "Total Interviews", value: 0, icon: "Activity", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10", accent: "from-blue-500 to-cyan-500" },
    { label: "Average Score", value: 0, suffix: "%", icon: "Target", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/10", accent: "from-purple-500 to-pink-500" },
    { label: "Global Rank", value: "—", icon: "Trophy", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-500/10", accent: "from-yellow-500 to-orange-500" },
    { label: "Hours Practiced", value: 0, suffix: " hrs", icon: "Clock", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", accent: "from-emerald-500 to-teal-500" }
];
const defaultSkills = [
    { subject: 'Technical', A: 50, fullMark: 150 },
    { subject: 'Communication', A: 50, fullMark: 150 },
    { subject: 'Problem Solving', A: 50, fullMark: 150 },
    { subject: 'Confidence', A: 50, fullMark: 150 },
    { subject: 'Logic', A: 50, fullMark: 150 },
];

// ─── Animated Counter Component ───────────────────────────────
const AnimatedCounter = ({ value, suffix = "", duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(numValue)) { setCount(value); return; }

        let start = 0;
        const startTime = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = start + (numValue - start) * eased;
            setCount(Number.isInteger(numValue) ? Math.round(current) : parseFloat(current.toFixed(1)));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [isInView, value, duration]);

    return <span ref={ref}>{typeof value === 'number' ? count : value}{typeof value === 'number' ? suffix : ''}</span>;
};

// ─── Scroll-Reveal Wrapper (DRAMATIC) ─────────────────────────
const Reveal = ({ children, direction = "up", delay = 0, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    const directions = {
        up: { y: 80, x: 0 },
        down: { y: -80, x: 0 },
        left: { x: -100, y: 0 },
        right: { x: 100, y: 0 },
    };

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: 0,
                ...directions[direction],
                scale: 0.92,
                filter: "blur(10px)"
            }}
            animate={isInView ? {
                opacity: 1,
                y: 0, x: 0,
                scale: 1,
                filter: "blur(0px)"
            } : {}}
            transition={{
                duration: 1,
                delay,
                ease: [0.22, 1, 0.36, 1]
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
//  MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════
const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [data, setData] = useState(null);
    const [lastCourse, setLastCourse] = useState(null);
    const [weeklyGoal, setWeeklyGoal] = useState(3);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [studyResources, setStudyResources] = useState([]);
    const chatEndRef = useRef(null);

    useEffect(() => { document.title = "Student Dashboard | Campus Recruit"; }, []);

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

    // Data fetching
    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/dashboard', { credentials: 'include' });
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                    if (result.user?.weeklyGoal) setWeeklyGoal(result.user.weeklyGoal);
                } else if (res.status === 401) { logout(); navigate('/login'); }
            } catch (error) { console.error("Failed to fetch dashboard data", error); }
        };
        fetchData();

        // Fetch last accessed course
        const fetchLastCourse = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/courses/last-course', { credentials: 'include' });
                if (res.ok) {
                    const courseData = await res.json();
                    setLastCourse(courseData);
                }
            } catch (error) { console.error("Failed to fetch last course", error); }
        };
        fetchLastCourse();

        // Poll for real-time course updates
        const pollInterval = setInterval(() => {
            fetchLastCourse();
        }, 5000);

        // Fetch study resources
        const fetchResources = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/resources');
                if (res.ok) setStudyResources(await res.json() || []);
            } catch (error) { console.error("Failed to fetch resources", error); }
        };
        fetchResources();

        return () => clearInterval(pollInterval);
    }, [user, logout, navigate]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, showChat]);

    const handleSaveGoal = async () => {
        try {
            await fetch('http://localhost:5000/api/user/goal', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weeklyGoal }), credentials: 'include'
            });
            setShowGoalModal(false);
        } catch (e) { console.error(e); }
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
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.text, history: chatMessages }),
                credentials: 'include'
            });
            if (!res.ok) throw new Error(`Server Error: ${res.status}`);
            const resData = await res.json();
            setChatMessages(prev => [...prev, { role: 'model', text: resData.text }]);
        } catch (e) {
            setChatMessages(prev => [...prev, { role: 'model', text: "⚠️ AI Offline. Please check if the backend server is running." }]);
        } finally { setIsLoading(false); }
    };

    // ═══════════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════════
    return (
        <div className="relative min-h-full">

            {/* ═══ Ambient Floating Gradient Background ════════════ */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 50, -30, 0],
                        y: [0, -40, 20, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-violet-500/8 dark:bg-violet-500/5 blur-[150px]"
                />
                <motion.div
                    animate={{
                        x: [0, -40, 30, 0],
                        y: [0, 30, -50, 0],
                        scale: [1, 0.9, 1.15, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-blue-500/8 dark:bg-blue-500/5 blur-[150px]"
                />
                <motion.div
                    animate={{
                        x: [0, 30, -20, 0],
                        y: [0, -20, 40, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                    className="absolute top-[30%] left-[40%] w-[30vw] h-[30vh] rounded-full bg-emerald-500/5 dark:bg-emerald-500/3 blur-[120px]"
                />
            </div>

            {/* ═══ Goal Modal ══════════════════════════════════════ */}
            <AnimatePresence>
                {showGoalModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowGoalModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 60, rotateX: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 60 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="glass-panel rounded-2xl p-8 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Target className="text-purple-600 dark:text-purple-400" /> Set Weekly Goal
                                </h3>
                                <button onClick={() => setShowGoalModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">How many mock interviews do you want to complete this week?</p>
                            <div className="flex items-center gap-4 mb-8">
                                <input type="range" min="1" max="20" value={weeklyGoal}
                                    onChange={(e) => setWeeklyGoal(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                                <span className="text-3xl font-bold text-gradient w-16 text-center">{weeklyGoal}</span>
                            </div>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={handleSaveGoal} className="w-full py-3.5 btn-gradient rounded-xl font-bold">
                                Save Goal
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ Live Chat Widget ═══════════════════════════════ */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
                <AnimatePresence>
                    {showChat && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.85 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.85 }}
                            transition={{ type: "spring", damping: 22, stiffness: 300 }}
                            className="glass-panel rounded-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[500px]"
                        >
                            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex justify-between items-center">
                                <h3 className="font-bold flex items-center gap-2"><MessageCircle size={18} /> Live Support</h3>
                                <button onClick={() => setShowChat(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900/50 space-y-4">
                                {chatMessages.length === 0 && (
                                    <div className="text-center text-gray-500 text-sm mt-10">
                                        <Sparkles className="mx-auto mb-2 text-purple-400" size={24} />
                                        <p>👋 Hi there! How can we help you today?</p>
                                    </div>
                                )}
                                {chatMessages.map((msg, index) => (
                                    <motion.div key={index}
                                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: "spring", damping: 20 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none'
                                            : 'glass-card text-gray-800 dark:text-gray-200 rounded-bl-none'
                                            }`}>
                                            <p>{msg.text}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="glass-card p-3 rounded-2xl rounded-bl-none">
                                            <Loader2 className="animate-spin w-4 h-4 text-purple-600" />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-white/5 flex gap-2">
                                <input type="text" placeholder="Type a message..." value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    className="flex-1 bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none dark:text-white" />
                                <motion.button type="submit" disabled={!chatInput.trim()}
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    className="p-2 btn-gradient rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Send size={18} />
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.button
                    onClick={() => setShowChat(!showChat)}
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ boxShadow: ["0 0 0 0px rgba(139, 92, 246, 0.4)", "0 0 0 15px rgba(139, 92, 246, 0)", "0 0 0 0px rgba(139, 92, 246, 0.4)"] }}
                    transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                    className="p-4 btn-gradient rounded-full shadow-2xl"
                >
                    {showChat ? <X size={24} /> : <MessageCircle size={24} />}
                </motion.button>
            </div>

            {/* ═══════════════════════════════════════════════════
                MAIN CONTENT — CINEMATIC BENTO GRID
                (no duplicate header — UserLayout navbar handles it)
               ═══════════════════════════════════════════════════ */}
            <div className="relative z-10 space-y-5">

                {/* ── A. Hero Section — Cinematic Entrance ────── */}
                <motion.div
                    initial={{ opacity: 0, y: 80, scale: 0.9, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10 flex flex-col lg:flex-row gap-8 items-center justify-between">
                        {/* Animated gradient background */}
                        <motion.div
                            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-blue-600/10 to-emerald-600/10"
                            style={{ backgroundSize: "200% 200%" }}
                        />
                        <div className="absolute top-0 right-0 p-4 opacity-[0.04]">
                            <Rocket size={280} />
                        </div>

                        <div className="relative z-10 flex-1 w-full">
                            <motion.h2
                                initial={{ opacity: 0, x: -60, filter: "blur(8px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white leading-tight"
                            >
                                Welcome back, <span className="text-gradient-vivid">{data?.user?.name || user?.name || 'Student'}</span>!
                            </motion.h2>

                            <motion.div
                                initial={{ opacity: 0, x: -60 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="flex flex-wrap items-center gap-3 mb-6"
                            >
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    You are <span className="text-emerald-600 dark:text-emerald-400 font-bold text-2xl">
                                        <AnimatedCounter value={data?.user?.readiness || 50} suffix="%" />
                                    </span> ready for your dream job.
                                </p>
                            </motion.div>

                            {/* Weekly Goal Progress with animated fill */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                                className="mb-8 max-w-md"
                            >
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                                    <span className="text-gray-500 dark:text-gray-400">Weekly Goal</span>
                                    <span className="text-purple-600 dark:text-purple-400">
                                        {data?.interviewsThisWeek || 0} / {weeklyGoal}
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, ((data?.interviewsThisWeek || 0) / weeklyGoal) * 100)}%` }}
                                        transition={{ duration: 2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                        className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full shadow-lg shadow-violet-500/30 relative"
                                    >
                                        <motion.div
                                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                                        />
                                    </motion.div>
                                </div>
                            </motion.div>

                            <div className="flex gap-3 flex-wrap">
                                <motion.button
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 0.8 }}
                                    whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(139, 92, 246, 0.4)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={async () => {
                                        try {
                                            const res = await fetch('/api/start-interview', {
                                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ subject: 'General Interview' }), credentials: 'include'
                                            });
                                            const data = await res.json();
                                            if (res.ok) navigate('/student/interview', { state: { interviewId: data.interviewId, subject: 'General Interview' } });
                                        } catch (e) { console.error(e); }
                                    }}
                                    className="btn-gradient px-8 py-4 rounded-2xl flex items-center gap-3 text-lg font-bold"
                                >
                                    <Rocket className="animate-bounce" /> Start New Interview
                                    <ArrowUpRight size={20} />
                                </motion.button>

                                <motion.button
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.4, duration: 0.8 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowGoalModal(true)}
                                    className="btn-ghost px-6 py-4 rounded-2xl flex items-center gap-2 font-bold"
                                >
                                    <Target size={20} className="text-purple-600 dark:text-purple-400" /> Set Goal
                                </motion.button>
                            </div>
                        </div>

                        <div className="relative z-10 w-full lg:w-auto mt-6 lg:mt-0 lg:ml-8">
                            <StreakWidget streak={data?.user?.streak || 0} />
                        </div>
                    </div>
                </motion.div>

                {/* ── NEW: My Learning Widget ──────── */}
                <Reveal direction="up" delay={0.1}>
                    <MyLearningWidget data={lastCourse || data?.inProgressCourse} />
                </Reveal>

                {/* ── B. Stat Cards — Staggered Counters ──────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(data?.stats || defaultStats).map((stat, index) => {
                        const Icon = typeof stat.icon === 'string' ? iconMap[stat.icon] : stat.icon;
                        return (
                            <Reveal key={index} delay={0.15 * index}>
                                <motion.div
                                    whileHover={{ y: -8, scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                                    whileTap={{ scale: 0.97 }}
                                    className="glass-card-interactive rounded-2xl p-6 group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <motion.div
                                            whileHover={{ rotate: 15, scale: 1.2 }}
                                            className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform duration-500`}
                                        >
                                            <Icon size={22} />
                                        </motion.div>
                                        <motion.div
                                            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                                            transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                                            className={`h-8 w-8 rounded-full bg-gradient-to-br ${stat.accent} blur-sm`}
                                        />
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix || ""} duration={2000 + index * 300} />
                                    </h3>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "100%" }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.2, ease: [0.22, 1, 0.36, 1] }}
                                        className={`mt-3 h-1 rounded-full bg-gradient-to-r ${stat.accent} opacity-60`}
                                    />
                                </motion.div>
                            </Reveal>
                        );
                    })}
                </div>

                {/* ── Bento Grid: Charts + Leaderboard + Activity ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* C. Skill Radar */}
                    <Reveal className="lg:col-span-6" direction="left">
                        <div className="glass-card rounded-2xl p-6 min-h-[380px] flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Activity size={18} className="text-purple-600 dark:text-purple-400" /> Skill Analysis
                            </h3>
                            <div className="flex-1 w-full min-h-[280px]">
                                <ResponsiveContainer width="100%" height={280}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data?.skills || defaultSkills}>
                                        <PolarGrid stroke={theme === 'dark' ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12, fontWeight: 600 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                        <Radar name="Skills" dataKey="A" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#radarGradient)" fillOpacity={0.5} />
                                        <defs>
                                            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Reveal>

                    {/* D. Leaderboard */}
                    <Reveal direction="right" className="lg:col-span-6">
                        <div className="glass-card rounded-2xl p-6 min-h-[380px] flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Crown size={18} className="text-yellow-500" /> Top Performers
                                </h3>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Global Rank</span>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {(data?.leaderboard || []).map((student, index) => (
                                    <motion.div key={index}
                                        initial={{ opacity: 0, x: 60 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                        whileHover={{ scale: 1.02, x: 8, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                                        className="flex items-center justify-between p-3 rounded-xl glass-card group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                                    index === 1 ? 'bg-gray-400/20 text-gray-400 border border-gray-400/30' :
                                                        index === 2 ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                                                            'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                                    }`}>
                                                {index + 1}
                                            </motion.div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{student.name}</h4>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{student.course}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-2">
                                            <TrendingUp size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{student.score}</span>
                                                <span className="text-[10px] text-gray-500 block">Avg.</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    {/* E. Recent Activity */}
                    <Reveal delay={0.15} className="lg:col-span-6" direction="left">
                        <div className="glass-card rounded-2xl p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock size={18} className="text-blue-600 dark:text-blue-400" /> Recent Activity
                                </h3>
                                <motion.button whileHover={{ x: 4 }} onClick={() => navigate('/student/history')}
                                    className="text-xs font-bold text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors uppercase tracking-wider flex items-center gap-1">
                                    View All <ArrowUpRight size={12} />
                                </motion.button>
                            </div>
                            <div className="space-y-3">
                                {(data?.recentActivity || []).map((activity, i) => (
                                    <motion.div key={activity.id}
                                        initial={{ opacity: 0, x: -40 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                        whileHover={{ scale: 1.02, x: 8 }}
                                        className="group flex items-center justify-between p-4 rounded-xl glass-card cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <motion.div whileHover={{ rotate: 10, scale: 1.15 }}
                                                className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-500">
                                                <FileText size={18} />
                                            </motion.div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{activity.subject}</h4>
                                                <p className="text-xs text-gray-500">{activity.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${activity.score >= 80 ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                                activity.score >= 60 ? 'bg-yellow-100 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                                                    'bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
                                                }`}>
                                                {activity.score}/100
                                            </span>
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                className="px-3 py-1.5 text-xs font-bold text-white btn-gradient rounded-lg">
                                                View
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    {/* F. Calendar */}
                    <Reveal direction="right" delay={0.15} className="lg:col-span-6">
                        <div className="glass-card rounded-2xl p-6 flex flex-col min-h-[350px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Calendar size={18} className="text-pink-600 dark:text-pink-400" /> Schedule
                                </h3>
                                <div className="flex items-center gap-2">
                                    <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}
                                        onClick={prevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                        <ChevronLeft size={16} className="text-gray-500" />
                                    </motion.button>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[120px] text-center">
                                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}
                                        onClick={nextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                        <ChevronRight size={16} className="text-gray-500" />
                                    </motion.button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
                                    <div key={idx} className="text-[10px] font-bold text-gray-400 uppercase">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1.5 flex-1">
                                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const today = isToday(day);
                                    const hasEvent = day === 15 || day === 25;
                                    return (
                                        <motion.div key={day}
                                            whileHover={{ scale: 1.25, zIndex: 10 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative cursor-pointer transition-all duration-300 ${today
                                                ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white font-bold shadow-lg shadow-violet-500/30'
                                                : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-400'
                                                }`}>
                                            {day}
                                            {hasEvent && !today && (
                                                <motion.div
                                                    animate={{ scale: [1, 1.5, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="absolute bottom-1 w-1 h-1 rounded-full bg-pink-500"
                                                />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                <span className="text-xs text-gray-500 flex items-center gap-2">
                                    <motion.span
                                        animate={{ scale: [1, 1.5, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-1.5 h-1.5 rounded-full bg-pink-500 inline-block"
                                    /> Next: System Design (25th)
                                </span>
                            </div>
                        </div>
                    </Reveal>

                    {/* G. Study Resources */}
                    <Reveal delay={0.2} className="lg:col-span-12">
                        <div className="glass-card rounded-2xl p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" /> Study Resources
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {studyResources.map((resource, i) => {
                                    const IconComp = resourceIconMap[resource.icon] || BookOpen;
                                    const colorClasses = ['text-cyan-600 dark:text-cyan-400', 'text-purple-600 dark:text-purple-400', 'text-yellow-600 dark:text-yellow-400', 'text-emerald-600 dark:text-emerald-400'];
                                    return (
                                        <motion.a key={resource._id || i} href={resource.link} target="_blank" rel="noopener noreferrer"
                                            initial={{ opacity: 0, y: 40 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.1 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                            whileHover={{ y: -8, scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                                            className="flex items-center gap-4 p-4 rounded-xl glass-card-interactive group"
                                        >
                                            <motion.div whileHover={{ rotate: 15, scale: 1.2 }}
                                                className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-800 ${colorClasses[i % colorClasses.length]} transition-transform`}>
                                                <IconComp size={20} />
                                            </motion.div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{resource.title}</h4>
                                                <p className="text-xs text-gray-500">{resource.type}</p>
                                            </div>
                                            <motion.div initial={{ opacity: 0, x: -10 }} whileHover={{ opacity: 1, x: 0 }} className="flex-shrink-0">
                                                <ExternalLink size={14} className="text-gray-400 group-hover:text-indigo-500 transition-all" />
                                            </motion.div>
                                        </motion.a>
                                    );
                                })}
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
