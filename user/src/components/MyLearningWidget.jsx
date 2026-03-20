import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Dumbbell, Puzzle, GraduationCap, BarChart2, Lock, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CircularProgress = ({ percentage, size = 48, strokeWidth = 3, color = "#10b981", trackColor = "rgba(16, 185, 129, 0.1)" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Track */}
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={trackColor} strokeWidth={strokeWidth} fill="transparent"
                />
                {/* Progress */}
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={color} strokeWidth={strokeWidth} fill="transparent"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <span className="absolute text-[10px] font-bold text-gray-700 dark:text-gray-300">
                {percentage}%
            </span>
        </div>
    );
};

const MyLearningWidget = ({ data }) => {
    const navigate = useNavigate();

    // Empty state 
    if (!data) {
        return (
            <div className="glass-panel rounded-3xl p-6 lg:p-8 relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-xl text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">My Learning</h2>
                <p className="text-gray-500 text-sm mb-6">You are not enrolled in any courses yet.</p>
                <button
                    onClick={() => navigate('/courses')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20">
                    Browse Courses
                </button>
            </div>
        );
    }

    // Calculate next chapter
    let nextChapterName = "Complete";
    const totalChapters = data.chaptersTotal || 0;
    const completedCount = data.completedChapters?.length || 0;

    if (data.chapters && data.chapters.length > 0) {
        // Find first chapter that isn't in completedChapters set
        const nextChap = data.chapters.find(c => !data.completedChapters.includes(c.chapterId));
        if (nextChap) {
            const idx = data.chapters.findIndex(c => c.chapterId === nextChap.chapterId);
            nextChapterName = `Chapter ${idx + 1}: ${nextChap.title}`;
        }
    }

    // Dummy logical progression stats for the right-side layout based on overall progress
    const exerciseProgress = Math.min(100, data.progress + 10);
    const challengeProgress = Math.max(0, data.progress - 15);
    return (
        <div className="glass-panel rounded-3xl p-6 lg:p-8 relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Learning</h2>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Card: Course Cover */}
                <div className="w-full lg:w-1/3 min-w-[200px] border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center p-8 bg-gray-50/50 dark:bg-white/5 relative group cursor-pointer overflow-hidden">
                    <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="w-24 h-24 mb-6 relative">
                        {data.thumbnail && data.thumbnail !== '' && !data.thumbnail.includes('placeholder') ? (
                            <img src={data.thumbnail} alt={data.title} className="w-full h-full object-cover rounded-xl shadow-md" />
                        ) : (
                            <svg viewBox="0 0 110 110" className="w-full h-full drop-shadow-md">
                                <path fill="#3776AB" d="M54.7,0C24.5,0,23.3,13,23.3,13v13.6h31.9v4.5H16c-18.7,0-16,28.2-16,28.2s-2.1,28,15.6,28h7.2v-13 c0-15.3,12.7-17.7,12.7-17.7h23.2c8.9,0,16.7-7.9,16.7-16.7V12.7C75.3,1.3,54.7,0,54.7,0z M39.6,8.9c3.3,0,5.9,2.6,5.9,5.9 c0,3.3-2.6,5.9-5.9,5.9c-3.3,0-5.9-2.6-5.9-5.9C33.7,11.5,36.4,8.9,39.6,8.9z" />
                                <path fill="#FFD43B" d="M54.7,109.4c30.2,0,31.5-13,31.5-13V82.7H54.2v-4.5h39.3c18.7,0,16-28.2,16-28.2 s2.1-28-15.6-28h-7.2v13c0,15.3-12.7,17.7-12.7,17.7H50.8c-8.9,0-16.7,7.9-16.7,16.7v26.7C34.1,108.1,54.7,109.4,54.7,109.4z M69.8,100.5c-3.3,0-5.9-2.6-5.9-5.9c0-3.3,2.6-5.9,5.9-5.9c3.3,0,5.9,2.6,5.9,5.9C75.7,97.8,73.1,100.5,69.8,100.5z" />
                            </svg>
                        )}
                    </motion.div>
                    <h3 className="text-lg text-center font-bold text-gray-900 dark:text-white mb-2 leading-snug line-clamp-2">{data.title}</h3>
                    <button onClick={() => navigate('/courses')} className="text-emerald-500 font-semibold text-sm hover:text-emerald-600 transition-colors mb-4">
                        Change
                    </button>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-black/5 dark:bg-white/5 py-1 px-3 rounded-full">
                        <BarChart2 size={12} className="text-gray-400" />
                        {data.level}
                    </div>
                </div>

                {/* Right Area: Grid of Progress Modules */}
                <div className="w-full lg:w-2/3 flex flex-col gap-4">

                    {/* Active Main Module */}
                    <motion.div whileHover={{ y: -2, scale: 1.01 }} className="relative border-2 border-emerald-400/30 rounded-2xl bg-white dark:bg-gray-800/40 p-5 shadow-sm shadow-emerald-500/5 cursor-pointer">
                        {/* Floating Badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black tracking-widest uppercase px-4 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/30">
                            Pick up where you left off
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100/50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <BookOpen size={20} />
                                </div>
                                <div className="min-w-0 pr-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-base truncate">{data.title}</h4>
                                    <p className="text-sm font-medium text-gray-500 truncate mt-0.5"><span className="text-gray-400">Up next:</span> {nextChapterName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                                <CircularProgress percentage={data.progress} size={50} color="#10b981" />
                                <button
                                    onClick={() => navigate(`/courses/${data.courseId}`)}
                                    className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2"
                                >
                                    {data.progress === 100 ? 'Review' : 'Continue'} <PlayCircle size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sub Modules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Exercises */}
                        <motion.div whileHover={{ y: -2, scale: 1.02 }} className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800/20 p-5 flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Dumbbell size={18} className="text-gray-400" />
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Exercises</h4>
                            </div>
                            <CircularProgress percentage={exerciseProgress} size={42} strokeWidth={2.5} color="#10b981" />
                        </motion.div>

                        {/* Challenges */}
                        <motion.div whileHover={{ y: -2, scale: 1.02 }} className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800/20 p-5 flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Puzzle size={18} className="text-gray-400" />
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Challenges</h4>
                            </div>
                            <CircularProgress percentage={challengeProgress} size={42} strokeWidth={2.5} color="#3b82f6" trackColor="rgba(59, 130, 246, 0.1)" />
                        </motion.div>

                        {/* Course */}
                        <div className="border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 p-5 flex items-center justify-between opacity-70 cursor-not-allowed">
                            <div className="flex items-center gap-3">
                                <GraduationCap size={18} className="text-gray-500" />
                                <h4 className="font-bold text-gray-600 dark:text-gray-400 text-sm">Course</h4>
                            </div>
                            <Lock size={16} className="text-amber-500" />
                        </div>

                        {/* Test & Exam */}
                        <div className="border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 p-5 flex items-center justify-between opacity-70 cursor-not-allowed">
                            <div className="flex items-center gap-3">
                                <BarChart2 size={18} className="text-gray-500" />
                                <h4 className="font-bold text-gray-600 dark:text-gray-400 text-sm">Test & Exam</h4>
                            </div>
                            {/* Empty reserved space */}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MyLearningWidget;
