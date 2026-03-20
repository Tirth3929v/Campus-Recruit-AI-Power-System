const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signup, login, getProfile, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   POST /auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', signup);

// @route   POST /auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   GET /auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', verifyToken, getProfile);

// @route   POST /auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', verifyToken, logout);

// @route   GET /auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Successful authentication, redirect home.
  res.redirect('/');
});

module.exports = router;
