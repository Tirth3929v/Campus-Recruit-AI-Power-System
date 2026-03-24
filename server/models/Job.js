const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  // Reference to the CompanyProfile model (stores logo, name, location)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    required: true
  },
  // Reference to the User who posted the job (recruiter/admin)
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  requirements: {
    type: [String],
    default: []
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'],
    default: 'Full-time'
  },
  location: {
    type: String,
    required: [true, 'Please add a location (e.g., "New York, NY" or "Remote")']
  },
  salary: {
    type: String,
    default: 'Not disclosed'
  },
  status: {
    type: String,
    enum: ['pending', 'employee_review', 'admin_review', 'approved', 'rejected', 'Open', 'Closed'],
    default: 'pending'
  },
  department: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  employeeNotes: {
    type: String,
    default: ''
  },
  approvedAt: {
    type: Date
  },
  submittedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Hired'],
      default: 'Applied'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);