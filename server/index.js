require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');

// Helper to set role-specific auth cookie
const setAuthCookie = (res, token, role) => {
    const cookieNames = { admin: 'admin_token', employee: 'employee_token', company: 'company_token', student: 'student_token' };
    const cookieName = cookieNames[role] || 'student_token';
    res.cookie(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
};

// Import models from /models (single source of truth)
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const AIInterviewSession = require('./models/AIInterviewSession');
const StudyResource = require('./models/StudyResource');
const LegacyInterview = require('./models/LegacyInterview');
const Enrollment = require('./models/Enrollment');

// Initialize email transporter
const { sendOTPEmail, sendAccountApprovalEmail, sendOTPForPasswordReset } = require('./utils/email');

const app = express();
const authController = require('./controllers/authController');
const PORT = process.env.PORT || 5000;
// Triggering nodemon restart to re-establish MongoDB connection

// Middleware
app.get('env'); // Force env check
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    systemInstruction: "You are a helpful, encouraging Placement Assistant and Technical Tutor for Campus Recruit. Answer questions about coding, interviews, and platform navigation concisely."
});

// Connect to MongoDB using robust db.js
const connectDB = require('./config/db');

// Main Startup function
const startServer = async (port = PORT) => {
    try {
        await connectDB();
        console.log('🗄️  Connected DB Name:', mongoose.connection.name);
        
        const maxRetries = 3;
        let currentPort = port;
        let started = false;
        
        for (let attempt = 0; attempt < maxRetries && !started; attempt++) {
            try {
                await new Promise((resolve, reject) => {
                    const serverInstance = server.listen(currentPort, () => {
                        console.log(`🚀 Server fully initialized and listening on port ${currentPort}`);
                        resolve();
                    });
                    serverInstance.on('error', (err) => {
                        reject(err);
                    });
                });
                started = true;
            } catch (err) {
                if (err.code === 'EADDRINUSE') {
                    console.log(`⚠️ Port ${currentPort} is in use, trying port ${currentPort + 1}...`);
                    currentPort++;
                } else {
                    throw err;
                }
            }
        }
        
        if (!started) {
            throw new Error('Could not find available port');
        }
    } catch (err) {
        console.error('💥 FATAL: Server failed to start:', err.message);
        process.exit(1);
    }
};

// Main Startup logic moved to the bottom of the file to ensure 'server' is defined


// ─── Auth Middleware ──────────────────────────────────────────
const verifyToken = (req, res, next) => {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) return res.status(401).json({ error: 'Access denied - No token provided' });
    
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key');
        req.user = verified;
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

const optionalAuth = (req, res, next) => {
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key');
        } catch (err) { /* ignore silently for optional */ }
    }
    next();
};

// ─── Routes ──────────────────────────────────────────────────

// 1. AI Chat Route
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ text: "Server Error: AI configuration missing." });
        }
        const chatHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        res.json({ text: response.text() });
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        res.status(500).json({ text: "I'm having trouble connecting to the AI right now. Please try again later." });
    }
});

// 2. Student Dashboard — real data from DB
app.get('/api/dashboard', verifyToken, async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            const Student = require('./models/Student');
            user = await Student.findById(req.user.id);
        }
        if (!user) return res.status(401).json({ error: "User not found" });

        const studentProfile = await StudentProfile.findOne({ user: req.user.id });

        // Get most recently updated active enrollment for "My Learning" widget
        let inProgressCourse = null;
        let totalEnrolledCourses = 0;
        
        if (studentProfile) {
            const enrollments = await Enrollment.find({ student: studentProfile._id }).populate('course');
            totalEnrolledCourses = enrollments.length;
            
            const activeEnrollment = enrollments
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

            if (activeEnrollment && activeEnrollment.course) {
                inProgressCourse = {
                    courseId: activeEnrollment.course._id,
                    title: activeEnrollment.course.title,
                    thumbnail: activeEnrollment.course.thumbnail || '',
                    level: activeEnrollment.course.level || 'Beginner',
                    progress: activeEnrollment.progress || 0,
                    completedChapters: activeEnrollment.completedChapters || [],
                    chaptersTotal: activeEnrollment.course.chapters?.length || 0,
                    chapters: activeEnrollment.course.chapters || []
                };
            }
        }

        // AI Interview sessions
        const sessions = await AIInterviewSession.find({ user: req.user.id });
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.status === 'Completed' || s.status === 'Evaluated');
        const avgScore = completedSessions.length > 0
            ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length)
            : 0;

        // Interviews this week
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const interviewsThisWeek = sessions.filter(s => new Date(s.createdAt) >= startOfWeek).length;

        // Recent activity from AI sessions
        const recentSessions = await AIInterviewSession.find({ user: req.user.id })
            .sort({ createdAt: -1 }).limit(3);
        const recentActivity = recentSessions.map(s => ({
            id: s._id,
            date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            subject: s.focusAreas?.[0] || s.sessionType || 'General',
            score: s.overallScore || 0,
            status: s.overallScore >= 80 ? 'Excellent' : s.overallScore >= 60 ? 'Good' : 'Needs Work'
        }));

        // Also check legacy interview model
        const legacyInterviews = await LegacyInterview.find({ userId: req.user.id });
        const combinedTotal = totalSessions + legacyInterviews.length;
        const legacyAvg = legacyInterviews.length > 0
            ? Math.round(legacyInterviews.reduce((s, i) => s + (i.score || 0), 0) / legacyInterviews.length)
            : 0;
        const finalAvg = combinedTotal > 0
            ? Math.round((avgScore * totalSessions + legacyAvg * legacyInterviews.length) / combinedTotal)
            : 0;

        // Legacy recent activity (merge if needed)
        if (recentActivity.length < 3) {
            const legacyRecent = await LegacyInterview.find({ userId: req.user.id }).sort({ _id: -1 }).limit(3 - recentActivity.length);
            legacyRecent.forEach(i => {
                recentActivity.push({
                    id: i._id,
                    date: i.date,
                    subject: i.subject,
                    score: i.score,
                    status: i.status || (i.score >= 80 ? 'Excellent' : i.score >= 60 ? 'Good' : 'Needs Work')
                });
            });
        }

        // Skills from sessions
        const skillMap = {};
        completedSessions.forEach(s => {
            (s.focusAreas || []).forEach(area => {
                if (!skillMap[area]) skillMap[area] = { total: 0, count: 0 };
                skillMap[area].total += s.overallScore || 0;
                skillMap[area].count += 1;
            });
        });
        const skills = Object.entries(skillMap).map(([subject, data]) => ({
            subject,
            A: Math.round(data.total / data.count),
            fullMark: 150
        }));
        const finalSkills = skills.length >= 3 ? skills : [
            { subject: 'Technical', A: Math.min(finalAvg + 20, 150), fullMark: 150 },
            { subject: 'Communication', A: Math.min(finalAvg + 5, 150), fullMark: 150 },
            { subject: 'Problem Solving', A: Math.min(finalAvg + 10, 150), fullMark: 150 },
            { subject: 'Confidence', A: Math.min(finalAvg + 15, 150), fullMark: 150 },
            { subject: 'Logic', A: Math.min(finalAvg, 150), fullMark: 150 },
        ];

        // Leaderboard
        const leaderboardData = await AIInterviewSession.aggregate([
            { $match: { status: { $in: ['Completed', 'Evaluated'] } } },
            { $group: { _id: '$user', averageScore: { $avg: '$overallScore' }, count: { $sum: 1 } } },
            { $sort: { averageScore: -1 } },
            { $limit: 5 }
        ]);
        const leaderboard = await Promise.all(leaderboardData.map(async (entry) => {
            try {
                const lbUser = await User.findById(entry._id);
                return {
                    name: lbUser ? lbUser.name : "Unknown",
                    course: lbUser ? (lbUser.course || 'N/A') : "N/A",
                    score: Math.round(entry.averageScore)
                };
            } catch (e) { return null; }
        }));

        res.json({
            user: {
                name: user.name,
                course: user.course || studentProfile?.course || 'N/A',
                readiness: finalAvg > 0 ? Math.min(finalAvg + 10, 100) : 50,
                weeklyGoal: studentProfile?.weeklyGoal || 3,
                streak: user.currentStreak || studentProfile?.streak || 0
            },
            stats: [
                { label: "Total Courses", value: totalEnrolledCourses, icon: "BookOpen", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-100 dark:bg-teal-500/10", accent: "from-teal-500 to-pink-500" },
                { label: "Total Interviews", value: combinedTotal, icon: "Activity", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10", accent: "from-blue-500 to-cyan-500" },
                { label: "Average Score", value: finalAvg, suffix: "%", icon: "Target", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10", accent: "from-amber-500 to-orange-500" },
                { label: "Hours Practiced", value: ((combinedTotal * 0.5)).toFixed(1), suffix: " hrs", icon: "Clock", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", accent: "from-emerald-500 to-teal-500" }
            ],
            skills: finalSkills,
            interviewsThisWeek,
            recentActivity,
            leaderboard: leaderboard.filter(l => l !== null),
            inProgressCourse,
            totalEnrolledCourses
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: "Server Error" });
    }
});

// 3. User Profile — real data from DB
// 3. User Profile
app.get(['/api/user', '/api/user/profile'], verifyToken, async (req, res) => {
    try {
        let user = await User.findById(req.user.id).select('-password');
        if (!user) {
            const Student = require('./models/Student');
            user = await Student.findById(req.user.id).select('-password');
        }
        if (!user) return res.status(401).json({ error: 'User not found' });
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            course: user.course || studentProfile?.course || '',
            bio: studentProfile?.bio || '',
            phone: studentProfile?.phone || '',
            skills: studentProfile?.skills || [],
            resume: studentProfile?.resume || '',
            resumeName: studentProfile?.resumeName || '',
            cgpa: studentProfile?.cgpa || 0,
            graduationYear: studentProfile?.graduationYear || 0,
            streak: user.currentStreak || studentProfile?.streak || 0,
            weeklyGoal: studentProfile?.weeklyGoal || 2
        });
    } catch (err) {
        console.error('User profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put(['/api/user', '/api/user/profile'], verifyToken, async (req, res) => {
    try {
        const { name, course, bio, skills, resumeName, resume } = req.body;

        let user = await User.findById(req.user.id);
        let fromStudentCollection = false;
        if (!user) {
            const Student = require('./models/Student');
            user = await Student.findById(req.user.id);
            fromStudentCollection = true;
        }
        if (!user) return res.status(401).json({ error: 'User not found' });

        if (name) user.name = name;
        if (course) user.course = course;
        await user.save();

        let parsedSkills = [];
        if (Array.isArray(skills)) {
            parsedSkills = skills;
        } else if (typeof skills === 'string') {
            parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        const profileData = {
            course: course || user.course,
            bio: bio !== undefined ? bio : undefined,
            skills: parsedSkills.length > 0 ? parsedSkills : undefined,
            resumeName: resumeName !== undefined ? resumeName : undefined,
            resume: resume !== undefined ? resume : undefined
        };

        // Remove undefined fields
        Object.keys(profileData).forEach(key => profileData[key] === undefined && delete profileData[key]);

        const studentProfile = await StudentProfile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileData },
            { new: true, upsert: true }
        );

        res.json({ success: true, user, studentProfile });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4a. User Login (Student - checks both User and Student collections)
app.post('/api/auth/user-login', async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ message: 'Request body is required' });

        const emailInput = req.body.email;
        if (!emailInput || typeof emailInput !== 'string')
            return res.status(400).json({ message: 'Email is required' });

        const email = emailInput.trim().toLowerCase();
        const { password } = req.body;
        if (!password) return res.status(400).json({ message: 'Password is required' });

        // ── Check User collection first, then Student collection as fallback ──
        const Student = require('./models/Student');
        let account = await User.findOne({ email }).select('+password');
        let fromCollection = 'users';
        if (!account) {
            account = await Student.findOne({ email }).select('+password');
            fromCollection = 'students';
        }

        console.log(`Login [${email}]: found in '${account ? fromCollection : 'neither'}' collection`);

        if (!account) {
            return res.status(401).json({ error: 'User not found. Please register an account first.' });
        }

        const isMatch = await account.matchPassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Incorrect password. Please try again.' });

        // Both User and Student models store role — ensure it's student
        const role = account.role || 'student';
        if (role !== 'student') {
            return res.status(403).json({ error: 'Invalid credentials for this login portal.' });
        }

        if (!account.isVerified) {
            return res.status(403).json({ error: 'Please verify your account first. Check your email for OTP.' });
        }

        // Update streak (only User model has streak fields; skip gracefully for Student)
        if (fromCollection === 'users') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const last = account.lastActiveDate ? new Date(account.lastActiveDate) : null;
            if (last) last.setHours(0, 0, 0, 0);
            const diffDays = last ? Math.round((today - last) / 86400000) : null;
            if (!last || diffDays > 1) account.currentStreak = 1;
            else if (diffDays === 1) account.currentStreak = (account.currentStreak || 0) + 1;
            account.lastActiveDate = today;
            await account.save();
        }

        const token = account.getSignedJwtToken();
        res.cookie('student_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

        res.status(200).json({
            success: true, token,
            user: { id: account._id, name: account.name, email: account.email, role, streak: account.currentStreak || 0 }
        });
    } catch (err) {
        console.error('user-login error:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

// REMOVED DUPLICATE INLINE ADMIN LOGIN - Now handled by authRoutes router

// 4c. Employee Login (requires admin approval - isVerified)
app.post('/api/auth/employee-login', async (req, res) => {
    try {
        const Employee = require('./models/Employee');
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const employee = await Employee.findOne({ email }).select('+password');
        if (!employee) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await employee.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!employee.isVerified) {
            return res.status(403).json({ error: 'Your account is awaiting admin approval. Please check back later.' });
        }

        const token = employee.getSignedJwtToken();
        setAuthCookie(res, token, 'employee');
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ success: true, token, user: { id: employee._id, name: employee.name, email: employee.email, role: employee.role } });
    } catch (err) {
        console.error('Employee login error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// 4d. Company Login (simple login - using separate route)
app.post('/api/auth/company-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (user.role !== 'company') {
            return res.status(403).json({ error: 'Invalid company credentials' });
        }

        const token = user.getSignedJwtToken();
        setAuthCookie(res, token, 'company');
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Company login error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// 4. Original Login (kept for backward compatibility - redirects based on role)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'User not found. Please register first.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }

        if (user.role === 'student' && !user.isVerified) {
            return res.status(403).json({ error: 'Please verify your account first. Check your email for OTP.' });
        }

        if (user.role === 'employee' && !user.isVerified) {
            return res.status(403).json({ error: 'Your account is awaiting admin approval. Please check back later.' });
        }

        const token = user.getSignedJwtToken();
        setAuthCookie(res, token, user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server Error', message: err.message, stack: err.stack });
    }
});

app.get('/api/currentuser', verifyToken, async (req, res) => {
    try {
        // Safety check for req.user
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Not authorized - invalid token' });
        }

        const role = req.user.role;
        let user = null;

        try {
            if (role === 'admin') {
                const Admin = require('./models/Admin');
                user = await Admin.findById(req.user.id).select('-password');
                if (!user) user = await User.findById(req.user.id).select('-password');
            } else if (role === 'student') {
                const Student = require('./models/Student');
                user = await Student.findById(req.user.id).select('-password');
                if (!user) user = await User.findById(req.user.id).select('-password');
            } else if (role === 'employee') {
                const Employee = require('./models/Employee');
                user = await Employee.findById(req.user.id).select('-password');
                if (!user) user = await User.findById(req.user.id).select('-password');
            } else if (role === 'company') {
                const Company = require('./models/Company');
                user = await Company.findById(req.user.id).select('-password');
                if (!user) user = await User.findById(req.user.id).select('-password');
            } else {
                user = await User.findById(req.user.id).select('-password');
            }
        } catch (dbError) {
            console.error('Database query error in /api/currentuser:', dbError);
            // Try fallback to User model
            try {
                user = await User.findById(req.user.id).select('-password');
            } catch (fallbackError) {
                console.error('Fallback query also failed:', fallbackError);
                return res.status(500).json({ message: 'Database error while fetching user', error: dbError.message });
            }
        }

        if (!user) {
            return res.status(401).json({ message: 'User not found - may have been deleted' });
        }
        
        res.status(200).json({ ...user.toObject(), role });
    } catch (err) {
        console.error('Route Error in /api/currentuser:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

// DEBUG endpoint - check what user a token belongs to
app.get('/api/debug/verify-token', async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        let token = req.cookies.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.json({ error: 'No token provided', tokenFromCookie: !!req.cookies.token, authHeader: !!req.headers.authorization });
        }
        
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key');
        const user = await User.findById(verified.id).select('-password');
        
        res.json({ 
            jwtPayload: verified, 
            dbUser: user,
            userRole: user?.role,
            userEmail: user?.email
        });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// 4a. Student Registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, course } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide name, email and password' });
        }
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already in use' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        const user = await User.create({
            name,
            email,
            password,
            role: 'student',
            course: course || '',
            isVerified: false,
            otp: otp,
            otpExpires: otpExpires
        });

        await StudentProfile.create({
            user: user._id,
            course: course || ''
        });

        // Send OTP email — non-blocking so registration succeeds even if email fails
        try {
            await sendOTPEmail(email, otp);
        } catch (emailErr) {
            console.error('OTP email failed (registration still saved):', emailErr.message);
        }

        res.status(201).json({ 
            success: true, 
            message: 'OTP sent to your email',
            userId: user._id 
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});

// Check email exists (for real-time validation)
app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const existing = await User.findOne({ email });
        res.status(200).json({ exists: !!existing });
    } catch (err) {
        console.error('Check email error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// OTP Verification
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { userId, otp } = req.body;
        
        if (!userId || !otp) {
            return res.status(400).json({ error: 'User ID and OTP are required' });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'Account already verified. Please login.' });
        }

        // Check if OTP was never sent
        if (!user.otp) {
            return res.status(400).json({ error: 'No OTP found. Please register or resend OTP.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ error: 'OTP expired. Please request a new OTP.' });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        const token = user.getSignedJwtToken();
        setAuthCookie(res, token, user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ 
            success: true, 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (err) {
        console.error('OTP verification error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Resend OTP
app.post('/api/resend-otp', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'Account already verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        try {
            await sendOTPEmail(user.email, otp);
        } catch (emailErr) {
            console.error('Resend OTP email failed:', emailErr.message);
        }

        res.status(200).json({ success: true, message: 'OTP resent to your email' });
    } catch (err) {
        console.error('Resend OTP error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Employee Forgot Password - Step 1: Validate email exists
app.post('/api/auth/employee-forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(200).json({ success: true, message: 'If the email exists, an OTP will be sent' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOTPForPasswordReset(user.email, otp);

        res.status(200).json({ 
            success: true, 
            message: 'If the email exists, an OTP will be sent',
            userId: user._id 
        });
    } catch (err) {
        console.error('Employee forgot password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Employee Verify OTP for password reset
app.post('/api/auth/employee-verify-otp', async (req, res) => {
    try {
        const { userId, otp } = req.body;
        
        if (!userId || !otp) {
            return res.status(400).json({ error: 'User ID and OTP are required' });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ error: 'OTP expired. Please request a new OTP.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'OTP verified successfully',
            resetToken 
        });
    } catch (err) {
        console.error('Employee OTP verification error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Employee Reset Password with token
app.post('/api/auth/employee-reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        
        if (!resetToken || !newPassword) {
            return res.status(400).json({ error: 'Reset token and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Password updated successfully' 
        });
    } catch (err) {
        console.error('Employee reset password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4b. Employee Registration (using unified controller)
app.post('/api/employee/register', authController.employeeRegister);

// 5. Weekly Goal
app.post('/api/user/goal', verifyToken, async (req, res) => {
    try {
        const { weeklyGoal } = req.body;
        await StudentProfile.findOneAndUpdate(
            { user: req.user.id },
            { weeklyGoal },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save goal' });
    }
});

// 6. Study Resources
app.get('/api/resources', async (req, res) => {
    try {
        const resources = await StudyResource.find().sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 7. Start Interview (shorthand)
app.post('/api/start-interview', async (req, res) => {
    try {
        const interviewId = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        res.status(200).json({ success: true, message: "Interview session initialized", interviewId });
    } catch (error) {
        res.status(500).json({ message: "Failed to start interview", error: error.message });
    }
});

// 8. Legacy Interview Routes (backward compat)
app.get('/api/interviews/legacy', async (req, res) => {
    try {
        const interviews = await LegacyInterview.find().sort({ _id: -1 });
        res.json(interviews);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

app.post('/api/interviews/legacy', async (req, res) => {
    try {
        const { subject, score, status, userId } = req.body;
        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        await LegacyInterview.create({ userId: userId || 'guest', date, subject, score, status });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to save interview" });
    }
});

// ─── Mount Route Files ───────────────────────────────────────
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// Diagnostic test route
app.get('/api/tasks-test', (req, res) => res.json({ status: 'Tasks route mounted correctly' }));

const interviewRoutes = require('./routes/interviewRoutes');
app.use('/api/interviews', interviewRoutes);

const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const aiInterviewRoutes = require('./routes/aiInterviewRoutes');
app.use('/api/ai-interview', verifyToken, aiInterviewRoutes);

// New dynamic routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const companyRoutes = require('./routes/companyRoutes');
app.use('/api/company', optionalAuth, companyRoutes);

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', optionalAuth, jobRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

const aiChatRoutes = require('./routes/aiChatRoutes');
app.use('/api/ai-chat', aiChatRoutes);

const communityRoutes = require('./routes/communityRoutes');
app.use('/api/community', optionalAuth, communityRoutes);

// New dynamic route for notifications
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

const eventRoutes = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);

const userScoreRoutes = require('./routes/userScoreRoutes');
app.use('/api/user-scores', userScoreRoutes);

const courseUpdateRoutes = require('./routes/courseUpdateRoutes');
app.use('/api/course-updates', courseUpdateRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const financialAnalyticsRoutes = require('./routes/financialAnalyticsRoutes');
app.use('/api/admin/analytics', financialAnalyticsRoutes);


// Multer error handler (must be after all routes)
app.use((err, req, res, next) => {
    if (err.message === 'Only PDF files are allowed') {
        return res.status(400).json({ error: err.message });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5 MB.' });
    }
    next(err);
});

// Create HTTP server and attach Socket.io
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Make socket.io available in routes
app.set('socketio', io);

io.on('connection', (socket) => {
    socket.on('join_room', (data) => {
        if (typeof data === 'string') {
            socket.join(data);
            console.log(`User ${data} joined their notification room via socket ${socket.id}`);
        } else if (data && data.userId) {
            socket.join(data.userId);
            if (data.role) {
                socket.join(`role:${data.role}`);
            }
            console.log(`User ${data.userId} and role ${data.role} joined rooms via socket ${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        // Automatically handled
    });
});

// Server startup moved to startServer() at the top


// Start Server after all middleware and routes are mounted
startServer();
