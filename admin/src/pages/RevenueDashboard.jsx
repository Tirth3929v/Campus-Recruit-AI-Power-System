import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { DollarSign, TrendingUp, ShoppingCart, BookOpen, Loader2, RefreshCw, Calendar, Users, Award } from 'lucide-react';
import axiosInstance from '../context/axiosInstance';

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

const AnimatedCounter = ({ value, prefix = "", suffix = "", duration = 1800 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(num)) {
            setCount(value);
            return;
        }

        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Number.isInteger(num) ? Math.round(num * eased) : parseFloat((num * eased).toFixed(2)));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [isInView, value, duration]);

    return (
        <span ref={ref}>
            {prefix}{typeof value === 'number' ? count.toLocaleString() : value}{suffix}
        </span>
    );
};

const StatCard = ({ icon: Icon, label, value, prefix = "", suffix = "", color, bgColor, accentGradient, delay = 0 }) => {
    return (
        <Reveal delay={delay}>
            <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-card rounded-2xl p-6 group cursor-pointer relative overflow-hidden"
            >
                {/* Animated background gradient */}
                <motion.div
                    animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute inset-0 bg-gradient-to-br ${accentGradient} opacity-5`}
                    style={{ backgroundSize: "200% 200%" }}
                />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <motion.div
                            whileHover={{ rotate: 15, scale: 1.2 }}
                            className={`p-3 rounded-xl ${bgColor}`}
                        >
                            <Icon size={24} className={color} />
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 3, repeat: Infinity, delay: delay * 0.5 }}
                            className={`h-8 w-8 rounded-full bg-gradient-to-br ${accentGradient} blur-sm`}
                        />
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-2">
                        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
                    </h3>
                    <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</p>

                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + delay * 0.15 }}
                        className={`mt-4 h-1 rounded-full bg-gradient-to-r ${accentGradient} opacity-60`}
                    />
                </div>
            </motion.div>
        </Reveal>
    );
};

const RevenueDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [financialData, setFinancialData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const response = await axiosInstance.get('/admin/analytics/financial');
            setFinancialData(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching financial data:', err);
            setError(err.response?.data?.message || 'Failed to load financial data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchFinancialData()}
                    className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold"
                >
                    Retry
                </motion.button>
            </div>
        );
    }

    const { revenue, conversion, coursePopularity, paymentMethods, topSpenders, categoryPerformance } = financialData || {};

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <DollarSign size={22} className="text-emerald-400" /> Revenue Dashboard
                    </h2>
                    <p className="text-white/30 text-sm mt-1">Financial analytics and course performance</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, rotate: refreshing ? 360 : 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchFinancialData(true)}
                    disabled={refreshing}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={18} className={`text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
                </motion.button>
            </motion.div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={revenue?.totalEarned || 0}
                    prefix="$"
                    color="text-emerald-400"
                    bgColor="bg-emerald-500/15"
                    accentGradient="from-emerald-500 to-teal-500"
                    delay={0.1}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Net Revenue"
                    value={revenue?.netRevenue || 0}
                    prefix="$"
                    color="text-blue-400"
                    bgColor="bg-blue-500/15"
                    accentGradient="from-blue-500 to-cyan-500"
                    delay={0.15}
                />
                <StatCard
                    icon={ShoppingCart}
                    label="Total Sales"
                    value={revenue?.totalTransactions || 0}
                    color="text-amber-400"
                    bgColor="bg-amber-500/15"
                    accentGradient="from-amber-500 to-orange-500"
                    delay={0.2}
                />
                <StatCard
                    icon={Users}
                    label="Conversion Rate"
                    value={conversion?.conversionRate || 0}
                    suffix="%"
                    color="text-purple-400"
                    bgColor="bg-purple-500/15"
                    accentGradient="from-purple-500 to-pink-500"
                    delay={0.25}
                />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Reveal delay={0.3}>
                    <div className="glass-card rounded-xl p-4">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Avg Order Value</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(revenue?.averageOrderValue || 0)}</p>
                    </div>
                </Reveal>
                <Reveal delay={0.35}>
                    <div className="glass-card rounded-xl p-4">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Paid Users</p>
                        <p className="text-xl font-bold text-white">{conversion?.paidUsers?.toLocaleString() || 0}</p>
                    </div>
                </Reveal>
                <Reveal delay={0.4}>
                    <div className="glass-card rounded-xl p-4">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Refund Rate</p>
                        <p className="text-xl font-bold text-white">{revenue?.refundRate || 0}%</p>
                    </div>
                </Reveal>
            </div>

            {/* Top Selling Courses Table */}
            <Reveal delay={0.45}>
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Award size={18} className="text-amber-400" />
                        Top Selling Courses
                    </h3>

                    {!coursePopularity || coursePopularity.length === 0 ? (
                        <div className="text-center py-12 text-white/30">
                            <BookOpen size={38} className="mx-auto mb-3 opacity-30" />
                            <p>No course sales data available</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Rank</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Course</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Category</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Sales</th>
                                        <th className="text-right py-3 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Revenue</th>
                                        <th className="text-right py-3 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Avg Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coursePopularity.map((course, index) => (
                                        <motion.tr
                                            key={course.courseId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + index * 0.05 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                    index === 0 ? 'bg-amber-500/20 text-amber-400' :
                                                    index === 1 ? 'bg-gray-500/20 text-gray-400' :
                                                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-white/5 text-white/40'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{course.courseName || 'Unknown Course'}</p>
                                                    {course.instructor && (
                                                        <p className="text-xs text-white/40">by {course.instructor}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                                                    {course.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm font-semibold text-white">{course.totalSales?.toLocaleString() || 0}</span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="text-sm font-bold text-emerald-400">{formatCurrency(course.totalRevenue)}</span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="text-sm text-white/60">{formatCurrency(course.averagePrice)}</span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Reveal>

            {/* Payment Methods & Category Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <Reveal delay={0.5}>
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <ShoppingCart size={18} className="text-blue-400" />
                            Payment Methods
                        </h3>
                        <div className="space-y-3">
                            {paymentMethods && paymentMethods.length > 0 ? (
                                paymentMethods.map((method, i) => (
                                    <div key={method._id} className="flex items-center justify-between">
                                        <span className="text-sm text-white/60">{method._id}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-white/40">{method.transactionCount} txns</span>
                                            <span className="text-sm font-bold text-emerald-400">{formatCurrency(method.totalRevenue)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-white/30 py-4">No payment data</p>
                            )}
                        </div>
                    </div>
                </Reveal>

                {/* Category Performance */}
                <Reveal delay={0.55}>
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BookOpen size={18} className="text-purple-400" />
                            Category Performance
                        </h3>
                        <div className="space-y-3">
                            {categoryPerformance && categoryPerformance.length > 0 ? (
                                categoryPerformance.map((category, i) => (
                                    <div key={category._id} className="flex items-center justify-between">
                                        <span className="text-sm text-white/60">{category._id || 'Uncategorized'}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-white/40">{category.totalSales} sales</span>
                                            <span className="text-sm font-bold text-emerald-400">{formatCurrency(category.totalRevenue)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-white/30 py-4">No category data</p>
                            )}
                        </div>
                    </div>
                </Reveal>
            </div>
        </div>
    );
};

export default RevenueDashboard;
