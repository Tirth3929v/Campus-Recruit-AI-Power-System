const mongoose = require('mongoose');

// Legacy model for backward compatibility with dashboard data
const legacyInterviewSchema = new mongoose.Schema({
    userId: String,
    date: String,
    subject: String,
    score: Number,
    status: String
});

module.exports = mongoose.model('LegacyInterview', legacyInterviewSchema, 'interviews_legacy');
