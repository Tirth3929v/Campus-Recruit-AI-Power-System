import mongoose from 'mongoose';
const { Schema } = mongoose;

const applicationSchema = new Schema({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  applicant: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Interviewing', 'Rejected', 'Hired'],
    default: 'Pending',
  },
  // Assuming you handle file uploads and store a URL to the resume
  resumeURL: {
    type: String,
    required: true,
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;