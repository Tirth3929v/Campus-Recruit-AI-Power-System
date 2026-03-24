const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CompanyProfile = require('../models/CompanyProfile');
const AIInterviewSession = require('../models/AIInterviewSession');
const authController = require('../controllers/authController');
const companyController = require('../controllers/companyController');

// Company auth routes
router.post('/register', authController.companySignup);
router.post('/login', authController.companyLogin);

// Middleware to verify token for company routes
const verifyCompanyToken = (req, res, next) => {
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // Check localStorage token as fallback
        token = req.headers['x-company-token'];
    }

    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key');
        
        // For company role, user is in Company model
        if (verified.role === 'company') {
            const Company = require('../models/Company');
            Company.findById(verified.id).select('-password').then(company => {
                if (!company) return res.status(401).json({ message: 'Company not found' });
                req.user = company;
                next();
            }).catch(err => {
                console.error('Company lookup error:', err);
                return res.status(401).json({ message: 'Invalid token' });
            });
        } else {
            req.user = verified;
            next();
        }
    } catch (err) {
        console.error('Token verification error:', err.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// ═══════════════════════════════════════════════════════════
// CANDIDATE SOURCING ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/company/students - Get all students for candidate sourcing
router.get('/students', verifyCompanyToken, companyController.getAllStudents);

// GET /api/company/students/:id - Get single student details
router.get('/students/:id', verifyCompanyToken, companyController.getStudentById);

// GET /api/company/dashboard — company-specific stats
router.get('/dashboard', verifyCompanyToken, companyController.getCompanyDashboard);
// GET /api/company/students/:id/resume - fetch a student's resume
router.get('/students/:id/resume', verifyCompanyToken, async (req, res) => {
    try {
        const studentId = req.params.id;
        const StudentProfile = require('../models/StudentProfile');

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

// GET /api/company/applicants - fetch all applicants for the company's jobs
router.get('/applicants', verifyCompanyToken, companyController.getCompanyApplications);

// GET /api/company/jobs - fetch all jobs posted by the company
router.get('/jobs', verifyCompanyToken, companyController.getCompanyJobs);

// PATCH /api/company/profile - update company profile fields
router.patch('/profile', verifyCompanyToken, async (req, res) => {
    try {
        const Company = require('../models/Company');
        const { companyName, industry, location, website, employeeCount, description } = req.body;
        const company = await Company.findById(req.user._id);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        if (companyName !== undefined) company.companyName = companyName;
        if (industry !== undefined) company.industry = industry;
        if (location !== undefined) company.location = location;
        if (website !== undefined) company.website = website;
        if (employeeCount !== undefined) company.employeeCount = employeeCount;
        if (description !== undefined) company.description = description;

        await company.save();
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Company profile update error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
