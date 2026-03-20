const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0 }, // Percentage 0-100
  completedChapters: [{ type: String }], // Array of Chapter IDs
  completed: { type: Boolean, default: false },
  completionDate: Date,
  lastOpenedLesson: { type: Number, default: 0 }, // Index of last opened lesson
  mcqCompleted: { type: Boolean, default: false },
  mcqScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);