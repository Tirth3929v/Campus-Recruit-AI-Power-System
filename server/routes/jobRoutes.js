const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const CompanyProfile = require('../models/CompanyProfile');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    const jwt = require('jsonwebtoken');
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    console.log('🔐 verifyToken - Token from cookie:', !!req.cookies.token, 'Token from header:', !!req.headers.authorization, 'Path:', req.path);
    console.log('🔐 Full auth header:', req.headers.authorization);
    
    if (!token) {
        console.log('🔴 No token provided, path:', req.path);
        return res.status(401).json({ error: 'Access denied - No token provided' });
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key');
        console.log('✅ Token verified. JWT payload:', JSON.stringify(verified), 'path:', req.path);
        
        const userId = verified.id || verified._id;
        if (!userId) {
            console.log('❌ No user ID in token, path:', req.path);
            return res.status(401).json({ error: 'Invalid token - no user ID' });
        }
        
        req.user = await User.findById(userId).select('-password');
        console.log('🧑 DB User:', JSON.stringify(req.user));
        
        if (!req.user) {
            console.log('❌ User not found in DB, path:', req.path);
            return res.status(401).json({ error: 'User not found' });
        }
        
        console.log('✅ req.user set:', req.user.email, 'role:', req.user.role);
        
        next();
    } catch (err) {
        console.error('❌ Token verify/DB fetch failed:', err.message, 'path:', req.path);
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

// GET /api/jobs — public listing of approved jobs (user portal) - KEPT FOR BACKWARD COMPAT
router.get('/', async (req, res) => {
    try {
        const { search, location, type } = req.query;
        const filter = { status: 'approved' };

        if (type) filter.type = type;
        if (location) filter.location = { $regex: location, $options: 'i' };

        let jobs = await Job.find(filter)
            .populate('company', 'companyName logo location')
            .sort({ createdAt: -1 });

        // Apply search filter on title/company name
        if (search) {
            const s = search.toLowerCase();
            jobs = jobs.filter(j =>
                j.title.toLowerCase().includes(s) ||
                (j.company?.companyName || '').toLowerCase().includes(s)
            );
        }

        // Map to frontend-friendly format
        const result = jobs.map(j => {
            const colors = [
                'bg-gradient-to-br from-violet-500 to-purple-600',
                'bg-gradient-to-br from-blue-500 to-cyan-600',
                'bg-gradient-to-br from-emerald-500 to-teal-600',
                'bg-gradient-to-br from-amber-500 to-orange-600',
                'bg-gradient-to-br from-pink-500 to-rose-600'
            ];
            return {
                id: j._id,
                title: j.title,
                company: j.company?.companyName || 'Unknown Company',
                location: j.location,
                salary: j.salary,
                type: j.type,
                posted: _timeAgo(j.createdAt),
                tags: j.requirements?.slice(0, 4) || [],
                description: j.description,
                logo: (j.company?.companyName || 'U').charAt(0),
                color: colors[Math.floor(Math.random() * colors.length)],
                applicantCount: j.applicants?.length || 0
            };
        });

        res.json(result);
    } catch (err) {
        console.error('Jobs listing error:', err);
        res.status(500).json({ message: err.message });
    }
});

// NEW: GET /api/jobs/approved — SPECIFIED ENDPOINT for approved jobs only (student portal)
router.get('/approved', async (req, res) => {
    try {
        const { search, location, type } = req.query;
        const filter = { status: "approved" };

        if (type) filter.type = type;
        if (location) filter.location = { $regex: location, $options: 'i' };

        let jobs = await Job.find(filter)
            .populate('company', 'companyName logo location')
            .sort({ createdAt: -1 });

        // Apply search filter on title/company name
        if (search) {
            const s = search.toLowerCase();
            jobs = jobs.filter(j =>
                j.title.toLowerCase().includes(s) ||
                (j.company?.companyName || '').toLowerCase().includes(s)
            );
        }

        // Map to frontend-friendly format (same as /jobs)
        const result = jobs.map(j => {
            const colors = [
                'bg-gradient-to-br from-violet-500 to-purple-600',
                'bg-gradient-to-br from-blue-500 to-cyan-600',
                'bg-gradient-to-br from-emerald-500 to-teal-600',
                'bg-gradient-to-br from-amber-500 to-orange-600',
                'bg-gradient-to-br from-pink-500 to-rose-600'
            ];
            return {
                id: j._id,
                title: j.title,
                company: j.company?.companyName || 'Unknown Company',
                location: j.location,
                salary: j.salary,
                type: j.type,
                posted: _timeAgo(j.createdAt),
                tags: j.requirements?.slice(0, 4) || [],
                description: j.description,
                logo: (j.company?.companyName || 'U').charAt(0),
                color: colors[Math.floor(Math.random() * colors.length)],
                applicantCount: j.applicants?.length || 0
            };
        });

        res.json(result);
    } catch (err) {
        console.error('Approved jobs listing error:', err);
        res.status(500).json({ message: err.message });
    }
});


// GET /api/jobs/company/me — get current company's all jobs with statuses
router.get('/company/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const companyProfile = await CompanyProfile.findOne({ userId });
        if (!companyProfile) return res.status(404).json({ message: 'Company profile not found' });

        const jobs = await Job.find({ company: companyProfile._id })
            .populate('company', 'companyName logo location')
            .sort({ createdAt: -1 });

        const result = jobs.map(j => ({
            _id: j._id,
            title: j.title,
            company: j.company?.companyName || 'Unknown Company',
            location: j.location,
            salary: j.salary,
            type: j.type,
            posted: _timeAgo(j.createdAt),
            tags: j.requirements || [],
            description: j.description,
            status: j.status,
            rejectionReason: j.rejectionReason || '',
            assignedEmployeeId: j.assignedEmployeeId,
            department: j.department,
            applicantCount: j.applicants?.length || 0
        }));

        res.json(result);
    } catch (err) {
        console.error('Company jobs error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jobs/company/:id — get company's all jobs with statuses
router.get('/company/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const companyProfile = await CompanyProfile.findOne({ userId });
        if (!companyProfile) return res.status(404).json({ message: 'Company profile not found' });

        const jobs = await Job.find({ company: companyProfile._id })
            .populate('company', 'companyName logo location')
            .sort({ createdAt: -1 });

        const result = jobs.map(j => ({
            _id: j._id,
            title: j.title,
            company: j.company?.companyName || 'Unknown Company',
            location: j.location,
            salary: j.salary,
            type: j.type,
            posted: _timeAgo(j.createdAt),
            tags: j.requirements || [],
            description: j.description,
            status: j.status,
            rejectionReason: j.rejectionReason || '',
            assignedEmployeeId: j.assignedEmployeeId,
            department: j.department,
            applicantCount: j.applicants?.length || 0
        }));

        res.json(result);
    } catch (err) {
        console.error('Company jobs error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jobs/employee/:id — get ALL jobs assigned to employee (all statuses for history)
router.get('/employee/:id', verifyToken, async (req, res) => {
    try {
        const employeeId = req.params.id;
        
        // Jobs where this employee is assigned - ALL STATUSES for complete history
        const jobs = await Job.find({ 
            assignedEmployeeId: employeeId
        })
            .populate('company', 'companyName logo location')
            .populate('assignedEmployeeId', 'name email')
            .sort({ updatedAt: -1 });

        const result = jobs.map(j => ({
            _id: j._id,
            title: j.title,
            company: j.company?.companyName || 'Unknown Company',
            companyDetails: j.company,
            location: j.location,
            salary: j.salary,
            type: j.type,
            posted: _timeAgo(j.createdAt),
            tags: j.requirements || [],
            description: j.description,
            status: j.status,
            department: j.department,
            employeeNotes: j.employeeNotes || '',
            rejectionReason: j.rejectionReason || '',
            approvedAt: j.approvedAt,
            assignedEmployeeName: j.assignedEmployeeId?.name || 'Unknown'
        }));

        res.json(result);
    } catch (err) {
        console.error('Employee jobs error:', err);
        res.status(500).json({ message: err.message });
    }
});


// GET /api/jobs/admin — get jobs awaiting admin review (task endpoint) - PENDING ONLY
router.get('/admin', verifyToken, async (req, res) => {
    try {
        console.log('========================================');
        console.log("🚀 /api/jobs/admin hit");
        console.log("📋 req.user object:", JSON.stringify(req.user));
        console.log("🔑 req.user.role:", req.user?.role, "type:", typeof req.user?.role);
        console.log("📊 User from DB - role field:", req.user?.role);
        console.log('========================================');
        
        const userRole = req.user?.role?.toString?.() || req.user?.role;
        console.log("🔍 Final role check:", userRole, "=== 'admin':", userRole === 'admin');
        
        if (userRole !== 'admin') {
            console.log("❌ Admin pending - Access denied, user role is:", userRole);
            return res.status(403).json({ message: 'Admin access required. Your role: ' + userRole });
        }

        console.log("✅ Admin access granted!");

        const jobs = await Job.find({ status: 'admin_review' })
            .populate('company', 'companyName logo location')
            .populate('assignedEmployeeId', 'name email')
            .sort({ submittedAt: -1, createdAt: -1 });

        console.log(`Found ${jobs.length} admin_review jobs`);

        const result = jobs.map(j => ({
            _id: j._id,
            title: j.title,
            company: j.company?.companyName || 'Unknown Company',
            companyDetails: j.company,
            location: j.location,
            salary: j.salary,
            type: j.type,
            posted: _timeAgo(j.createdAt),
            tags: j.requirements || [],
            description: j.description,
            status: j.status,
            department: j.department,
            employeeNotes: j.employeeNotes || '',
            assignedEmployeeName: j.assignedEmployeeId?.name || 'Unknown',
            submittedAt: j.submittedAt
        }));

        res.json(result);
    } catch (err) {
        console.error('Admin jobs error:', err);
        res.status(500).json({ message: err.message });
    }
});

// NEW: GET /api/jobs/admin/history — admin history for approved/rejected jobs
router.get('/admin/history', verifyToken, async (req, res) => {
    try {
        console.log('========================================');
        console.log('Admin history request - User:', req.user);
        console.log('Admin history request - User role:', req.user?.role);
        console.log('Admin history request - Full user object:', JSON.stringify(req.user));
        console.log('========================================');
        
        // More robust role check - handle both string and potential edge cases
        const userRole = req.user?.role?.toString?.() || req.user?.role;
        if (userRole !== 'admin') {
            console.log('Admin history - Access denied, user role is:', userRole, 'typeof:', typeof userRole);
            return res.status(403).json({ message: 'Admin access required. Current role: ' + userRole });
        }

        const { type } = req.query; // 'approved', 'rejected', or 'all'
        let filter = {};
        
        if (type === 'approved') {
            filter.status = 'approved';
        } else if (type === 'rejected') {
            filter.status = 'rejected';
        } else if (type === 'all') {
            filter.status = { $in: ['approved', 'rejected'] };
        } else {
            return res.status(400).json({ message: 'Query param "type" required: approved, rejected, or all' });
        }

        const jobs = await Job.find(filter)
            .populate('company', 'companyName logo location')
            .populate('assignedEmployeeId', 'name email')
            .sort({ updatedAt: -1 });

        const result = jobs.map(j => ({
            _id: j._id,
            title: j.title,
            company: j.company?.companyName || 'Unknown Company',
            companyDetails: j.company,
            location: j.location,
            salary: j.salary,
            type: j.type,
            posted: _timeAgo(j.createdAt),
            tags: j.requirements || [],
            description: j.description,
            status: j.status,
            department: j.department,
            employeeNotes: j.employeeNotes || '',
            rejectionReason: j.rejectionReason || '',
            approvedAt: j.approvedAt,
            assignedEmployeeName: j.assignedEmployeeId?.name || 'Unknown',
            submittedAt: j.submittedAt
        }));

        res.json(result);
    } catch (err) {
        console.error('Admin history jobs error:', err);
        res.status(500).json({ message: err.message });
    }
});


// GET /api/jobs/admin/pending — original endpoint
router.get('/admin/pending', verifyToken, async (req, res) => {
    try {
        console.log("========================================");
        console.log("Admin /admin/pending - User:", req.user);
        console.log("Admin /admin/pending - User role:", req.user?.role);
        console.log("Admin /admin/pending - Full user:", JSON.stringify(req.user));
        console.log('========================================');
        
        const userRole = req.user?.role?.toString?.() || req.user?.role;
        if (userRole !== 'admin') {
            console.log("Admin /admin/pending - Access denied, user role is:", userRole);
            return res.status(403).json({ message: 'Admin access required' });
        }

        const jobs = await Job.find({ status: 'admin_review' })
            .populate('company', 'companyName logo location')
            .populate('assignedEmployeeId', 'name email')
            .sort({ submittedAt: -1 });

        console.log(`Found ${jobs.length} admin_review jobs`);

        const result = jobs.map(j => ({
            _id: j._id,
            title: j.title,
            company: j.company?.companyName || 'Unknown Company',
            companyDetails: j.company,
            location: j.location,
            salary: j.salary,
            type: j.type,
            posted: _timeAgo(j.createdAt),
            tags: j.requirements || [],
            description: j.description,
            status: j.status,
            department: j.department,
            employeeNotes: j.employeeNotes || '',
            assignedEmployeeName: j.assignedEmployeeId?.name || 'Unknown',
            submittedAt: j.submittedAt
        }));

        res.json(result);
    } catch (err) {
        console.error('Admin pending jobs error:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/jobs/:id/submit-to-admin — employee submits job for admin review
router.put('/:id/submit-to-admin', verifyToken, async (req, res) => {
    try {
        console.log("Updating job to admin_review:", req.params.id);
        const employeeId = req.user?.id;
        if (!employeeId) return res.status(401).json({ message: 'Not authenticated' });

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.assignedEmployeeId?.toString() !== employeeId) {
            return res.status(403).json({ message: 'Not authorized to submit this job' });
        }

        const { employeeNotes, note } = req.body;
        
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            {
                status: 'admin_review',
                employeeNotes: employeeNotes || note || '',
                submittedAt: new Date()
            },
            { new: true }
        );

        console.log('UPDATED JOB STATUS:', updatedJob.status, 'Notes:', updatedJob.employeeNotes);

        res.json({ success: true, message: 'Job submitted to admin for review', job: updatedJob });
    } catch (err) {
        console.error('Submit to admin error:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/jobs/:id/approve — admin approves job
router.put('/:id/approve', verifyToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        job.status = 'approved';
        job.approvedAt = new Date();
        await job.save();

        res.json({ success: true, message: 'Job approved and now live', job });
    } catch (err) {
        console.error('Approve job error:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/jobs/:id/reject — admin rejects job
router.put('/:id/reject', verifyToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const { rejectionReason } = req.body;
        if (!rejectionReason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        job.status = 'rejected';
        job.rejectionReason = rejectionReason;
        await job.save();

        res.json({ success: true, message: 'Job rejected', job });
    } catch (err) {
        console.error('Reject job error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/employees — get all employees for company dropdown
router.get('/employees/list', async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee', isVerified: true })
            .select('name email course')
            .sort({ name: 1 });
        
        const result = employees.map(e => ({
            _id: e._id,
            name: e.name,
            email: e.email,
            department: e.course || 'General'
        }));

        res.json(result);
    } catch (err) {
        console.error('Employees list error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jobs/:id — single job details
router.get('/:id', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const job = await Job.findById(req.params.id)
            .populate('company', 'companyName logo location description website');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/jobs/:id/apply — student applies to a job
router.post('/:id/apply', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Check if already applied
        const alreadyApplied = job.applicants.some(a => a.user?.toString() === userId);
        if (alreadyApplied) return res.status(400).json({ message: 'Already applied to this job' });

        // Add to job applicants
        job.applicants.push({ user: userId, status: 'Applied' });
        await job.save();

        // Also create Application record
        const studentProfile = await StudentProfile.findOne({ user: userId });
        if (studentProfile) {
            await Application.create({
                job: job._id,
                student: studentProfile._id,
                status: 'Applied',
                coverLetter: req.body.coverLetter || ''
            });
        }

        res.json({ success: true, message: 'Application submitted!' });
    } catch (err) {
        console.error('Apply error:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/jobs — create a new job posting (company/admin only)
router.post('/', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const { title, company, location, salary, type, description, tags, assignedEmployeeId, department } = req.body;

        // Find or create company profile for this user
        let companyProfile = await CompanyProfile.findOne({ userId });
        if (!companyProfile) {
            companyProfile = await CompanyProfile.create({
                userId,
                companyName: company || 'My Company',
                description: 'We are a great company',
                location: location || 'Remote'
            });
        }

        const newJob = await Job.create({
            title,
            company: companyProfile._id,
            postedBy: userId,
            location,
            salary,
            type,
            description,
            requirements: tags || [],
            assignedEmployeeId: assignedEmployeeId || null,
            department: department || '',
            status: 'pending'
        });

        res.status(201).json(newJob);
    } catch (err) {
        console.error('Create job error:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/jobs/:id — update an existing job posting
router.put('/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });
        
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        if (job.postedBy.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to edit this job' });
        }

        const { title, location, salary, type, description, tags } = req.body;
        
        job.title = title || job.title;
        job.location = location || job.location;
        job.salary = salary || job.salary;
        job.type = type || job.type;
        job.description = description || job.description;
        if (tags) job.requirements = tags;
        
        await job.save();
        res.json(job);
    } catch (err) {
        console.error('Update job error:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/jobs/:id — delete a job posting
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.postedBy.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to delete this job' });
        }

        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Job deleted' });
    } catch (err) {
        console.error('Delete job error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Helper: time ago
function _timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

module.exports = router;
