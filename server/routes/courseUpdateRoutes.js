const express = require('express');
const router = express.Router();
const {
  submitUpdateRequest,
  getMyUpdateRequests,
  getAllUpdateRequests,
  approveUpdateRequest,
  rejectUpdateRequest
} = require('../controllers/courseUpdateController');
const { protect, employeeOnly, adminOnly } = require('../middleware/authMiddleware');
const Course = require('../models/Course');

// Employee routes
router.post('/request', protect, employeeOnly, submitUpdateRequest);
router.get('/my-requests', protect, employeeOnly, getMyUpdateRequests);

// Admin routes
router.get('/all', protect, adminOnly, getAllUpdateRequests);
router.get('/debug/count', protect, adminOnly, async (req, res) => {
  try {
    const CourseUpdateRequest = require('../models/CourseUpdateRequest');
    const total = await CourseUpdateRequest.countDocuments();
    const pending = await CourseUpdateRequest.countDocuments({ status: 'pending' });
    const approved = await CourseUpdateRequest.countDocuments({ status: 'approved' });
    const rejected = await CourseUpdateRequest.countDocuments({ status: 'rejected' });
    
    const allRequests = await CourseUpdateRequest.find().lean();
    
    res.json({
      success: true,
      counts: { total, pending, approved, rejected },
      requests: allRequests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/approve/:requestId', protect, adminOnly, approveUpdateRequest);
router.put('/reject/:requestId', protect, adminOnly, rejectUpdateRequest);

// Get course update history
router.get('/history/:courseId', protect, async (req, res) => {
  try {
    const Course = require('../models/Course');
    const course = await Course.findById(req.params.courseId).select('updateHistory title');
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({
      courseTitle: course.title,
      history: course.updateHistory || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch update history' });
  }
});

module.exports = router;
