const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { generateText, generateCode } = require('../controllers/aiController');

// 20 requests per minute per IP — prevents abuse / runaway costs
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(aiLimiter);

router.post('/generate-text',  generateText);
router.post('/generate-code',  generateCode);

module.exports = router;
