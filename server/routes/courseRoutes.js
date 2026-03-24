const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Purchase = require('../models/Purchase');
const StudentProfile = require('../models/StudentProfile');
const Rating = require('../models/Rating');
const { sendPaymentSuccessEmail } = require('../utils/email');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const uploadDir = path.join(__dirname, '../uploads');
const coursePdfsDir = path.join(__dirname, '../uploads/course-pdfs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(coursePdfsDir)) {
  fs.mkdirSync(coursePdfsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const coursePdfsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, coursePdfsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const isPdfFile = (filePath) => {
  try {
    const buffer = Buffer.alloc(5);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 5, 0);
    fs.closeSync(fd);
    const pdfMagic = buffer.toString('ascii');
    return pdfMagic === '%PDF-';
  } catch (err) {
    console.error('Error checking PDF magic bytes:', err);
    return false;
  }
};

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  }
});

const uploadCoursePdf = multer({ 
  storage: coursePdfsStorage,
  fileFilter: pdfFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Custom verify token middleware for these specific routes
const verifyAuthToken = (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/user/last-course - Track last accessed course
router.post('/last-course', verifyAuthToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }
    
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    studentProfile.lastAccessedCourse = new mongoose.Types.ObjectId(courseId);
    studentProfile.lastAccessedAt = new Date();
    await studentProfile.save();
    
    res.json({ 
      success: true, 
      lastAccessedCourse: courseId,
      lastAccessedAt: studentProfile.lastAccessedAt
    });
  } catch (err) {
    console.error('Last course tracking error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/last-course - Get last accessed course with progress
router.get('/last-course', verifyAuthToken, async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile || !studentProfile.lastAccessedCourse) {
      return res.json(null);
    }
    
    const course = await Course.findById(studentProfile.lastAccessedCourse);
    if (!course) {
      return res.json(null);
    }
    
    const enrollment = await Enrollment.findOne({
      student: studentProfile._id,
      course: studentProfile.lastAccessedCourse
    });
    
    if (!enrollment) {
      return res.json(null);
    }
    
    const totalLessons = course.chapters ? course.chapters.length : 0;
    const completedLessons = enrollment.completedChapters ? enrollment.completedChapters.length : 0;
    const remainingLessons = totalLessons - completedLessons;
    
    res.json({
      id: course._id,
      courseId: course._id,
      courseName: course.title,
      courseThumbnail: course.thumbnail,
      courseLevel: course.level,
      courseType: course.courseType === 'paid' ? 'Paid' : 'Free',
      totalLessons: totalLessons,
      completedLessons: completedLessons,
      remainingLessons: remainingLessons,
      totalExercises: totalLessons,
      completedExercises: completedLessons,
      totalChallenges: totalLessons,
      completedChallenges: Math.floor(completedLessons * 0.7),
      testScore: enrollment.mcqScore || 0,
      progressPercentage: enrollment.progress || 0,
      lastAccessed: studentProfile.lastAccessedAt,
      chapters: course.chapters || [],
      completedChapters: enrollment.completedChapters || [],
      title: course.title,
      thumbnail: course.thumbnail,
      level: course.level,
      progress: enrollment.progress || 0
    });
  } catch (err) {
    console.error('Get last course error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses - list all published courses (students)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    // Default to published courses for public access
    const filter = status ? { status } : { status: 'published' };
    const courses = await Course.find(filter).select('title description instructor level category courseType price duration thumbnail chapters createdAt rating totalRatings').sort({ createdAt: -1 });
    console.log('Courses returned:', courses.length, 'with filter:', filter);
    courses.forEach(c => {
      console.log(' - ', c.title, 'Price:', c.price, 'Type:', c.courseType, 'Status:', c.status);
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/admin/pending - Get all pending courses (Admin only)
router.get('/admin/pending', verifyAuthToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const pendingCourses = await Course.find({ status: 'pending_approval' })
      .select('title description instructor level category courseType price duration thumbnail chapters createdAt createdBy')
      .sort({ createdAt: -1 });
    
    console.log('Pending courses found:', pendingCourses.length);
    res.json(pendingCourses);
  } catch (err) {
    console.error('Get pending courses error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/my-learning - Get all enrolled courses for the current user
router.get('/my-learning', verifyAuthToken, async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) return res.json([]);

    const enrollments = await Enrollment.find({ student: studentProfile._id })
      .populate('course')
      .sort({ updatedAt: -1 });

    const coursesWithProgress = enrollments
      .filter(enrollment => enrollment.course)
      .map(enrollment => ({
        _id: enrollment.course._id,
        title: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
        description: enrollment.course.description,
        instructor: enrollment.course.instructor,
        duration: enrollment.course.duration,
        category: enrollment.course.category,
        level: enrollment.course.level,
        courseType: enrollment.course.courseType,
        price: enrollment.course.price,
        progress: enrollment.progress,
        completedChapters: enrollment.completedChapters,
        totalChapters: enrollment.course.chapters ? enrollment.course.chapters.length : 0,
        completed: enrollment.completed,
        enrolledAt: enrollment.createdAt,
        lastAccessed: enrollment.updatedAt
      }));

    res.json(coursesWithProgress);
  } catch (err) {
    console.error('My Learning error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/discount-info - Get discount info for current user
router.get('/discount-info', verifyAuthToken, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Get all completed paid courses for this user
    const purchases = await Purchase.find({ 
      userId: req.user.id,
      paymentStatus: 'success'
    }).populate({
      path: 'courseId',
      select: 'courseType price'
    });
    
    // Count only paid courses
    const paidCourseCount = purchases.filter(p => 
      p.courseId && p.courseId.courseType === 'paid'
    ).length;
    
    // User gets discount after completing 3 paid courses
    const discountPercentage = paidCourseCount >= 3 ? (paidCourseCount >= 5 ? 10 : 5) : 0;
    const eligibleForDiscount = paidCourseCount >= 3;
    
    res.json({
      paidCourseCount,
      discountPercentage,
      eligibleForDiscount,
      message: eligibleForDiscount 
        ? `You have purchased ${paidCourseCount} paid courses. You get ${discountPercentage}% discount on your next course!`
        : `Complete ${3 - paidCourseCount} more paid courses to get a discount on your next purchase.`
    });
  } catch (err) {
    console.error('Discount info error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/employee/course-stats - Get stats for employee's courses
router.get('/employee/course-stats', verifyAuthToken, async (req, res) => {
  try {
    const allowedRoles = ['employee', 'company', 'admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Employee access only' });
    }

    let courses = await Course.find({ createdBy: req.user.email }).sort({ createdAt: -1 });
    
    if (courses.length === 0 && req.user.name) {
      courses = await Course.find({ createdBy: req.user.name }).sort({ createdAt: -1 });
    }
    
    const stats = await Promise.all(courses.map(async (course) => {
      const totalEnrolled = await Enrollment.countDocuments({ course: course._id });
      const completed = await Enrollment.countDocuments({ course: course._id, completed: true });
      const inProgress = await Enrollment.countDocuments({ 
        course: course._id, 
        progress: { $gt: 0, $lt: 100 } 
      });

      return {
        _id: course._id,
        courseId: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        description: course.description,
        level: course.level,
        category: course.category,
        courseType: course.courseType,
        price: course.price,
        duration: course.duration,
        pdfFile: course.pdfFile,
        totalLessons: course.chapters ? course.chapters.length : 0,
        totalEnrolled,
        completed,
        inProgress,
        status: course.status,
        createdBy: course.createdBy,
        createdAt: course.createdAt,
        updateHistory: course.updateHistory || []
      };
    }));

    res.json(stats);
  } catch (err) {
    console.error('Employee course stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses/fake-payment - Fake payment flow (MUST be before /:id)
router.post('/fake-payment', verifyAuthToken, async (req, res) => {
  try {
    console.log('Payment request received:', req.body);
    
    const { courseId, name, paymentMethod, cardNumber, expiry, cvv, cardName, upiId, upiMobile, bankName, accountId } = req.body;
    
    // Extract user data from authenticated token
    const studentId = req.user.id || req.user._id;
    const userEmail = req.user.email;
    const userName = name || req.user.name || 'Student';
    
    // Validate required fields
    if (!courseId) {
      console.log('Validation failed: missing courseId');
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }
    
    // Validate payment method specific fields
    if (paymentMethod === 'card') {
      if (!cardNumber || !expiry || !cvv || !cardName) {
        console.log('Validation failed: missing card details');
        return res.status(400).json({ success: false, message: 'All card details are required' });
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId && !upiMobile) {
        console.log('Validation failed: missing UPI details');
        return res.status(400).json({ success: false, message: 'UPI ID or mobile number is required' });
      }
    } else if (paymentMethod === 'netbanking') {
      if (!bankName || !accountId) {
        console.log('Validation failed: missing bank details');
        return res.status(400).json({ success: false, message: 'Bank name and account ID are required' });
      }
    } else {
      // Default to card if no payment method specified
      console.log('No payment method specified, defaulting to card');
    }
    
    // Validate courseId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.log('Validation failed: invalid courseId format', courseId);
      return res.status(400).json({ success: false, message: 'Invalid course ID format' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found:', courseId);
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    console.log('Course found:', course.title, 'Price:', course.price, 'Type:', course.courseType);
    
    if (course.courseType === 'free') {
      console.log('Course is free, no payment needed');
      return res.status(400).json({ success: false, message: 'Free course, no payment needed' });
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Determine payment method display text
    let paymentMethodText = paymentMethod || 'Card';
    if (paymentMethod === 'upi') {
      paymentMethodText = upiId ? `UPI (${upiId})` : `UPI (Mobile: ${upiMobile})`;
    } else if (paymentMethod === 'netbanking') {
      paymentMethodText = `Net Banking (${bankName})`;
    }

    // STEP 1: Try to send confirmation email (non-blocking - don't fail payment if email fails)
    console.log('Attempting to send payment confirmation email to:', userEmail);
    try {
      await sendPaymentSuccessEmail(userEmail, userName, course.title, course.price, paymentMethodText);
      console.log('Email sent successfully!');
    } catch (emailErr) {
      console.error('Email sending failed (non-blocking):', emailErr.message);
      // Continue with payment even if email fails
    }

    // STEP 2: Create purchase record
    console.log('Creating purchase record for course:', course.title, 'Amount:', course.price);
    
    // Map payment method to valid enum values
    let validPaymentMethod = 'Credit Card';
    if (paymentMethod === 'upi' || paymentMethodText.includes('UPI')) {
      validPaymentMethod = 'UPI';
    } else if (paymentMethod === 'netbanking' || paymentMethodText.includes('Net Banking')) {
      validPaymentMethod = 'Net Banking';
    } else if (paymentMethod === 'card' || paymentMethod === 'Credit Card') {
      validPaymentMethod = 'Credit Card';
    } else if (paymentMethod === 'Debit Card') {
      validPaymentMethod = 'Debit Card';
    }
    
    const purchase = await Purchase.create({
      student: studentId,
      course: new mongoose.Types.ObjectId(courseId),
      amount: course.price,
      status: 'completed',
      paymentMethod: validPaymentMethod
    });
    console.log('Purchase created:', purchase._id);
    
    // STEP 3: Auto-enroll user in course after payment
    let studentProfile = await StudentProfile.findOne({ user: studentId });
    if (!studentProfile) {
      console.log('Creating new student profile for user:', studentId);
      studentProfile = await StudentProfile.create({
        user: studentId,
        course: '' 
      });
    }
    
    // Check if already enrolled, if not create enrollment
    let enrollment = await Enrollment.findOne({
      student: studentProfile._id,
      course: new mongoose.Types.ObjectId(courseId)
    });
    
    if (!enrollment) {
      console.log('Creating new enrollment for user:', studentId, 'Course:', courseId);
      enrollment = await Enrollment.create({
        student: studentProfile._id,
        course: new mongoose.Types.ObjectId(courseId),
        progress: 0,
        completedChapters: [],
        completed: false
      });
      console.log('Enrollment created:', enrollment._id);
    } else {
      console.log('User already enrolled, updating enrollment');
    }

    console.log('Payment completed successfully');
    res.json({ 
      success: true, 
      message: 'Payment successful!',
      purchase,
      enrollment,
      courseId
    });
  } catch (err) {
    console.error('Payment error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Payment could not be completed. Please try again.' });
  }
});

// GET /api/courses/course-access/:courseId - Check if user can access course (MUST be before /:id)
router.get('/course-access/:courseId', verifyAuthToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Validate courseId
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      return res.status(400).json({ error: 'Invalid course ID' });
    }
    
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID format' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    // Free courses are always accessible
    if (course.courseType === 'free') return res.json({ access: true });

    // Check if user has purchased the course
    const purchase = await Purchase.findOne({
      userId: req.user.id,
      courseId: new mongoose.Types.ObjectId(courseId),
      paymentStatus: 'success'
    });

    // Also check if user is enrolled (created via payment)
    let isEnrolled = false;
    if (purchase) {
      const studentProfile = await StudentProfile.findOne({ user: req.user.id });
      if (studentProfile) {
        const enrollment = await Enrollment.findOne({
          student: studentProfile._id,
          course: new mongoose.Types.ObjectId(courseId)
        });
        isEnrolled = !!enrollment;
      }
    }

    // Access granted if purchased AND enrolled
    res.json({ access: !!(purchase || isEnrolled) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses/temp-upload-pdf - Upload PDF file (for course creation)
router.post('/temp-upload-pdf', verifyAuthToken, async (req, res) => {
  try {
    uploadCoursePdf.single('pdfFile')(req, res, async (err) => {
      if (err) {
        console.error("Temp PDF Upload Error:", err.message);
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      if (!isPdfFile(filePath)) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Invalid PDF file. File may be corrupted.' });
      }

      if (req.file.size === 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Empty file uploaded' });
      }

      console.log("Temp Uploaded File:", req.file);

      const pdfUrl = `/uploads/course-pdfs/${req.file.filename}`;
      res.json({ success: true, pdfFile: pdfUrl, pdfUrl });
    });
  } catch (err) {
    console.error("Temp upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/download/:filename - Download PDF file with proper headers
router.get('/download/:filename', verifyAuthToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(coursePdfsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/serve/:filename - Serve PDF file for inline viewing
router.get('/serve/:filename', verifyAuthToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(coursePdfsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  } catch (err) {
    console.error('Serve error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/:id - get one course by id (MUST be after specific routes)
router.get('/:id', async (req, res) => {
  try {
    // Guard: MongoDB crashes with CastError if id is not a valid ObjectId (e.g. 'mock')
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Course not found (invalid ID format)' });
    }
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/courses - Employee creates & submits a course for approval
router.post('/', verifyAuthToken, async (req, res) => {
  try {
    const {
      title, description, instructor, level, category, courseType, price,
      duration, thumbnail, chapters, pdfFile, pdfUrl
    } = req.body;

    if (!title || !description || !instructor) {
      return res.status(400).json({ message: 'Title, description, and instructor are required.' });
    }

    // Ensure price is a number
    const parsedPrice = typeof price === 'number' ? price : parseFloat(price) || 0;

    // Use JWT user info for createdBy - fallback to body value or user email/name
    const createdBy = req.user.email || req.user.name || req.body.createdBy || 'Unknown';

    const coursePdfUrl = pdfUrl || pdfFile || '';

    const course = await Course.create({
      title,
      description,
      instructor,
      level: level || 'Beginner',
      category: category || 'Development',
      courseType: courseType || 'free',
      price: parsedPrice,
      duration: duration || 'TBD',
      thumbnail: thumbnail || '',
      chapters: chapters || [],
      pdfFile: coursePdfUrl,
      pdfUrl: coursePdfUrl,
      status: req.user.role === 'admin' ? 'published' : 'pending_approval', // Require admin approval for non-admin users
      createdBy: createdBy
    });

    console.log("Course created with status:", req.user.role === 'admin' ? 'published' : 'pending_approval');
    console.log("Course created with PDF URL:", coursePdfUrl);

    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error('Course creation error:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/courses/:id - Update entire course (employee only)
router.put('/:id', verifyAuthToken, async (req, res) => {
  try {
    const allowedRoles = ['employee', 'company', 'admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Employee access only' });
    }

    const {
      title, description, instructor, level, category, courseType, price,
      duration, thumbnail, chapters, pdfFile, pdfUrl
    } = req.body;

    if (!title || !description || !instructor) {
      return res.status(400).json({ message: 'Title, description, and instructor are required.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the creator
    const userIdentity = req.user.email || req.user.name;
    if (course.createdBy !== userIdentity && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own courses' });
    }

    const parsedPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
    const coursePdfUrl = pdfUrl || pdfFile || course.pdfFile || '';

    course.title = title;
    course.description = description;
    course.instructor = instructor;
    course.level = level || 'Beginner';
    course.category = category || 'Development';
    course.courseType = courseType || 'free';
    course.price = parsedPrice;
    course.duration = duration || 'TBD';
    course.thumbnail = thumbnail || '';
    course.chapters = chapters || [];
    course.pdfFile = coursePdfUrl;
    course.pdfUrl = coursePdfUrl;

    await course.save();

    res.json({ success: true, course });
  } catch (err) {
    console.error('Course update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/courses/:id/status - Admin approves/rejects a course
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['draft', 'pending_approval', 'published'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:id/enrollment - Get current user's enrollment
router.get('/:id/enrollment', verifyAuthToken, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) return res.status(404).json({ message: 'Student profile not found' });

    const enrollment = await Enrollment.findOne({
      student: studentProfile._id,
      course: new mongoose.Types.ObjectId(req.params.id)
    });

    res.json(enrollment || { completedChapters: [], progress: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/courses/:id/enroll - Enroll or get existing enrollment
router.post('/:id/enroll', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate courseId
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }
    
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    let studentProfile = await StudentProfile.findOne({ user: req.user.id });
    
    if (!studentProfile) {
      console.log(`Safeguard: Creating missing StudentProfile for user ${req.user.id}`);
      studentProfile = await StudentProfile.create({
        user: req.user.id,
        course: '' 
      });
    }

    let enrollment = await Enrollment.findOne({
      student: studentProfile._id,
      course: new mongoose.Types.ObjectId(id)
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: studentProfile._id,
        course: new mongoose.Types.ObjectId(id),
        progress: 0,
        completedChapters: [],
        completed: false
      });
    }

    res.json({ success: true, enrollment, course });
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:id/with-progress - Get course with user progress
router.get('/:id/with-progress', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate courseId
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }
    
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    console.log("Course PDF:", course.pdfUrl, "pdfFile:", course.pdfFile, "courseNotes:", course.courseNotes);

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    let enrollment = null;
    let unlockedLessons = [];

    if (studentProfile) {
      enrollment = await Enrollment.findOne({
        student: studentProfile._id,
        course: new mongoose.Types.ObjectId(id)
      });
    }

    // Calculate unlocked lessons - first lesson always unlocked
    if (course.chapters && course.chapters.length > 0) {
      if (enrollment && enrollment.completedChapters) {
        // Unlock next lesson after each completed one
        const completedCount = enrollment.completedChapters.length;
        for (let i = 0; i <= completedCount && i < course.chapters.length; i++) {
          unlockedLessons.push(course.chapters[i].chapterId);
        }
      } else {
        // No enrollment - only first lesson unlocked
        unlockedLessons.push(course.chapters[0].chapterId);
      }
    }

    res.json({
      course,
      enrollment: enrollment || { completedChapters: [], progress: 0, lastOpenedLesson: 0 },
      unlockedLessons,
      lastOpenedLesson: enrollment?.lastOpenedLesson || 0
    });
  } catch (err) {
    console.error('Course with progress error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/courses/:id/upload-notes - Upload course notes PDF
router.post('/:id/upload-notes', verifyAuthToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    uploadCoursePdf.single('courseNotes')(req, res, async (err) => {
      if (err) {
        console.error("PDF Upload Error:", err.message);
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      if (!isPdfFile(filePath)) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Invalid PDF file. File may be corrupted.' });
      }

      if (req.file.size === 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Empty file uploaded' });
      }

      console.log("Uploaded File (upload-notes):", req.file);
      console.log("Course ID:", req.params.id);

      const notesUrl = `/uploads/course-pdfs/${req.file.filename}`;
      course.courseNotes = notesUrl;
      course.pdfUrl = notesUrl;
      await course.save();

      console.log("Course PDF URL saved:", notesUrl);

      res.json({ success: true, courseNotes: notesUrl, pdfUrl: notesUrl });
    });
  } catch (err) {
    console.error("Upload notes error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses/:id/upload-pdf - Upload course PDF file
router.post('/:id/upload-pdf', verifyAuthToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    uploadCoursePdf.single('pdfFile')(req, res, async (err) => {
      if (err) {
        console.error("PDF Upload Error (upload-pdf):", err.message);
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      if (!isPdfFile(filePath)) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Invalid PDF file. File may be corrupted.' });
      }

      if (req.file.size === 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Empty file uploaded' });
      }

      console.log("Uploaded File (upload-pdf):", req.file);
      console.log("Course ID:", req.params.id);

      const pdfUrl = `/uploads/course-pdfs/${req.file.filename}`;
      course.pdfFile = pdfUrl;
      course.pdfUrl = pdfUrl;
      await course.save();

      console.log("Course PDF URL saved:", pdfUrl);

      res.json({ success: true, pdfFile: pdfUrl, pdfUrl });
    });
  } catch (err) {
    console.error("Upload pdf error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/courses/:id/progress - Mark a chapter as complete with lesson unlocking
router.put('/:id/progress', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { chapterId, chapterIndex } = req.body;
    
    // Validate courseId
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) return res.status(404).json({ message: 'Student profile not found' });

    let enrollment = await Enrollment.findOne({
      student: studentProfile._id,
      course: new mongoose.Types.ObjectId(id)
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    const course = await Course.findById(id);
    if (!course || !course.chapters) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if lesson is locked
    const completedCount = enrollment.completedChapters.length;
    if (chapterIndex > completedCount) {
      return res.status(403).json({ message: 'This lesson is locked. Complete previous lessons first.' });
    }

    // Add chapter if not already completed
    if (!enrollment.completedChapters.includes(chapterId)) {
      enrollment.completedChapters.push(chapterId);

      const totalChapters = course.chapters.length;
      const progress = Math.round((enrollment.completedChapters.length / totalChapters) * 100);
      enrollment.progress = progress;

      if (progress === 100) {
        enrollment.completed = true;
        enrollment.completionDate = new Date();
      }
    }

    // Save last opened lesson
    enrollment.lastOpenedLesson = chapterIndex;
    await enrollment.save();

    // Calculate unlocked lessons for response
    const unlockedLessons = [];
    for (let i = 0; i <= enrollment.completedChapters.length && i < course.chapters.length; i++) {
      unlockedLessons.push(course.chapters[i].chapterId);
    }

    res.json({ 
      success: true, 
      enrollment,
      unlockedLessons,
      nextLessonIndex: enrollment.completedChapters.length < course.chapters.length 
        ? enrollment.completedChapters.length 
        : null
    });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/courses/:id/save-progress - Save last opened lesson without completing
router.put('/:id/save-progress', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { lessonIndex } = req.body;
    
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) return res.status(404).json({ message: 'Student profile not found' });

    const enrollment = await Enrollment.findOne({
      student: studentProfile._id,
      course: new mongoose.Types.ObjectId(id)
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    // Save last opened lesson
    enrollment.lastOpenedLesson = lessonIndex || 0;
    await enrollment.save();

    res.json({ 
      success: true, 
      lastOpenedLesson: enrollment.lastOpenedLesson
    });
  } catch (err) {
    console.error('Save progress error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/courses/:id/rate - Submit or update a rating
router.post('/:id/rate', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has completed the course
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(403).json({ message: 'You must be enrolled to rate this course' });
    }

    const enrollment = await Enrollment.findOne({
      student: studentProfile._id,
      course: new mongoose.Types.ObjectId(id)
    });

    if (!enrollment || !enrollment.completed) {
      return res.status(403).json({ message: 'You must complete the course to rate it' });
    }

    // Create or update rating
    let userRating = await Rating.findOne({
      courseId: new mongoose.Types.ObjectId(id),
      userId: req.user.id
    });

    if (userRating) {
      userRating.rating = rating;
      userRating.feedback = feedback || '';
      await userRating.save();
    } else {
      userRating = await Rating.create({
        courseId: new mongoose.Types.ObjectId(id),
        userId: req.user.id,
        rating,
        feedback: feedback || ''
      });
    }

    // Calculate average rating for the course
    const ratings = await Rating.find({ courseId: new mongoose.Types.ObjectId(id) });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    const totalRatings = ratings.length;

    // Update course with new average rating
    await Course.findByIdAndUpdate(id, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: totalRatings
    });

    res.json({ 
      success: true, 
      rating: userRating,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings
    });
  } catch (err) {
    console.error('Rating error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:id/ratings - Get all ratings for a course
router.get('/:id/ratings', async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const ratings = await Rating.find({ courseId: new mongoose.Types.ObjectId(id) })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;

    res.json({
      ratings,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length
    });
  } catch (err) {
    console.error('Get ratings error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:id/rating - Get user's rating for a course
router.get('/:id/rating', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const userRating = await Rating.findOne({
      courseId: new mongoose.Types.ObjectId(id),
      userId: req.user.id
    });

    res.json({ rating: userRating });
  } catch (err) {
    console.error('Get user rating error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/courses/:id/mcq-result - Save MCQ test result
router.post('/:id/mcq-result', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { score } = req.body;
    
    if (score === undefined || score < 0 || score > 10) {
      return res.status(400).json({ message: 'Valid score (0-10) is required' });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(403).json({ message: 'Student profile not found' });
    }

    const enrollment = await Enrollment.findOne({
      student: studentProfile._id,
      course: new mongoose.Types.ObjectId(id)
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    if (!enrollment.completed) {
      return res.status(403).json({ message: 'You must complete all lessons before taking the test' });
    }

    // Prevent multiple MCQ attempts
    if (enrollment.mcqCompleted) {
      return res.status(403).json({ message: 'You have already completed the MCQ test' });
    }

    enrollment.mcqCompleted = true;
    enrollment.mcqScore = score;
    await enrollment.save();

    res.json({ 
      success: true, 
      mcqCompleted: true,
      mcqScore: score
    });
  } catch (err) {
    console.error('MCQ result save error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:id/mcq-status - Get MCQ completion status
router.get('/:id/mcq-status', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.json({ mcqCompleted: false, mcqScore: 0 });
    }

    const enrollment = await Enrollment.findOne({
      student: studentProfile._id,
      course: new mongoose.Types.ObjectId(id)
    });

    if (!enrollment) {
      return res.json({ mcqCompleted: false, mcqScore: 0 });
    }

    res.json({ 
      mcqCompleted: enrollment.mcqCompleted || false,
      mcqScore: enrollment.mcqScore || 0
    });
  } catch (err) {
    console.error('MCQ status error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Course test questions cache (in-memory storage)
const courseTestCache = new Map();

// Initialize Gemini AI for MCQ generation
let genAI, geminiModel;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key');
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
} catch (err) {
  console.log('Gemini AI not configured, MCQ generation will use fallback');
}

// POST /api/courses/:id/generate-test - Generate MCQ test for a course
router.post('/:id/generate-test', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has completed the course
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(403).json({ message: 'Student profile not found' });
    }

    const enrollment = await Enrollment.findOne({
      student: studentProfile._id,
      course: new mongoose.Types.ObjectId(id)
    });

    if (!enrollment || !enrollment.completed) {
      return res.status(403).json({ message: 'You must complete the course to take the test' });
    }

    // Check if MCQ is already completed - prevent multiple attempts
    if (enrollment.mcqCompleted) {
      return res.status(403).json({ message: 'You have already completed the MCQ test' });
    }

    // Check cache first (use course ID as key)
    const cacheKey = `course_test_${id}`;
    if (courseTestCache.has(cacheKey)) {
      const cached = courseTestCache.get(cacheKey);
      return res.json({
        success: true,
        questions: cached.questions,
        fromCache: true
      });
    }

    // Generate MCQ questions using Gemini AI
    const courseTitle = course.title || '';
    const chapters = course.chapters || [];
    const lessonTitles = chapters.map(ch => ch.title).join(', ') || 'General topics';
    
    const prompt = `Generate 10 multiple choice questions for a course titled "${courseTitle}" covering topics: ${lessonTitles}.
    
    Requirements:
    - Total questions: 10
    - Each question must have exactly 4 options (A, B, C, D)
    - Only 1 correct answer per question
    - Difficulty: beginner to intermediate
    - Questions must be directly related to the course content
    
    Return ONLY a JSON array with objects containing:
    [
      {
        "question": "Question text here?",
        "optionA": "First option",
        "optionB": "Second option", 
        "optionC": "Third option",
        "optionD": "Fourth option",
        "correctAnswer": "A" (or B, C, D)
      }
    ]
    
    Do not include any other text, just the JSON array. Ensure valid JSON format.`;

    let questions;
    
    if (geminiModel) {
      try {
        const result = await geminiModel.generateContent(prompt);
        const response = result.response.text();
        
        // Parse JSON from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          questions = JSON.parse(response);
        }
        
        // Validate questions format
        if (!Array.isArray(questions) || questions.length < 10) {
          throw new Error('Invalid questions format');
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError.message);
        questions = getDefaultMCQ(courseTitle, lessonTitles);
      }
    } else {
      // Use fallback questions if AI not available
      questions = getDefaultMCQ(courseTitle, lessonTitles);
    }

    // Cache the generated questions
    courseTestCache.set(cacheKey, { questions });
    
    // Clean old cache entries (keep only last 50)
    if (courseTestCache.size > 50) {
      const firstKey = courseTestCache.keys().next().value;
      courseTestCache.delete(firstKey);
    }

    res.json({
      success: true,
      questions,
      fromCache: false
    });
  } catch (err) {
    console.error('Generate test error:', err);
    res.status(500).json({ message: 'Failed to generate test', error: err.message });
  }
});

// Helper function to get default MCQ questions
function getDefaultMCQ(courseTitle, lessonTitles) {
  const defaultQuestions = [
    {
      question: `What is the main purpose of "${courseTitle}"?`,
      optionA: "To learn the fundamentals",
      optionB: "To forget everything",
      optionC: "To skip the course",
      optionD: "To avoid practice",
      correctAnswer: "A"
    },
    {
      question: `Which of the following is typically covered in "${courseTitle}"?`,
      optionA: "Basic concepts",
      optionB: "Unrelated topics",
      optionC: "Advanced physics",
      optionD: "Cooking recipes",
      correctAnswer: "A"
    },
    {
      question: "What is the best way to learn from this course?",
      optionA: "Practice regularly",
      optionB: "Skip all lessons",
      optionC: "Don't take notes",
      optionD: "Ignore the content",
      correctAnswer: "A"
    },
    {
      question: "After completing this course, you should be able to:",
      optionA: "Apply the learned skills",
      optionB: "Forget everything",
      optionC: "Teach nothing",
      optionD: "Avoid the subject",
      correctAnswer: "A"
    },
    {
      question: "What is essential for success in this course?",
      optionA: "Active participation",
      optionB: "Passive listening only",
      optionC: "Skipping assignments",
      optionD: "Not engaging",
      correctAnswer: "A"
    },
    {
      question: "How should you approach the lessons in this course?",
      optionA: "With curiosity and practice",
      optionB: "With disinterest",
      optionC: "Without preparation",
      optionD: "Randomly",
      correctAnswer: "A"
    },
    {
      question: "What is key to mastering the topics in this course?",
      optionA: "Hands-on practice",
      optionB: "Memorization only",
      optionC: "Skipping exercises",
      optionD: "Not asking questions",
      correctAnswer: "A"
    },
    {
      question: "Which learning method works best for this course?",
      optionA: "Combining theory with practice",
      optionB: "Only reading",
      optionC: "Only watching videos",
      optionD: "Not engaging",
      correctAnswer: "A"
    },
    {
      question: "What should you do when you face challenges in this course?",
      optionA: "Seek help and practice more",
      optionB: "Give up immediately",
      optionC: "Ignore the problem",
      optionD: "Blame the course",
      correctAnswer: "A"
    },
    {
      question: "The primary goal of this course is to:",
      optionA: "Build practical skills and knowledge",
      optionB: "Waste time",
      optionC: "Create confusion",
      optionD: "Avoid learning",
      correctAnswer: "A"
    }
  ];
  
  return defaultQuestions;
}

module.exports = router;
