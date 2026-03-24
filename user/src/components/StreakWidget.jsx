import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';

const StreakModal = ({ isOpen, onClose, streak }) => {
    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            const end = Date.now() + 2 * 1000;
            const colors = ['#f59e0b', '#10b981', '#3b82f6', '#14b8a6'];

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 30 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white dark:bg-[#111827] rounded-3xl p-8 w-full max-w-sm relative shadow-2xl overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center mt-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-24 h-24 bg-orange-100 dark:bg-orange-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-inner"
                        >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 fill-orange-500">
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                            </svg>
                        </motion.div>

                        <h2 className="text-4xl font-extrabold text-orange-500 mb-1">
                            {streak} <span className="text-2xl font-bold">days</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-4 mb-8">
                            Amazing consistency — keep it up!
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="w-full py-3.5 bg-[#00c853] hover:bg-[#00b049] text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-colors"
                        >
                            Share my streak
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const StreakWidget = ({ streak = 0 }) => {
    const [showModal, setShowModal] = useState(false);
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    // Calculate current day index (0 = Mon, 6 = Sun)
    const currentDayOfWeek = new Date().getDay();
    const currentIdx = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    return (
        <>
            <div
                onClick={() => setShowModal(true)}
                className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-white/5 cursor-pointer hover:scale-[1.02] transition-transform duration-300 w-full max-w-md mx-auto"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-center gap-4">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 fill-orange-500 drop-shadow-md">
                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                        </svg>
                        <div className="text-left">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Current Streak</h3>
                            <p className="text-2xl font-bold text-orange-500 leading-none mt-1">
                                {streak} <span className="text-lg font-semibold">days</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-6" />

                <div className="flex justify-between items-center w-full px-2">
                    {days.map((day, idx) => {
                        const isToday = idx === currentIdx;
                        const isPast = idx < currentIdx;

                        // Highlight logic: 
                        // - If it's today and they have a streak, show large bright fire
                        // - If it's past and part of the streak, show small bright fire
                        // - Otherwise show dimmed fire

                        let isActive = false;
                        // Assuming for visualization that if they have a streak of N, the past N days are active
                        // This is a simplified frontend logic since we don't have exact historical streak arrays
                        if (isToday && streak > 0) isActive = true;
                        if (isPast && (currentIdx - idx) < streak) isActive = true;

                        return (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <div className={`flex items-center justify-center transition-all ${isToday
                                        ? 'w-10 h-10 -mt-2'
                                        : 'w-7 h-7'
                                    }`}>
                                    <svg
                                        width="100%"
                                        height="100%"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={`${isActive ? 'text-orange-500 fill-orange-500' : 'text-orange-200 fill-orange-100 dark:text-orange-900 dark:fill-orange-950'} transition-all`}
                                    >
                                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                                    </svg>
                                </div>
                                <span className={`text-xs font-bold ${isToday ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {day}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <StreakModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                streak={streak}
            />
        </>
    );
};

export default StreakWidget;
