const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const CompanyProfile = require('../models/CompanyProfile');
const StudentProfile = require('../models/StudentProfile');
const Employee = require('../models/Employee');
const { protect, studentOnly } = require('../middleware/authMiddleware');

// Alias so all protected routes use the shared bulletproof middleware
const verifyToken = protect;

// GET /api/jobs — student portal: approved jobs only
router.get('/', async (req, res) => {
    try {
        const { search, location, type } = req.query;
        const filter = { status: 'approved' };
        if (type) filter.type = type;
        if (location) filter.location = { $regex: location, $options: 'i' };

        let jobs = await Job.find(filter)
            .populate('company', 'companyName logo location')
            .sort({ createdAt: -1 });

        if (search) {
            const s = search.toLowerCase();
            jobs = jobs.filter(j =>
                j.title.toLowerCase().includes(s) ||
                (j.company?.companyName || '').toLowerCase().includes(s)
            );
        }

        res.json(jobs.map(j => _formatJob(j)));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jobs/approved — explicit approved endpoint (student portal)
router.get('/approved', async (req, res) => {
    try {
        const { search, location, type } = req.query;
        const filter = { status: 'approved' };
        if (type) filter.type = type;
        if (location) filter.location = { $regex: location, $options: 'i' };

        let jobs = await Job.find(filter)
            .populate('company', 'companyName logo location')
            .sort({ createdAt: -1 });

        if (search) {
            const s = search.toLowerCase();
            jobs = jobs.filter(j =>
                j.title.toLowerCase().includes(s) ||
                (j.company?.companyName || '').toLowerCase().includes(s)
            );
        }

        res.json(jobs.map(j => _formatJob(j)));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// GET /api/jobs/company/me — get current company's all jobs with statuses
router.get('/company/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        // Find company profile
        let companyProfile = await CompanyProfile.findOne({ userId });
        if (!companyProfile) {
            // Get company info from Company model if available
            const Company = require('../models/Company');
            const company = await Company.findById(userId);
            
            companyProfile = await CompanyProfile.create({
                userId,
                companyName: company?.companyName || 'My Company',
                description: company?.description || 'Welcome to our company',
                location: company?.location || 'Location not set',
                website: company?.website || '',
                logo: company?.logo || 'https://placehold.co/150x150?text=Company',
                industry: company?.industry || ''
            });
        }

        // Find all jobs using $or query to match company, postedBy, or userId
        const jobs = await Job.find({
            $or: [
                { company: companyProfile._id },
                { company: userId },
                { postedBy: userId }
            ]
        })
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
            department: j.department,
            applicantCount: j.applicants?.length || 0
        }));

        res.json(result);
    } catch (err) {
        console.error('Company jobs error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jobs/employee/pending — all pending jobs for employee review queue
router.get('/employee/pending', verifyToken, async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'pending' })
            .populate('company', 'companyName logo location')
            .sort({ createdAt: -1 });

        res.json(jobs.map(j => ({
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
            applicantCount: j.applicants?.length || 0
        })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jobs/employee/:id — jobs reviewed by a specific employee
router.get('/employee/:id', verifyToken, async (req, res) => {
    try {
        const employeeId = req.params.id;

        const jobs = await Job.find({ reviewedBy: employeeId })
            .populate('company', 'companyName logo location')
            .populate('reviewedBy', 'name email')
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
            reviewedByName: j.reviewedBy?.name || 'Unknown'
        }));

        res.json(result);
    } catch (err) {
        console.error('Employee jobs error:', err);
        res.status(500).json({ message: err.message });
    }
});


// GET /api/jobs/admin — admin sees ALL jobs, filterable by ?status=
router.get('/admin', verifyToken, async (req, res) => {
    try {
        const userRole = req.user?.role?.toString().toLowerCase();
        if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required. Your role: ' + userRole });
        }

        const { status } = req.query;
        // No status param → return everything; otherwise filter by exact status value
        const filter = status ? { status } : {};

        const jobs = await Job.find(filter)
            .populate('company', 'companyName logo location')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

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
            reviewedByName: j.reviewedBy?.name || 'Unknown',
            submittedAt: j.submittedAt
        }));

        res.json(result);
    } catch (err) {
        console.error('Admin jobs error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jobs/admin/history — admin history for approved/rejected jobs
router.get('/admin/history', verifyToken, async (req, res) => {
    try {
        const userRole = req.user?.role?.toString?.()?.toLowerCase() || req.user?.role?.toLowerCase();
        if (userRole !== 'admin') {
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
            .populate('reviewedBy', 'name email')
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
            reviewedByName: j.reviewedBy?.name || 'Unknown',
            submittedAt: j.submittedAt
        }));

        res.json(result);
    } catch (err) {
        console.error('Admin history jobs error:', err);
        res.status(500).json({ message: err.message });
    }
});


// GET /api/jobs/employees/list — employees list for job assignment
router.get('/employees/list', async (req, res) => {
    try {
        const employees = await Employee.find().select('name department');
        res.json(employees.map(e => ({
            _id: e._id,
            name: e.name,
            department: e.department || 'General'
        })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jobs/admin/pending — jobs awaiting admin review
router.get('/admin/pending', verifyToken, async (req, res) => {
    try {
        const userRole = req.user?.role?.toString?.()?.toLowerCase() || req.user?.role?.toLowerCase();
        if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const jobs = await Job.find({ status: 'admin_review' })
            .populate('company', 'companyName logo location')
            .populate('reviewedBy', 'name email')
            .sort({ submittedAt: -1 });

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
            reviewedByName: j.reviewedBy?.name || 'Unknown',
            submittedAt: j.submittedAt
        }));

        res.json(result);
    } catch (err) {
        console.error('Admin pending jobs error:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/jobs/:id/assign — employee claims a job from the pending queue
router.put('/:id/assign', verifyToken, async (req, res) => {
    try {
        const employeeId = req.user?.id;
        if (!employeeId) return res.status(401).json({ message: 'Not authenticated' });

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (!['pending', 'employee_review'].includes(job.status)) {
            return res.status(400).json({ message: `Cannot assign a job with status '${job.status}'` });
        }

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            { reviewedBy: employeeId, status: 'employee_review' },
            { new: true }
        );
        res.json({ success: true, job: updatedJob });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/jobs/:id/submit-to-admin — any verified employee can submit a pending/in-review job
router.put('/:id/submit-to-admin', verifyToken, async (req, res) => {
    try {
        const employeeId = req.user?.id;
        if (!employeeId) return res.status(401).json({ message: 'Not authenticated' });

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Block only if already past employee stage — no ownership check
        const submittableStatuses = ['pending', 'employee_review'];
        if (!submittableStatuses.includes(job.status)) {
            return res.status(400).json({ message: `Job is already in '${job.status}' state and cannot be re-submitted` });
        }

        const { employeeNotes, note } = req.body;
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            {
                status: 'admin_review',
                reviewedBy: employeeId,
                employeeNotes: employeeNotes || note || '',
                submittedAt: new Date()
            },
            { new: true }
        );

        res.json({ success: true, message: 'Job submitted to admin for review', job: updatedJob });
    } catch (err) {
        console.error('Submit to admin error:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/jobs/:id/approve — admin approves job
router.put('/:id/approve', verifyToken, async (req, res) => {
    try {
        const userRole = req.user?.role?.toString?.()?.toLowerCase() || req.user?.role?.toLowerCase();
        if (userRole !== 'admin') {
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
        const userRole = req.user?.role?.toString?.()?.toLowerCase() || req.user?.role?.toLowerCase();
        if (userRole !== 'admin') {
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

// GET /api/jobs/applications/my-applications — get current user's applications
router.get('/applications/my-applications', protect, studentOnly, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        
        const applications = await Application.find({ studentUserId: userId })
            .populate('job')
            .sort({ createdAt: -1 });
        
        res.json(applications);
    } catch (err) {
        console.error('Fetch applications error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jobs/:id — single job details (public - limited company info)
router.get('/:id', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const job = await Job.findById(req.params.id)
            .populate('company', 'companyName logo location'); // Only expose public company info
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        // Return job with limited company information
        const sanitizedJob = {
            _id: job._id,
            title: job.title,
            location: job.location,
            salary: job.salary,
            type: job.type,
            description: job.description,
            requirements: job.requirements,
            department: job.department,
            status: job.status,
            createdAt: job.createdAt,
            // Only include safe company fields
            company: job.company ? {
                companyName: job.company.companyName,
                logo: job.company.logo,
                location: job.company.location
            } : null
        };
        
        res.json(sanitizedJob);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/jobs/:id/apply — student applies to a job
router.post('/:id/apply', protect, studentOnly, async (req, res) => {
    try {
        const userId = req.user._id.toString();

        // 1. Validate job exists and is open for applications
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.status !== 'approved') {
            return res.status(400).json({ message: 'This job is not accepting applications' });
        }

        // 2. Duplicate check against Application collection (source of truth)
        //    Also check job.applicants array as a secondary guard
        const existingApplication = await Application.findOne({
            job: job._id,
            $or: [
                { studentUserId: userId },
            ]
        });
        const alreadyInArray = job.applicants.some(a => a.user?.toString() === userId);
        if (existingApplication || alreadyInArray) {
            return res.status(400).json({ message: 'You have already applied for this job.' });
        }

        // 3. Resolve or create StudentProfile (never silently skip)
        let studentProfile = await StudentProfile.findOne({ user: userId });
        if (!studentProfile) {
            studentProfile = await StudentProfile.create({
                user: userId,
                course: req.user.course || ''
            });
        }

        // 4. Create Application record
        await Application.create({
            job: job._id,
            student: studentProfile._id,
            studentUserId: userId,
            status: 'Applied',
            coverLetter: req.body.coverLetter || ''
        });

        // 5. Sync applicants array on Job document
        job.applicants.push({ user: userId, status: 'Applied' });
        await job.save();

        res.json({ success: true, message: 'Application submitted!' });
    } catch (err) {
        console.error('Apply error:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/jobs — create a new job posting (company/admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const { title, company, location, salary, type, description, tags, department } = req.body;

        // Sync CompanyProfile from the Company model (new flow) so populate works
        const Company = require('../models/Company');
        const companyDoc = await Company.findById(userId);

        let companyProfile = await CompanyProfile.findOne({ userId });
        if (!companyProfile) {
            companyProfile = await CompanyProfile.create({
                userId,
                companyName: companyDoc?.companyName || company || 'My Company',
                description:  companyDoc?.description  || 'We are a great company',
                location:     companyDoc?.location     || location || 'Remote',
                website:      companyDoc?.website      || '',
                logo:         companyDoc?.logo         || '',
                industry:     companyDoc?.industry     || ''
            });
        } else if (companyDoc) {
            // Keep profile in sync with latest Company data
            companyProfile.companyName = companyDoc.companyName || companyProfile.companyName;
            companyProfile.logo        = companyDoc.logo        || companyProfile.logo;
            companyProfile.location    = companyDoc.location    || companyProfile.location;
            await companyProfile.save();
        }

        const newJob = await Job.create({
            title,
            company:      companyProfile._id,
            postedBy:     userId,
            location,
            salary,
            type,
            description,
            requirements: tags || [],
            department:   department || '',
            status:       'pending'  // Require admin approval - companies cannot auto-publish
        });

        console.log('✅ Job created with status: pending (awaiting admin approval)');
        res.status(201).json(newJob);
    } catch (err) {
        console.error('Create job error:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/jobs/:id — update an existing job posting
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });
        
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        const userRole = req.user?.role?.toString?.()?.toLowerCase() || req.user?.role?.toLowerCase();
        if (job.postedBy.toString() !== userId && userRole !== 'admin') {
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
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const userRole = req.user?.role?.toString?.()?.toLowerCase() || req.user?.role?.toLowerCase();
        if (job.postedBy.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to delete this job' });
        }

        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Job deleted' });
    } catch (err) {
        console.error('Delete job error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ─── Helpers ─────────────────────────────────────────────────
const JOB_COLORS = [
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-blue-500 to-cyan-600',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-amber-500 to-orange-600',
    'bg-gradient-to-br from-pink-500 to-rose-600'
];

function _formatJob(j) {
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
        color: JOB_COLORS[Math.floor(Math.random() * JOB_COLORS.length)],
        applicantCount: j.applicants?.length || 0
    };
}

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
