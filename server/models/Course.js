const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  instructor: {
    type: String,
    required: [true, 'Please add an instructor name']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Development', 'Design', 'Data Science', 'Business', 'Marketing', 'Soft Skills'],
    default: 'Development'
  },
  courseType: {
    type: String,
    enum: ['free', 'paid'],
    default: 'free'
  },
  level: {
    type: String,
    required: [true, 'Please add a difficulty level'],
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  duration: {
    type: String,
    required: [true, 'Please add duration (e.g., "10h 30m")']
  },
  rating: {
    type: Number,
    default: 4.5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  students: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  thumbnail: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  courseNotes: {
    type: String,
    default: ''
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  pdfFile: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'published'],
    default: 'draft'
  },
  createdBy: {
    type: String, // employee email or name
    default: 'Unknown'
  },
  chapters: [{
    chapterId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String, // Expect HTML/Markdown
      required: true
    },
    videoUrl: {
      type: String // Optional
    },
    order: {
      type: Number,
      required: true
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);