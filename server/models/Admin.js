const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  email: {
    type: String, required: [true, 'Email is required'], unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, default: 'admin', immutable: true },

  // Admin-specific
  phone: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  isSuperAdmin: { type: Boolean, default: false },
  permissions: {
    manageUsers: { type: Boolean, default: true },
    manageJobs: { type: Boolean, default: true },
    manageCourses: { type: Boolean, default: true },
    manageEmployees: { type: Boolean, default: true },
    sendNotifications: { type: Boolean, default: true },
  },

  // Auth
  isVerified: { type: Boolean, default: true },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null },
}, { timestamps: true });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

adminSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: 'admin', email: this.email, name: this.name },
    process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key',
    { expiresIn: '30d' }
  );
};

module.exports = mongoose.model('Admin', adminSchema);
