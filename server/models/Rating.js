const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    default: ''
  }
}, { timestamps: true });

ratingSchema.index({ courseId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
