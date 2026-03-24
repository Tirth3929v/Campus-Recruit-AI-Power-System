const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const resume = require('../controllers/resumeController');
const { protect, studentOnly } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

// ── Student ──────────────────────────────────────────────────
router.post('/student/register', auth.studentRegister);
router.post('/student/verify-otp', auth.studentVerifyOTP);
router.post('/student/resend-otp', auth.studentResendOTP);
router.post('/student/login', auth.studentLogin);
// Legacy alias for user portal
router.post('/user-login', auth.studentLogin);

// ── Employee ─────────────────────────────────────────────────
router.post('/employee/register', auth.employeeRegister);
router.post('/employee/login', auth.employeeLogin);
router.post('/employee/forgot-password', auth.employeeForgotPassword);
router.post('/employee/reset-password', auth.employeeResetPassword);

// ── Admin ────────────────────────────────────────────────────
router.post('/admin/login', auth.adminLogin);
// Keep old path working too
router.post('/admin-login', auth.adminLogin);

// ── Company ──────────────────────────────────────────────────
router.post('/company/register', auth.companySignup);
router.post('/company/login', auth.companyLogin);

// ── Shared ───────────────────────────────────────────────────
router.post('/forgot-password', auth.forgotPassword);
router.put('/reset-password/:resetToken', auth.resetPassword);
router.get('/profile', protect, auth.getProfile);
router.put('/profile', protect, auth.updateProfile);
router.post('/logout', auth.logout);

// ── Resume ───────────────────────────────────────────────────
router.post('/resume/upload', protect, studentOnly, uploadResume.single('resume'), resume.uploadResume);
router.get('/resume/me', protect, studentOnly, resume.getResume);

// Legacy aliases (keep old frontends working)
router.post('/signup', auth.studentRegister);

module.exports = router;
