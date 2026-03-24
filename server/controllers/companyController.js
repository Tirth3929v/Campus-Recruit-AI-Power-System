const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Get all students for candidate sourcing
// @route   GET /api/company/students
// @access  Private (Company only)
const getAllStudents = async (req, res) => {
    try {
        const { skill, search, page = 1, limit = 20 } = req.query;

        // Build the query
        let query = { role: 'student' };

        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Get total count for pagination
        const total = await User.countDocuments(query);

        // Find students with pagination
        const students = await User.find(query)
            .select('-password -__v -otp -otpExpires -resetPasswordToken -resetPasswordExpire')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // For each student, get their profile and completed courses
        const studentsWithDetails = await Promise.all(
            students.map(async (student) => {
                // Get student profile
                const profile = await StudentProfile.findOne({ user: student._id })
                    .select('-__v');

                // Get completed courses for this student
                const enrollments = await Enrollment.find({ 
                    student: profile?._id,
                    completed: true
                }).populate('course', 'title category thumbnail');

                return {
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                    role: student.role,
                    isVerified: student.isVerified,
                    createdAt: student.createdAt,
                    // Profile data
                    profile: profile ? {
                        phone: profile.phone,
                        course: profile.course,
                        bio: profile.bio,
                        skills: profile.skills || [],
                        cgpa: profile.cgpa,
                        graduationYear: profile.graduationYear,
                        resume: profile.resume,
                        resumeName: profile.resumeName
                    } : null,
                    // Completed courses
                    completedCourses: enrollments
                        .filter(e => e.course)
                        .map(e => ({
                            _id: e.course._id,
                            title: e.course.title,
                            category: e.course.category,
                            thumbnail: e.course.thumbnail,
                            completionDate: e.completionDate
                        }))
                };
            })
        );

        // Filter by skill if provided (post-query filtering for more accurate results)
        let filteredStudents = studentsWithDetails;
        if (skill) {
            filteredStudents = studentsWithDetails.filter(s => 
                s.profile?.skills?.some(s => 
                    s.toLowerCase().includes(skill.toLowerCase())
                )
            );
        }

        res.status(200).json({
            success: true,
            count: filteredStudents.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: filteredStudents
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching students' 
        });
    }
};

// @desc    Get single student profile for company
// @route   GET /api/company/students/:id
// @access  Private (Company only)
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the student user
        const student = await User.findOne({ _id: id, role: 'student' })
            .select('-password -__v -otp -otpExpires -resetPasswordToken -resetPasswordExpire');

        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }

        // Get student profile
        const profile = await StudentProfile.findOne({ user: student._id })
            .select('-__v');

        // Get all enrollments (completed and in-progress)
        const enrollments = await Enrollment.find({ student: profile._id })
            .populate('course', 'title category thumbnail description level');

        // Separate completed and in-progress courses
        const completedCourses = enrollments
            .filter(e => e.completed && e.course)
            .map(e => ({
                _id: e.course._id,
                title: e.course.title,
                category: e.course.category,
                thumbnail: e.course.thumbnail,
                completionDate: e.completionDate,
                progress: 100
            }));

        const inProgressCourses = enrollments
            .filter(e => !e.completed && e.course)
            .map(e => ({
                _id: e.course._id,
                title: e.course.title,
                category: e.course.category,
                thumbnail: e.course.thumbnail,
                progress: e.progress
            }));

        res.status(200).json({
            success: true,
            data: {
                _id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
                isVerified: student.isVerified,
                createdAt: student.createdAt,
                profile: profile ? {
                    phone: profile.phone,
                    course: profile.course,
                    bio: profile.bio,
                    skills: profile.skills || [],
                    cgpa: profile.cgpa,
                    graduationYear: profile.graduationYear,
                    resume: profile.resume,
                    resumeName: profile.resumeName
                } : null,
                completedCourses,
                inProgressCourses
            }
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching student' 
        });
    }
};

// @desc    Get all applications for company's jobs (from embedded applicants array)
// @route   GET /api/company/applicants
// @access  Private (Company only)
const getCompanyApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const Job = require('../models/Job');
        const CompanyProfile = require('../models/CompanyProfile');
        const StudentProfile = require('../models/StudentProfile');

        // Find company profile to get companyId
        const companyProfile = await CompanyProfile.findOne({ userId });

        // Find all jobs owned by this company
        const jobs = await Job.find({
            $or: [
                { company: userId },
                { company: companyProfile?._id },
                { postedBy: userId }
            ]
        }).sort({ createdAt: -1 });

        // Extract all applicants from embedded arrays
        const allApplicants = [];
        for (const job of jobs) {
            if (job.applicants && job.applicants.length > 0) {
                for (const applicant of job.applicants) {
                    // Get user details
                    const user = await User.findById(applicant.user).select('name email');
                    // Get student profile for skills and resume
                    const studentProfile = await StudentProfile.findOne({ user: applicant.user }).select('skills resume resumeName');

                    allApplicants.push({
                        _id: applicant._id,
                        studentId: applicant.user,
                        name: user?.name || 'Unknown',
                        email: user?.email || 'N/A',
                        role: job.title,
                        score: 0,
                        status: applicant.status?.toLowerCase() || 'applied',
                        skills: studentProfile?.skills || [],
                        resume: studentProfile?.resume,
                        applied: new Date(applicant.appliedAt).toLocaleDateString()
                    });
                }
            }
        }

        return res.status(200).json(allApplicants);
    } catch (error) {
        console.error('Error fetching company applications:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching applications' 
        });
    }
};

// @desc    Get company jobs
// @route   GET /api/company/jobs
// @access  Private (Company only)
const getCompanyJobs = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const companyId = req.user.companyId || userId;
        const Job = require('../models/Job');
        const CompanyProfile = require('../models/CompanyProfile');

        // Find company profile to get companyId
        const companyProfile = await CompanyProfile.findOne({ userId });

        // Ultra-safe query that checks all possible ID locations
        const jobs = await Job.find({ 
            $or: [
                { company: userId }, 
                { company: companyId },
                { company: companyProfile?._id }, 
                { postedBy: userId },
                { postedBy: companyId }
            ] 
        })
        .populate('company', 'companyName logo location')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        console.error('Error fetching company jobs:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error fetching jobs' 
        });
    }
};

// @desc    Get company dashboard stats
// @route   GET /api/company/dashboard
// @access  Private (Company only)
const getCompanyDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const Job = require('../models/Job');
        const CompanyProfile = require('../models/CompanyProfile');
        const AIInterviewSession = require('../models/AIInterviewSession');

        // Find company profile to get companyId
        const companyProfile = await CompanyProfile.findOne({ userId });

        // Find all jobs owned by this company
        const jobs = await Job.find({
            $or: [
                { company: userId },
                { company: companyProfile?._id },
                { postedBy: userId }
            ]
        }).sort({ createdAt: -1 });

        // Calculate active jobs
        const activeJobs = jobs.filter(j => j.status === 'approved' || j.status === 'Open').length;

        // Calculate total applicants from embedded arrays
        const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicants ? job.applicants.length : 0), 0);

        // Extract job IDs for interview count
        const jobIds = jobs.map(j => j._id);
        const scheduledInterviews = await AIInterviewSession.countDocuments({
            job: { $in: jobIds },
            status: { $in: ['NotStarted', 'InProgress'] }
        });

        // Get recent applicants from embedded arrays
        const allApplicants = [];
        for (const job of jobs) {
            if (job.applicants && job.applicants.length > 0) {
                for (const applicant of job.applicants) {
                    allApplicants.push({
                        ...applicant.toObject(),
                        jobTitle: job.title,
                        jobId: job._id
                    });
                }
            }
        }

        // Sort by appliedAt and get top 5
        allApplicants.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        const recentApplicantsList = allApplicants.slice(0, 5);

        // Fetch user details for recent applicants
        const recentApps = await Promise.all(recentApplicantsList.map(async (app) => {
            const user = await User.findById(app.user).select('name');
            return {
                id: app._id,
                name: user?.name || 'Unknown',
                role: app.jobTitle || 'N/A',
                date: app.appliedAt,
                status: app.status?.toLowerCase() || 'applied',
                avatar: user?.name?.charAt(0).toUpperCase() || 'U'
            };
        }));

        // Get active job postings with applicant counts
        const activeJobPostings = jobs
            .filter(j => j.status === 'approved' || j.status === 'Open')
            .map(j => ({
                id: j._id,
                title: j.title,
                applicants: j.applicants ? j.applicants.length : 0,
                posted: j.createdAt,
                status: 'Active'
            }));

        res.json({
            stats: [
                { label: "Active Jobs", value: activeJobs, icon: "Briefcase", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10", accent: "from-amber-500 to-orange-500" },
                { label: "Total Applicants", value: totalApplicants, icon: "Users", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10", accent: "from-blue-500 to-cyan-500" },
                { label: "Interviews Scheduled", value: scheduledInterviews, icon: "Calendar", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-100 dark:bg-teal-500/10", accent: "from-teal-500 to-pink-500" },
                { label: "Avg. Time to Hire", value: 12, suffix: " days", icon: "TrendingUp", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", accent: "from-emerald-500 to-teal-500" }
            ],
            recentApplications: recentApps,
            activeJobs: activeJobPostings,
            totalApplicants
        });
    } catch (error) {
        console.error('Company dashboard error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    getCompanyApplications,
    getCompanyJobs,
    getCompanyDashboard
};
