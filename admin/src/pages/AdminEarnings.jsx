import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { DollarSign, TrendingUp, CreditCard, RefreshCw, Download, Eye, Search, Loader2, BookOpen, Users } from 'lucide-react';
import axiosInstance from './axiosInstance';

const Reveal = ({ children, delay = 0, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });
    return (
        <motion.div ref={ref} className={className}
            initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
};

const AdminEarnings = () => {
    const [loading, setLoading] = useState(true);
    const [earningsData, setEarningsData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/payments/admin/earnings');
            setEarningsData(res.data);
        } catch (err) {
            console.error('Error fetching earnings:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const filteredCourses = earningsData?.earningsByCourse?.filter(course =>
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
        );
    }

    const summary = earningsData?.summary || {};

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <DollarSign size={22} className="text-emerald-400" /> Course Earnings
                </h2>
                <p className="text-white/30 text-sm mt-1">Track revenue from course purchases</p>
            </motion.div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Reveal delay={0.1}>
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/15">
                                <DollarSign size={20} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Total Earnings</p>
                                <h3 className="text-2xl font-bold text-white">{formatCurrency(summary.totalEarnings || 0)}</h3>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.15}>
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/15">
                                <TrendingUp size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Net Revenue</p>
                                <h3 className="text-2xl font-bold text-white">{formatCurrency(summary.netEarnings || 0)}</h3>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.2}>
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 rounded-xl bg-amber-500/15">
                                <CreditCard size={20} className="text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Transactions</p>
                                <h3 className="text-2xl font-bold text-white">{summary.totalTransactions || 0}</h3>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.25}>
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 rounded-xl bg-red-500/15">
                                <RefreshCw size={20} className="text-red-400" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Refunds</p>
                                <h3 className="text-2xl font-bold text-white">{formatCurrency(summary.totalRefunds || 0)}</h3>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                        aria-label="Search courses"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search courses by name or category..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>
            </motion.div>

            {/* Earnings by Course Table */}
            <Reveal delay={0.35}>
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <BookOpen size={18} className="text-amber-400" />
                        Revenue by Course
                    </h3>

                    {filteredCourses.length === 0 ? (
                        <div className="text-center py-12 text-white/30">
                            <BookOpen size={38} className="mx-auto mb-3 opacity-30" />
                            <p>No course sales yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Course</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Category</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Sales</th>
                                        <th className="text-right py-3 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Revenue</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.map((course, i) => (
                                        <motion.tr
                                            key={course.courseId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{course.courseName}</p>
                                                    {course.instructor && (
                                                        <p className="text-xs text-white/40">by {course.instructor}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                                                    {course.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="text-sm font-semibold text-white">{course.totalSales}</span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="text-sm font-bold text-emerald-400">{formatCurrency(course.totalRevenue)}</span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => {
                                                        setSelectedCourse(course);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                >
                                                    <Eye size={16} className="text-blue-400" />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Reveal>

            {/* Monthly Revenue Chart */}
            {earningsData?.earningsByMonth && earningsData.earningsByMonth.length > 0 && (
                <Reveal delay={0.4}>
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-teal-400" />
                            Monthly Revenue
                        </h3>
                        <div className="space-y-3">
                            {earningsData.earningsByMonth.slice(0, 6).map((month, i) => (
                                <div key={month.month} className="flex items-center gap-4">
                                    <span className="text-sm text-white/60 w-20">{month.month}</span>
                                    <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(month.revenue / (earningsData.earningsByMonth[0]?.revenue || 1)) * 100}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-end pr-3"
                                        >
                                            <span className="text-xs font-bold text-white">{formatCurrency(month.revenue)}</span>
                                        </motion.div>
                                    </div>
                                    <span className="text-xs text-white/40 w-16 text-right">{month.sales} sales</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>
            )}

            {/* Course Details Modal */}
            {showModal && selectedCourse && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setShowModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-3xl bg-[#0f172a] rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedCourse.courseName}</h2>
                                <p className="text-sm text-white/60 mt-1">{selectedCourse.category}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70 hover:text-white"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="glass-card p-4 rounded-xl">
                                <p className="text-xs text-white/40 mb-1">Total Sales</p>
                                <p className="text-2xl font-bold text-white">{selectedCourse.totalSales}</p>
                            </div>
                            <div className="glass-card p-4 rounded-xl">
                                <p className="text-xs text-white/40 mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(selectedCourse.totalRevenue)}</p>
                            </div>
                        </div>

                        <h3 className="text-sm font-bold text-white/80 mb-3">Recent Purchases</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {selectedCourse.purchases.map((purchase, i) => (
                                <div key={purchase._id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center">
                                            <Users size={14} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{purchase.userName}</p>
                                            <p className="text-xs text-white/40">{purchase.userEmail}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-400">{formatCurrency(purchase.amount)}</p>
                                        <p className="text-xs text-white/40">{new Date(purchase.paymentDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default AdminEarnings;
