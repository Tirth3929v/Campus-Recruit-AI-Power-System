const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const StudentProfile = require('../models/StudentProfile');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST /api/payments/purchase - Process course purchase
router.post('/purchase', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId, amount, paymentMethod, transactionId, paymentGateway } = req.body;

        // Validate course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already purchased
        const existingPayment = await Payment.findOne({ 
            user: userId, 
            course: courseId, 
            status: 'completed' 
        });
        if (existingPayment) {
            return res.status(400).json({ message: 'Course already purchased' });
        }

        // Create payment record
        const payment = await Payment.create({
            user: userId,
            course: courseId,
            amount,
            paymentMethod: paymentMethod || 'card',
            transactionId: transactionId || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            paymentGateway: paymentGateway || 'stripe',
            status: 'completed',
            paymentDate: new Date()
        });

        // Create enrollment
        const studentProfile = await StudentProfile.findOne({ user: userId });
        if (studentProfile) {
            await Enrollment.create({
                student: studentProfile._id,
                course: courseId,
                enrolledDate: new Date(),
                progress: 0,
                completed: false
            });
        }

        res.status(201).json({
            success: true,
            message: 'Payment successful',
            payment
        });
    } catch (err) {
        console.error('Payment error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/payments/my-purchases - Get user's purchase history
router.get('/my-purchases', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        
        const payments = await Payment.find({ user: userId, status: 'completed' })
            .populate('course', 'title thumbnail category price')
            .sort({ paymentDate: -1 });

        res.json(payments);
    } catch (err) {
        console.error('Fetch purchases error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/payments/admin/earnings - Admin: Get earnings overview
router.get('/admin/earnings', protect, adminOnly, async (req, res) => {
    try {
        const { startDate, endDate, status = 'completed' } = req.query;

        // Build filter
        const filter = { status };
        if (startDate || endDate) {
            filter.paymentDate = {};
            if (startDate) filter.paymentDate.$gte = new Date(startDate);
            if (endDate) filter.paymentDate.$lte = new Date(endDate);
        }

        // Get all payments
        const payments = await Payment.find(filter)
            .populate('user', 'name email')
            .populate('course', 'title category instructor')
            .sort({ paymentDate: -1 });

        // Calculate statistics
        const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalRefunds = payments
            .filter(p => p.status === 'refunded')
            .reduce((sum, p) => sum + p.refundAmount, 0);
        const netEarnings = totalEarnings - totalRefunds;

        // Group by course
        const earningsByCourse = {};
        payments.forEach(p => {
            if (p.course) {
                const courseId = p.course._id.toString();
                if (!earningsByCourse[courseId]) {
                    earningsByCourse[courseId] = {
                        courseId,
                        courseName: p.course.title,
                        category: p.course.category,
                        instructor: p.course.instructor,
                        totalSales: 0,
                        totalRevenue: 0,
                        purchases: []
                    };
                }
                earningsByCourse[courseId].totalSales += 1;
                earningsByCourse[courseId].totalRevenue += p.amount;
                earningsByCourse[courseId].purchases.push({
                    _id: p._id,
                    userName: p.user?.name || 'Unknown',
                    userEmail: p.user?.email || 'N/A',
                    amount: p.amount,
                    paymentDate: p.paymentDate,
                    transactionId: p.transactionId
                });
            }
        });

        // Group by month
        const earningsByMonth = {};
        payments.forEach(p => {
            const month = new Date(p.paymentDate).toISOString().slice(0, 7); // YYYY-MM
            if (!earningsByMonth[month]) {
                earningsByMonth[month] = { month, revenue: 0, sales: 0 };
            }
            earningsByMonth[month].revenue += p.amount;
            earningsByMonth[month].sales += 1;
        });

        res.json({
            success: true,
            summary: {
                totalEarnings,
                totalRefunds,
                netEarnings,
                totalTransactions: payments.length,
                completedTransactions: payments.filter(p => p.status === 'completed').length,
                refundedTransactions: payments.filter(p => p.status === 'refunded').length
            },
            earningsByCourse: Object.values(earningsByCourse),
            earningsByMonth: Object.values(earningsByMonth).sort((a, b) => b.month.localeCompare(a.month)),
            recentTransactions: payments.slice(0, 20)
        });
    } catch (err) {
        console.error('Admin earnings error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/payments/admin/all - Admin: Get all transactions
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const { page = 1, limit = 50, status } = req.query;

        const filter = status ? { status } : {};
        
        const payments = await Payment.find(filter)
            .populate('user', 'name email')
            .populate('course', 'title category price')
            .sort({ paymentDate: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(filter);

        res.json({
            success: true,
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Fetch all payments error:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/payments/admin/refund/:id - Admin: Process refund
router.post('/admin/refund/:id', protect, adminOnly, async (req, res) => {
    try {
        const { refundAmount, reason } = req.body;
        
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status === 'refunded') {
            return res.status(400).json({ message: 'Payment already refunded' });
        }

        payment.status = 'refunded';
        payment.refundAmount = refundAmount || payment.amount;
        payment.refundDate = new Date();
        payment.metadata.refundReason = reason || 'Admin refund';
        
        await payment.save();

        res.json({
            success: true,
            message: 'Refund processed successfully',
            payment
        });
    } catch (err) {
        console.error('Refund error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
