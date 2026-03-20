const express = require('express');
const router = express.Router();
const aiInterviewController = require('../controllers/aiInterviewController');
// All routes are protected by the mount path in index.js

// Generate questions for interview
router.post('/generate-questions', aiInterviewController.generateQuestions);

// Evaluate a single answer
router.post('/evaluate-answer', aiInterviewController.evaluateAnswer);

// Submit complete interview session
router.post('/submit-session', aiInterviewController.submitSession);

// Get specific session
router.get('/session/:sessionId', aiInterviewController.getSession);

// Get user interview history
router.get('/history', aiInterviewController.getHistory);

module.exports = router;
