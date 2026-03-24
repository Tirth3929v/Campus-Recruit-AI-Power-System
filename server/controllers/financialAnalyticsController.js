const Purchase = require('../models/Purchase');
const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get comprehensive financial analytics
// @route   GET /api/admin/analytics/financial
// @access  Private/Admin
const getFinancialAnalytics = async (req, res) => {
    try {
        console.log('Fetching financial analytics...');
        
        const { startDate, endDate, period = 'all' } = req.query;

        // Build date filter
        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        // Check if Purchase model exists and has data
        let purchaseCount = 0;
        try {
            purchaseCount = await Purchase.countDocuments();
            console.log(`Total purchases in database: ${purchaseCount}`);
        } catch (countError) {
            console.error('Error counting purchases:', countError.message);
        }

        // If no purchases, return empty analytics
        if (purchaseCount === 0) {
            console.log('No purchases found, returning empty analytics');
            return res.status(200).json({
                success: true,
                data: {
                    revenue: {
                        totalEarned: 0,
                        totalRefunded: 0,
                        netRevenue: 0,
                        totalTransactions: 0,
                        averageOrderValue: 0,
                        refundCount: 0,
                        refundRate: 0
                    },
                    conversion: {
                        totalUsers: await User.countDocuments({ role: 'student' }),
                        paidUsers: 0,
                        freeUsers: await User.countDocuments({ role: 'student' }),
                        conversionRate: 0,
                        conversionRateFormatted: '0%'
                    },
                    coursePopularity: [],
                    paymentMethods: [],
                    revenueTrends: [],
                    topSpenders: [],
                    categoryPerformance: [],
                    recentTransactions: []
                },
                timestamp: new Date(),
                message: 'No purchase data available yet'
            });
        }

        // ═══════════════════════════════════════════════════════════
        // 1. TOTAL REVENUE CALCULATION
        // ═══════════════════════════════════════════════════════════
        const revenueAggregation = await Purchase.aggregate([
            { 
                $match: { 
                    status: 'completed',
                    ...dateFilter
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalEarned: { $sum: '$amount' },
                    totalTransactions: { $sum: 1 },
                    averageOrderValue: { $avg: '$amount' }
                } 
            }
        ]);

        const revenueData = revenueAggregation[0] || {
            totalEarned: 0,
            totalTransactions: 0,
            averageOrderValue: 0
        };

        // Calculate refunds
        const refundAggregation = await Purchase.aggregate([
            { 
                $match: { 
                    status: 'refunded',
                    ...dateFilter
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalRefunded: { $sum: '$refundAmount' },
                    refundCount: { $sum: 1 }
                } 
            }
        ]);

        const refundData = refundAggregation[0] || {
            totalRefunded: 0,
            refundCount: 0
        };

        const netRevenue = revenueData.totalEarned - refundData.totalRefunded;

        // ═══════════════════════════════════════════════════════════
        // 2. COURSE POPULARITY & REVENUE BY COURSE
        // ═══════════════════════════════════════════════════════════
        const coursePopularity = await Purchase.aggregate([
            { 
                $match: { 
                    status: 'completed',
                    ...dateFilter
                } 
            },
            { 
                $group: { 
                    _id: '$course',
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' },
                    averagePrice: { $avg: '$amount' }
                } 
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'courseDetails'
                }
            },
            { $unwind: { path: '$courseDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    courseId: '$_id',
                    courseName: '$courseDetails.title',
                    category: '$courseDetails.category',
                    instructor: '$courseDetails.instructor',
                    thumbnail: '$courseDetails.thumbnail',
                    totalSales: 1,
                    totalRevenue: 1,
                    averagePrice: 1
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: 10 }
        ]);

        // ═══════════════════════════════════════════════════════════
        // 3. CONVERSION RATE CALCULATION
        // ═══════════════════════════════════════════════════════════
        
        // Total registered students
        const totalUsers = await User.countDocuments({ role: 'student' });

        // Unique students who made at least one completed purchase
        const paidUsers = await Purchase.distinct('student', { status: 'completed' });
        const uniquePaidUsers = paidUsers.length;

        // Calculate conversion rate
        const conversionRate = totalUsers > 0 
            ? ((uniquePaidUsers / totalUsers) * 100).toFixed(2)
            : 0;

        // ═══════════════════════════════════════════════════════════
        // 4. REVENUE BY PAYMENT METHOD
        // ═══════════════════════════════════════════════════════════
        const revenueByPaymentMethod = await Purchase.aggregate([
            { 
                $match: { 
                    status: 'completed',
                    ...dateFilter
                } 
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    totalRevenue: { $sum: '$amount' },
                    transactionCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        // ═══════════════════════════════════════════════════════════
        // 5. REVENUE TRENDS (Monthly/Weekly)
        // ═══════════════════════════════════════════════════════════
        const revenueTrends = await Purchase.aggregate([
            { 
                $match: { 
                    status: 'completed',
                    ...dateFilter
                } 
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    monthlyRevenue: { $sum: '$amount' },
                    monthlySales: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 },
            {
                $project: {
                    _id: 0,
                    period: {
                        $concat: [
                            { $toString: '$_id.year' },
                            '-',
                            { 
                                $cond: [
                                    { $lt: ['$_id.month', 10] },
                                    { $concat: ['0', { $toString: '$_id.month' }] },
                                    { $toString: '$_id.month' }
                                ]
                            }
                        ]
                    },
                    revenue: '$monthlyRevenue',
                    sales: '$monthlySales'
                }
            }
        ]);

        // ═══════════════════════════════════════════════════════════
        // 6. TOP SPENDING STUDENTS
        // ═══════════════════════════════════════════════════════════
        const topSpenders = await Purchase.aggregate([
            { 
                $match: { 
                    status: 'completed',
                    ...dateFilter
                } 
            },
            {
                $group: {
                    _id: '$student',
                    totalSpent: { $sum: '$amount' },
                    purchaseCount: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    studentId: '$_id',
                    studentName: '$userDetails.name',
                    studentEmail: '$userDetails.email',
                    totalSpent: 1,
                    purchaseCount: 1
                }
            }
        ]);

        // ═══════════════════════════════════════════════════════════
        // 7. REVENUE BY CATEGORY
        // ═══════════════════════════════════════════════════════════
        const revenueByCategory = await Purchase.aggregate([
            { 
                $match: { 
                    status: 'completed',
                    ...dateFilter
                } 
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseDetails'
                }
            },
            { $unwind: { path: '$courseDetails', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$courseDetails.category',
                    totalRevenue: { $sum: '$amount' },
                    totalSales: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        // ═══════════════════════════════════════════════════════════
        // 8. RECENT TRANSACTIONS
        // ═══════════════════════════════════════════════════════════
        const recentTransactions = await Purchase.find({ status: 'completed' })
            .populate('student', 'name email')
            .populate('course', 'title category')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('amount paymentMethod createdAt transactionId');

        // ═══════════════════════════════════════════════════════════
        // FINAL RESPONSE
        // ═══════════════════════════════════════════════════════════
        res.status(200).json({
            success: true,
            data: {
                // Revenue Summary
                revenue: {
                    totalEarned: revenueData.totalEarned,
                    totalRefunded: refundData.totalRefunded,
                    netRevenue: netRevenue,
                    totalTransactions: revenueData.totalTransactions,
                    averageOrderValue: revenueData.averageOrderValue,
                    refundCount: refundData.refundCount,
                    refundRate: revenueData.totalTransactions > 0 
                        ? ((refundData.refundCount / revenueData.totalTransactions) * 100).toFixed(2)
                        : 0
                },
                
                // Conversion Metrics
                conversion: {
                    totalUsers: totalUsers,
                    paidUsers: uniquePaidUsers,
                    freeUsers: totalUsers - uniquePaidUsers,
                    conversionRate: parseFloat(conversionRate),
                    conversionRateFormatted: `${conversionRate}%`
                },
                
                // Course Analytics
                coursePopularity: coursePopularity,
                
                // Payment Methods
                paymentMethods: revenueByPaymentMethod,
                
                // Revenue Trends
                revenueTrends: revenueTrends.reverse(), // Oldest to newest
                
                // Top Spenders
                topSpenders: topSpenders,
                
                // Category Performance
                categoryPerformance: revenueByCategory,
                
                // Recent Activity
                recentTransactions: recentTransactions.map(txn => ({
                    transactionId: txn.transactionId,
                    studentName: txn.student?.name || 'Unknown',
                    studentEmail: txn.student?.email || 'N/A',
                    courseName: txn.course?.title || 'Unknown Course',
                    category: txn.course?.category || 'N/A',
                    amount: txn.amount,
                    paymentMethod: txn.paymentMethod,
                    date: txn.createdAt
                }))
            },
            timestamp: new Date()
        });

    } catch (error) {
        console.error('\n=== 🔥 FINANCIAL ANALYTICS ERROR ===');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('=== END ERROR REPORT ===\n');
        
        res.status(500).json({
            success: false,
            message: 'Failed to fetch financial analytics',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                name: error.name
            } : undefined
        });
    }
};

// @desc    Get revenue summary (quick stats)
// @route   GET /api/admin/analytics/revenue-summary
// @access  Private/Admin
const getRevenueSummary = async (req, res) => {
    try {
        const totalRevenue = await Purchase.getTotalRevenue();
        const courseRevenue = await Purchase.getRevenueByCourse();
        
        res.status(200).json({
            success: true,
            data: {
                totalRevenue: totalRevenue.totalRevenue,
                totalTransactions: totalRevenue.totalTransactions,
                topCourses: courseRevenue.slice(0, 5)
            }
        });
    } catch (error) {
        console.error('Revenue summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue summary',
            error: error.message
        });
    }
};

module.exports = {
    getFinancialAnalytics,
    getRevenueSummary
};
