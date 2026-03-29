const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Employee = require('../models/Employee');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const AIInterviewSession = require('../models/AIInterviewSession');
const SupportTicket = require('../models/SupportTicket');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Rating = require('../models/Rating');
const Purchase = require('../models/Purchase');
const Notification = require('../models/Notification');
const StudentProfile = require('../models/StudentProfile');
const { sendAccountApprovalEmail, transporter } = require('../utils/email');
const adminController = require('../controllers/adminController');

// GET /api/admin/dashboard — real aggregate counts
router.get('/dashboard', async (req, res) => {
    try {
        const [totalUsers, activeJobs, totalApplications, totalInterviews, recentUsers] = await Promise.all([
            User.countDocuments(),
            Job.countDocuments({ status: 'Open' }),
            Application.countDocuments(),
            AIInterviewSession.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt')
        ]);

        res.json({
            stats: { totalUsers, activeJobs, totalApplications, totalInterviews },
            recentActivity: recentUsers.map(u => ({
                id: u._id,
                text: `${u.name} registered as ${u.role}`,
                time: u.createdAt,
                type: 'registration'
            }))
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/users — all users with profile info
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/tickets
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await SupportTicket.find().sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/admin/tickets — create a ticket (any user)
router.post('/tickets', async (req, res) => {
    try {
        const ticket = await SupportTicket.create(req.body);
        res.status(201).json(ticket);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/tickets/:id — update ticket status
router.put('/tickets/:id', async (req, res) => {
    try {
        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/admin/users/:id — remove a user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/users/:id/role — change user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['student', 'company', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/jobs — all jobs for admin view with company name populated
router.get('/jobs', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const jobs = await Job.find(filter)
            .populate('company', 'companyName logo location')
            .sort({ createdAt: -1 });
        const result = jobs.map(j => ({
            _id: j._id,
            title: j.title,
            company: j.company?.companyName || 'Unknown Company',
            companyDetails: j.company,
            location: j.location,
            salary: j.salary,
            type: j.type,
            status: j.status,
            department: j.department,
            applicantCount: j.applicants?.length || 0,
            createdAt: j.createdAt
        }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/admin/jobs/:id — remove a job posting
router.delete('/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/pending — list employees awaiting approval
router.get('/pending', async (req, res) => {
    try {
        const pendingUsers = await Employee.find({ isVerified: false })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(pendingUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/employees — list all employees (verified & unverified) for management
router.get('/employees', adminController.getEmployees);

// PUT /api/admin/users/:id/approve — approve an employee
router.put('/users/:id/approve', async (req, res) => {
    try {
        const user = await Employee.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'Employee not found' });

        console.log("Admin approved:", user.email);

        // Send approval email
        try {
            await sendAccountApprovalEmail(user.email, user.name);
            console.log("Approval email sent to:", user.email);
        } catch (emailError) {
            console.error("Email error:", emailError.message);
        }

        // Automated notification
        const notif = await Notification.create({
            recipientId: user._id,
            title: 'Account Approved!',
            message: 'Your employee account has been approved by an admin. You can now log in.',
            type: 'account_approval'
        });
        const io = req.app.get('socketio');
        if (io) {
            io.to(user._id.toString()).emit('new_notification', notif);
        }

        res.json({ message: `${user.name} approved successfully`, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/admin/users/:id/reject — reject & delete a pending employee
router.delete('/users/:id/reject', async (req, res) => {
    try {
        const user = await Employee.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: `${user.name}'s registration was rejected and removed` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// GET /api/admin/students/:id/resume - fetch a student's resume
router.get('/students/:id/resume', async (req, res) => {
    try {
        const studentId = req.params.id;
        const profile = await StudentProfile.findOne({ user: studentId }).select('resume resumeName -_id');

        if (!profile || !profile.resume) {
            return res.status(404).json({ message: 'Resume not found for this student' });
        }

        res.json({
            resume: profile.resume,
            resumeName: profile.resumeName
        });
    } catch (err) {
        console.error('Fetch resume error:', err);
        res.status(500).json({ message: 'Server error fetching resume' });
    }
});

// GET /api/admin/courses — get all courses created by employees
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        const coursesData = courses.map(course => {
            const createdDate = course.createdAt ? new Date(course.createdAt) : new Date();
            return {
                _id: course._id,
                courseId: course._id,
                title: course.title,
                description: course.description,
                instructor: course.instructor,
                createdBy: course.createdBy,
                category: course.category,
                level: course.level,
                courseType: course.courseType,
                price: course.price,
                duration: course.duration,
                thumbnail: course.thumbnail,
                pdfFile: course.pdfFile,
                chapters: course.chapters || [],
                totalLessons: course.chapters ? course.chapters.length : 0,
                createdDate: createdDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                createdTime: createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
                createdAt: course.createdAt,
                status: course.status
            };
        });
        res.json(coursesData);
    } catch (err) {
        console.error('Admin courses error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/courses/:id — get single course details
router.get('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        const createdDate = course.createdAt ? new Date(course.createdAt) : new Date();
        res.json({
            _id: course._id,
            courseId: course._id,
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            createdBy: course.createdBy,
            category: course.category,
            level: course.level,
            courseType: course.courseType,
            price: course.price,
            duration: course.duration,
            thumbnail: course.thumbnail,
            pdfFile: course.pdfFile,
            chapters: course.chapters || [],
            totalLessons: course.chapters ? course.chapters.length : 0,
            createdDate: createdDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            createdTime: createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            createdAt: course.createdAt,
            status: course.status
        });
    } catch (err) {
        console.error('Admin course details error:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/admin/courses/:id — delete a course permanently
router.delete('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error('Admin course delete error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/course-analytics — real-time course analytics (only from existing courses)
router.get('/course-analytics', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        const courseIds = new Set(courses.map(c => c._id.toString()));
        
        const enrollments = await Enrollment.find({ course: { $in: [...courseIds] } }).populate('course');
        const ratings = await Rating.find({ courseId: { $in: [...courseIds] } }).populate('courseId');
        const purchases = await Purchase.find({ 
            paymentStatus: 'success',
            courseId: { $in: [...courseIds] }
        });
        
        const totalCourses = courses.length;
        
        const uniqueEnrolledUsers = new Set(enrollments.map(e => e.student?.toString())).size;
        
        const paidCourseIds = new Set(courses.filter(c => c.courseType === 'paid').map(c => c._id.toString()));
        const paidPurchaseUserIds = new Set(purchases.map(p => p.userId?.toString()));
        
        const paidUsersSet = new Set();
        enrollments.forEach(e => {
            const courseId = e.course?._id?.toString();
            const studentId = e.student?.toString();
            if (courseId && studentId) {
                if (paidCourseIds.has(courseId) || paidPurchaseUserIds.has(studentId)) {
                    paidUsersSet.add(studentId);
                }
            }
        });
        const paidUsersCount = paidUsersSet.size;
        const freeUsersCount = Math.max(0, uniqueEnrolledUsers - paidUsersCount);
        
        const completedCount = enrollments.filter(e => e.completed).length;
        const runningCount = enrollments.filter(e => !e.completed && e.progress > 0).length;
        const incompleteCount = enrollments.filter(e => !e.completed && e.progress === 0).length;
        
        const courseRatings = {};
        ratings.forEach(r => {
            const courseId = r.courseId?._id?.toString();
            if (!courseId) return;
            if (!courseRatings[courseId]) {
                courseRatings[courseId] = { total: 0, count: 0, reviews: 0 };
            }
            courseRatings[courseId].total += r.rating;
            courseRatings[courseId].count += 1;
            courseRatings[courseId].reviews += 1;
        });
        
        let highestRatedCourse = { title: 'N/A', rating: 0 };
        let mostReviewedCourse = { title: 'N/A', reviews: 0 };
        let avgRatingSum = 0;
        let avgRatingCount = 0;
        
        Object.entries(courseRatings).forEach(([courseId, data]) => {
            const avg = data.total / data.count;
            avgRatingSum += avg;
            avgRatingCount += 1;
            const course = courses.find(c => c._id.toString() === courseId);
            if (avg > highestRatedCourse.rating) {
                highestRatedCourse = { title: course?.title || 'Unknown', rating: avg };
            }
            if (data.reviews > mostReviewedCourse.reviews) {
                mostReviewedCourse = { title: course?.title || 'Unknown', reviews: data.reviews };
            }
        });
        
        const averageRating = avgRatingCount > 0 ? (avgRatingSum / avgRatingCount).toFixed(1) : '0.0';
        
        const courseEnrollCount = {};
        enrollments.forEach(e => {
            const courseId = e.course?._id?.toString();
            if (!courseId) return;
            if (!courseEnrollCount[courseId]) {
                courseEnrollCount[courseId] = { enrolled: 0, completed: 0, views: 0 };
            }
            courseEnrollCount[courseId].enrolled += 1;
            if (e.completed) courseEnrollCount[courseId].completed += 1;
            courseEnrollCount[courseId].views += 1;
        });
        
        let mostEnrolledCourse = { title: 'N/A', count: 0 };
        let mostCompletedCourse = { title: 'N/A', count: 0 };
        let mostViewedCourse = { title: 'N/A', count: 0 };
        
        Object.entries(courseEnrollCount).forEach(([courseId, data]) => {
            const course = courses.find(c => c._id.toString() === courseId);
            if (data.enrolled > mostEnrolledCourse.count) {
                mostEnrolledCourse = { title: course?.title || 'Unknown', count: data.enrolled };
            }
            if (data.completed > mostCompletedCourse.count) {
                mostCompletedCourse = { title: course?.title || 'Unknown', count: data.completed };
            }
            if (data.views > mostViewedCourse.count) {
                mostViewedCourse = { title: course?.title || 'Unknown', count: data.views };
            }
        });
        
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        ratings.forEach(r => {
            const rounded = Math.round(r.rating);
            if (rounded >= 1 && rounded <= 5) {
                ratingDistribution[rounded] += 1;
            }
        });
        
        const courseAnalytics = courses.map(course => {
            const courseId = course._id.toString();
            const enrollmentData = courseEnrollCount[courseId] || { enrolled: 0, completed: 0 };
            const ratingData = courseRatings[courseId] || { total: 0, count: 0, reviews: 0 };
            const avgRating = ratingData.count > 0 ? (ratingData.total / ratingData.count).toFixed(1) : '0.0';
            const running = enrollmentData.enrolled - enrollmentData.completed;
            
            return {
                name: course.title,
                enrollments: enrollmentData.enrolled,
                completed: enrollmentData.completed,
                running: Math.max(0, running),
                incomplete: Math.max(0, enrollmentData.enrolled - enrollmentData.completed - Math.floor(enrollmentData.enrolled * 0.1)),
                rating: avgRating,
                reviews: ratingData.reviews
            };
        }).sort((a, b) => b.enrollments - a.enrollments);
        
        const enrollmentByCourse = courses.slice(0, 10).map(course => {
            const courseId = course._id.toString();
            const data = courseEnrollCount[courseId] || { enrolled: 0 };
            return {
                name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
                enrollments: data.enrolled
            };
        });
        
        res.json({
            overview: {
                totalCourses,
                totalEnrolledUsers: uniqueEnrolledUsers,
                paidUsers: paidUsersCount,
                freeUsers: freeUsersCount
            },
            progress: {
                completed: completedCount,
                running: runningCount,
                incomplete: incompleteCount
            },
            ratings: {
                highestRatedCourse,
                averageRating,
                mostReviewedCourse
            },
            demand: {
                mostEnrolledCourse,
                mostCompletedCourse,
                mostViewedCourse
            },
            charts: {
                ratingDistribution,
                enrollmentByCourse,
                progressDistribution: [
                    { name: 'Completed', value: completedCount, color: '#34d399' },
                    { name: 'Running', value: runningCount, color: '#60a5fa' },
                    { name: 'Incomplete', value: incompleteCount, color: '#f87171' }
                ]
            },
            courseAnalytics: courseAnalytics.slice(0, 10)
        });
    } catch (err) {
        console.error('Course analytics error:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/admin/reset-analytics — Reset all analytics data
router.post('/reset-analytics', async (req, res) => {
    try {
        const [enrollmentResult, ratingResult, purchaseResult] = await Promise.all([
            Enrollment.deleteMany({}),
            Rating.deleteMany({}),
            Purchase.deleteMany({})
        ]);

        console.log('Analytics data reset:', {
            enrollmentsDeleted: enrollmentResult.deletedCount,
            ratingsDeleted: ratingResult.deletedCount,
            purchasesDeleted: purchaseResult.deletedCount
        });

        res.json({
            success: true,
            message: 'Analytics data has been reset',
            deleted: {
                enrollments: enrollmentResult.deletedCount,
                ratings: ratingResult.deletedCount,
                purchases: purchaseResult.deletedCount
            }
        });
    } catch (err) {
        console.error('Reset analytics error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ─── COMPANY APPROVAL ROUTES ────────────────────────────────

// GET /api/admin/companies/pending — list companies awaiting approval
router.get('/companies/pending', async (req, res) => {
    try {
        const pending = await Company.find({ isVerified: false })
            .select('-password').sort({ createdAt: -1 });
        res.json(pending);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/companies — list all companies
router.get('/companies', async (req, res) => {
    try {
        const companies = await Company.find()
            .select('-password').sort({ createdAt: -1 });
        res.json(companies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/companies/:id/approve — approve a company
router.put('/companies/:id/approve', async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            { isVerified: true, approvedAt: new Date(), rejectionReason: '' },
            { new: true }
        ).select('-password');
        if (!company) return res.status(404).json({ message: 'Company not found' });

        // Send approval email
        try {
            await transporter.sendMail({
                from: `"Campus Recruit" <${process.env.EMAIL_USER}>`,
                to: company.email,
                subject: '🎉 Company Account Approved — CampusRecruit',
                html: `
    <div style="background-color: #0f172a; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #0a0e17; border-radius: 16px; padding: 40px 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #10b981; font-size: 26px; margin-top: 0; text-align: center; font-weight: 700;">Account Approved!</h1>
        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Hello ${company.name},</p>
        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Great news! Your company profile has been verified and approved by the Campus Recruit admin team.</p>
        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">You can now log in to your company portal to start posting jobs and connecting with top student talent.</p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="http://localhost:5173/company-login" style="background-color: #c084fc; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Login to Company Portal</a>
        </div>

        <hr style="border: none; border-top: 1px solid #334155; margin-bottom: 24px;" />

        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 8px;">Welcome to the Campus Recruit ecosystem.</p>
        <p style="color: #64748b; font-size: 13px; text-align: center; margin: 0;">&copy; 2026 Campus Recruit. All rights reserved.</p>
      </div>
    </div>`
            });
        } catch (emailErr) {
            console.error('Company approval email error:', emailErr.message);
        }

        // Notification via socket
        const notif = await Notification.create({
            recipientId: company._id,
            title: 'Company Account Approved!',
            message: `${company.companyName} has been approved. You can now log in.`,
            type: 'account_approval'
        });
        const io = req.app.get('socketio');
        if (io) io.to(company._id.toString()).emit('new_notification', notif);

        res.json({ message: `${company.companyName} approved successfully`, company });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/admin/companies/:id/reject — reject & delete a pending company
router.delete('/companies/:id/reject', async (req, res) => {
    try {
        const { reason } = req.body;
        const company = await Company.findById(req.params.id).select('-password');
        if (!company) return res.status(404).json({ message: 'Company not found' });

        // Send rejection email before deleting
        try {
            await transporter.sendMail({
                from: `"Campus Recruit" <${process.env.EMAIL_USER}>`,
                to: company.email,
                subject: 'Company Registration Update — Campus Recruit',
                html: `
    <div style="background-color: #0f172a; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #0a0e17; border-radius: 16px; padding: 40px 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #ef4444; font-size: 26px; margin-top: 0; text-align: center; font-weight: 700;">Registration Not Approved</h1>
        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Hello ${company.name},</p>
        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Unfortunately, <strong style="color: #f1f5f9;">${company.companyName}</strong>'s registration could not be approved at this time.</p>
        ${reason ? `<div style="background-color: #1e1b4b; border-radius: 12px; padding: 20px 24px; margin: 24px 0;"><p style="color: #fca5a5; font-size: 15px; margin: 0;"><strong style="color: #fecaca;">Reason:</strong> ${reason}</p></div>` : ''}
        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">Please contact our support team if you believe this is an error or if you'd like to reapply after addressing the concerns.</p>
        <hr style="border: none; border-top: 1px solid #334155; margin-bottom: 24px;" />
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 8px;">Thank you for your interest in Campus Recruit.</p>
        <p style="color: #64748b; font-size: 13px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Campus Recruit. All rights reserved.</p>
      </div>
    </div>`
            });
        } catch (emailErr) {
            console.error('Company rejection email error:', emailErr.message);
        }

        await Company.findByIdAndDelete(req.params.id);
        res.json({ message: `${company.companyName} rejected and removed` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
