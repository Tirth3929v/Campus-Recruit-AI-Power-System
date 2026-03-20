const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  questionCategory: {
    type: String,
    enum: ['Technical', 'Behavioral', 'ProblemSolving', 'General'],
    default: 'Technical'
  },
  userAnswer: {
    type: String,
    default: ''
  },
  audioUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  aiEvaluation: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    feedback: {
      type: String,
      default: ''
    },
    strengths: [{
      type: String
    }],
    improvements: [{
      type: String
    }],
    keywordsFound: [{
      type: String
    }]
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  }
}, { _id: true });

const aiInterviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  sessionType: {
    type: String,
    enum: ['Practice', 'Mock', 'Assessment'],
    default: 'Practice'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  focusAreas: [{
    type: String
  }],
  questions: [answerSchema],
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['NotStarted', 'InProgress', 'Completed', 'Evaluated'],
    default: 'NotStarted'
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  overallFeedback: {
    type: String,
    default: ''
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  totalTimeTaken: {
    type: Number, // in seconds
    default: 0
  },
  videoRecordingUrl: {
    type: String
  },
  screenRecordingUrl: {
    type: String
  }
}, { timestamps: true });

// Index for efficient queries
aiInterviewSessionSchema.index({ user: 1, status: 1 });
aiInterviewSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AIInterviewSession', aiInterviewSessionSchema);
