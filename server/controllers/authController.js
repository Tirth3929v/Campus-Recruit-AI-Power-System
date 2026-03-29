const crypto = require('crypto');
const Student = require('../models/Student');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const Company = require('../models/Company');
const { sendOTPEmail, sendPasswordResetEmail, sendOTPForPasswordReset } = require('../utils/email');

// Helper: set JWT cookie
const sendToken = (res, user) => {
  const token = user.getSignedJwtToken();
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};

// ─── STUDENT ─────────────────────────────────────────────────

exports.studentRegister = async (req, res) => {
  try {
    const { name, email, password, course } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    if (await Student.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const student = await Student.create({
      name, email, password,
      course: course || '',
      isVerified: false,
      otp,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOTPEmail(email, otp);
    res.status(201).json({ success: true, message: 'OTP sent to your email', userId: student._id });
  } catch (err) {
    console.error('Student register error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.studentVerifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (student.isVerified) return res.status(400).json({ error: 'Account already verified. Please login.' });
    if (!student.otp) return res.status(400).json({ error: 'No OTP found. Please register or resend OTP.' });
    if (student.otp !== otp) return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
    if (student.otpExpires < new Date()) return res.status(400).json({ error: 'OTP expired. Please request a new OTP.' });

    student.isVerified = true;
    student.otp = null;
    student.otpExpires = null;
    await student.save();

    const token = sendToken(res, student);
    res.json({ success: true, token, user: { id: student._id, name: student.name, email: student.email, role: 'student' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.studentResendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (student.isVerified) return res.status(400).json({ error: 'Already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    student.otp = otp;
    student.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await student.save();

    await sendOTPEmail(student.email, otp);
    res.json({ success: true, message: 'OTP resent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const student = await Student.findOne({ email }).select('+password');
    if (!student) return res.status(401).json({ error: 'Invalid credentials' });
    if (!(await student.matchPassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
    if (!student.isVerified) return res.status(403).json({ error: 'Please verify your email first' });

    const token = sendToken(res, student);
    res.json({ success: true, token, user: { id: student._id, name: student.name, email: student.email, role: 'student' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── EMPLOYEE ────────────────────────────────────────────────

exports.employeeRegister = async (req, res) => {
  try {
    console.log('📝 Incoming Employee Registration Request:', req.body.email);
    const { name, email, password, department, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        message: 'Name, email and password are required' 
      });
    }

    // Role check (Enforce 'employee' if provided, although handled by Model default)
    if (role && role !== 'employee') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid role',
        message: `Role '${role}' is not allowed for this registration endpoint.` 
      });
    }

    // CRITICAL: Check existing in Employee collection
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already registered',
        message: 'This email is already associated with an employee account. Please log in.' 
      });
    }

    // Create new employee account
    const newEmployee = await Employee.create({ 
      name, 
      email, 
      password, 
      department: department || '', 
      isVerified: false 
    });

    console.log('✅ Employee registered successfully:', newEmployee._id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration submitted successfully! Your account is now pending administrator approval.',
      employeeId: newEmployee._id
    });
  } catch (err) {
    console.error('❌ Employee registration error:', err);
    
    // Handle MongoDB duplicate key error (E11000)
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: 'Duplicate Data',
        message: 'Email already registered in Employee system.'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Server Error',
      message: err.message 
    });
  }
};


exports.employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const employee = await Employee.findOne({ email }).select('+password');
    if (!employee) return res.status(401).json({ error: 'Invalid credentials' });
    if (!(await employee.matchPassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
    if (!employee.isVerified) return res.status(403).json({ error: 'Account pending admin approval' });

    const token = sendToken(res, employee);
    res.json({ success: true, token, user: { id: employee._id, name: employee.name, email: employee.email, role: 'employee' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.employeeForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) return res.json({ success: true, message: 'If email exists, OTP will be sent' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    employee.otp = otp;
    employee.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await employee.save();

    await sendOTPForPasswordReset(email, otp);
    res.json({ success: true, message: 'OTP sent', userId: employee._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.employeeResetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const employee = await Employee.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!employee) return res.status(400).json({ error: 'Invalid or expired token' });

    employee.password = newPassword;
    employee.resetPasswordToken = null;
    employee.resetPasswordExpire = null;
    await employee.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── ADMIN ───────────────────────────────────────────────────

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) return res.status(401).json({ error: 'Invalid admin credentials' });
    if (!(await admin.matchPassword(password))) return res.status(401).json({ error: 'Invalid admin credentials' });

    const token = sendToken(res, admin);
    res.json({ success: true, token, user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── COMPANY ─────────────────────────────────────────────────

exports.companySignup = async (req, res) => {
  try {
    const {
      name, email, password, companyName, description, website, logo,
      industry, location, address, contactNumber,
      ownerName, mainManagerName, mainManagerEmail,
      employeeCount, foundedYear,
    } = req.body;

    if (!name || !email || !password || !companyName || !contactNumber || !location)
      return res.status(400).json({ error: 'Name, email, password, company name, contact number and location are required' });

    if (await Company.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });

    await Company.create({
      name, email, password, companyName,
      description: description || '',
      website: website || '',
      logo: logo || '',
      industry: industry || '',
      location, address: address || '',
      contactNumber,
      ownerName: ownerName || '',
      mainManagerName: mainManagerName || '',
      mainManagerEmail: mainManagerEmail || '',
      employeeCount: employeeCount || '',
      foundedYear: foundedYear || null,
      isVerified: false, // awaiting employee approval
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted. An employee will review and approve your company account.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.companyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const company = await Company.findOne({ email }).select('+password');
    if (!company) return res.status(401).json({ error: 'Invalid credentials' });
    if (!(await company.matchPassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
    if (!company.isVerified)
      return res.status(403).json({
        error: 'Your company account is pending approval. You will receive an email once approved.',
        pending: true,
      });

    const token = sendToken(res, company);
    res.json({ success: true, token, user: { id: company._id, name: company.name, email: company.email, role: 'company' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── SHARED ──────────────────────────────────────────────────

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // Search across all tables
    const user = await Student.findOne({ email }) ||
                 await Employee.findOne({ email }) ||
                 await Admin.findOne({ email }) ||
                 await Company.findOne({ email });

    if (!user) return res.json({ success: true, message: 'If email exists, reset link will be sent' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(email, resetToken);
    res.json({ success: true, message: 'Reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const filter = { resetPasswordToken: resetToken, resetPasswordExpire: { $gt: Date.now() } };
    const user = await Student.findOne(filter) ||
                 await Employee.findOne(filter) ||
                 await Admin.findOne(filter) ||
                 await Company.findOne(filter);

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authorized' });
    // Spread toObject() so virtuals are included, then pin role from the token
    // (req.user already comes from the correct collection via protect middleware)
    const userObj = req.user.toObject ? req.user.toObject() : req.user;
    delete userObj.password;
    res.json({ ...userObj, role: req.user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, department, phone, bio } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (department && user.department !== undefined) user.department = department;
    if (phone && user.phone !== undefined) user.phone = phone;
    if (bio && user.bio !== undefined) user.bio = bio;

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.signup = exports.studentRegister;
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out' });
};
