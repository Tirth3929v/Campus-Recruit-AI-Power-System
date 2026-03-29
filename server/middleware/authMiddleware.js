const jwt = require('jsonwebtoken');
const User     = require('../models/User');
const Student  = require('../models/Student');
const Employee = require('../models/Employee');
const Admin    = require('../models/Admin');
const Company  = require('../models/Company');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key';

// role → primary collection
const MODEL_MAP = {
  admin:    Admin,
  employee: Employee,
  company:  Company,
  student:  Student,
};

// Extract Bearer token or cookie from request
const extractToken = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return req.cookies?.token || null;
};

// ─── Core protect middleware ──────────────────────────────────
const protect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const role    = decoded.role?.toLowerCase();
    const Model   = MODEL_MAP[role];

    if (!Model) {
      console.error(`Unknown role in token: ${role}`);
      return res.status(401).json({ message: `Unknown role in token: ${role}` });
    }

    // Query the correct collection for this role
    try {
      req.user = await Model.findById(decoded.id).select('-password');
    } catch (modelError) {
      console.error(`Error querying ${role} model:`, modelError.message);
      // Try User collection as fallback
      req.user = await User.findById(decoded.id).select('-password');
    }

    // Fallback: student tokens issued by the legacy /api/auth/user-login route
    // are stored in the `users` collection, not `students`
    if (!req.user && role === 'student') {
      req.user = await User.findById(decoded.id).select('-password');
    }

    // Final fallback: try User collection for any role
    if (!req.user) {
      console.log(`User not found in ${role} collection, trying User collection...`);
      req.user = await User.findById(decoded.id).select('-password');
    }

    if (!req.user) {
      console.error(`User ${decoded.id} not found in any collection`);
      return res.status(401).json({ message: 'User not found' });
    }

    // Ensure role is set on user object
    if (!req.user.role) {
      req.user.role = role;
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    console.error('Stack:', err.stack);
    res.status(401).json({ message: 'Not authorized, token failed', error: err.message });
  }
};

// ─── Role guards (run AFTER protect) ─────────────────────────
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        const userRole = req.user ? req.user.role : 'None';
        console.warn(`🚫 [Admin Guard] Access Denied for ${req.user?.email || 'Unknown'}. Role: ${userRole}, URL: ${req.originalUrl}`);
        res.status(403).json({ error: 'Not authorized as an admin' });
    }
};

const employeeOnly = (req, res, next) => {
  if (req.user?.role?.toLowerCase() !== 'employee') {
    return res.status(403).json({ message: 'Employee access required' });
  }
  next();
};

const companyOnly = (req, res, next) => {
  if (req.user?.role?.toLowerCase() !== 'company') {
    return res.status(403).json({ message: 'Company access required' });
  }
  next();
};

const studentOnly = (req, res, next) => {
  if (req.user?.role?.toLowerCase() !== 'student') {
    return res.status(403).json({ message: 'Student access required' });
  }
  next();
};

module.exports = { protect, adminOnly, employeeOnly, companyOnly, studentOnly, extractToken, MODEL_MAP };
