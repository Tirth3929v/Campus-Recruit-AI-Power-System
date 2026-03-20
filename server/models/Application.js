const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  resume: String, // Snapshot of resume at time of application
  coverLetter: String,
  status: { type: String, enum: ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Hired'], default: 'Applied' },
  appliedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);