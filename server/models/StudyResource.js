const mongoose = require('mongoose');

const studyResourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['Documentation', 'Guide', 'Tutorial', 'Video', 'Course'], default: 'Guide' },
    link: { type: String, required: true },
    icon: { type: String, default: 'BookOpen' }, // Lucide icon key
    category: { type: String, default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('StudyResource', studyResourceSchema);
