const express = require('express');
const router = express.Router();
const { 
    getFinancialAnalytics, 
    getRevenueSummary 
} = require('../controllers/financialAnalyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/analytics/financial
// @desc    Get comprehensive financial analytics
// @access  Private/Admin
// Query params: ?startDate=2024-01-01&endDate=2024-12-31
router.get('/financial', getFinancialAnalytics);

// @route   GET /api/admin/analytics/revenue-summary
// @desc    Get quick revenue summary
// @access  Private/Admin
router.get('/revenue-summary', getRevenueSummary);

module.exports = router;
