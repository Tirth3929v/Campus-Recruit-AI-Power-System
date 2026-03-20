const express = require('express');
const router = express.Router();

// ✅ ADMIN LOGIN ROUTE LOADED
console.log('✅ AuthRoutes loaded - /api/auth/admin-login available');
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');
const { adminLogin } = authController;
const { protect } = require('../middleware/authMiddleware');

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists in your server root
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post('/signup', authController.signup);

router.post('/forgot-password', authController.forgotPassword);

router.put('/reset-password/:resetToken', authController.resetPassword);

router.post('/admin-login', adminLogin);

router.put('/profile', protect, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 }
]), authController.updateProfile);

module.exports = router;
