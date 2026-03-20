const express = require('express');
const router = express.Router();
const multer = require('multer');
const interviewController = require('../controllers/interviewController');

// Use memory storage so we can stream the buffer directly to Google Drive
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('video'), interviewController.uploadInterview);
router.post('/start', interviewController.startInterview);

module.exports = router;