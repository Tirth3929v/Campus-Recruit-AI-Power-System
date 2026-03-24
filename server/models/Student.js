const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  email: {
    type: String, required: [true, 'Email is required'], unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, default: 'student', immutable: true },

  // Student-specific
  course: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  resume: { type: String, default: '' },
  resumeName: { type: String, default: '' },
  cgpa: { type: Number, default: 0 },
  graduationYear: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  weeklyGoal: { type: Number, default: 2 },
  lastActiveDate: { type: Date },
  lastAccessedCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  lastAccessedAt: { type: Date, default: null },

  // Auth
  isVerified: { type: Boolean, default: false },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null },
}, { timestamps: true });

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

studentSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: 'student', email: this.email, name: this.name },
    process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key',
    { expiresIn: '30d' }
  );
};

module.exports = mongoose.model('Student', studentSchema);
