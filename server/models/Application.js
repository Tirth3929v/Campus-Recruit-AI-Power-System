const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  studentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: String,
  coverLetter: String,
  status: { type: String, enum: ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Hired'], default: 'Applied' },
  appliedDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound unique index — one application per student per job
applicationSchema.index({ job: 1, studentUserId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);