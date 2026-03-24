const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const companySchema = new mongoose.Schema({
  // Auth
  name:     { type: String, required: [true, 'Contact person name is required'] },
  email:    { type: String, required: [true, 'Email is required'], unique: true,
              match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'] },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, default: 'company', immutable: true },

  // Company details
  companyName:   { type: String, required: [true, 'Company name is required'], trim: true },
  description:   { type: String, default: '' },
  website:       { type: String, default: '' },
  logo:          { type: String, default: '' },
  industry:      { type: String, default: '' },
  location:      { type: String, default: '' },
  address:       { type: String, default: '' },
  contactNumber: { type: String, default: '' },

  // People
  ownerName:       { type: String, default: '' },
  mainManagerName: { type: String, default: '' },
  mainManagerEmail:{ type: String, default: '' },

  // Size
  employeeCount: { type: String, default: '' }, // e.g. "50-200"
  foundedYear:   { type: Number },

  // Approval — false until an employee approves
  isVerified:       { type: Boolean, default: false },
  approvedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt:       { type: Date, default: null },
  rejectionReason:  { type: String, default: '' },

  // Password reset
  resetPasswordToken:  { type: String, default: null },
  resetPasswordExpire: { type: Date,   default: null },
}, { timestamps: true });

companySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

companySchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

companySchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: 'company', email: this.email, name: this.name },
    process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key',
    { expiresIn: '30d' }
  );
};

module.exports = mongoose.model('Company', companySchema);
