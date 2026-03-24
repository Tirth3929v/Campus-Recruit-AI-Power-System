const Student = require('../models/Student');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// POST /api/auth/resume/upload
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

    const fileUrl = `/uploads/resumes/${req.file.filename}`;

    // Delete old resume file if it exists
    const student = await Student.findById(req.user._id) || await User.findById(req.user._id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (student.resume) {
      const oldPath = path.join(__dirname, '..', student.resume);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    student.resume = fileUrl;
    student.resumeName = req.file.originalname;
    await student.save();

    res.json({
      success: true,
      resume: fileUrl,
      resumeName: req.file.originalname,
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/resume/me
exports.getResume = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id) || await User.findById(req.user._id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.json({
      resume: student.resume || null,
      resumeName: student.resumeName || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
