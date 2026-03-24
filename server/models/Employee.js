const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  email: {
    type: String, required: [true, 'Email is required'], unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, default: 'employee', immutable: true },

  // Employee-specific
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  employeeId: { type: String, default: '' },

  // Auth
  isVerified: { type: Boolean, default: false }, // admin must approve
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
}, { timestamps: true });

employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

employeeSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

employeeSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: 'employee', email: this.email, name: this.name },
    process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key',
    { expiresIn: '30d' }
  );
};

module.exports = mongoose.model('Employee', employeeSchema);
