const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: { 
        type: String, 
        enum: ['user', 'assistant'], 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['text', 'code', 'image'], // Keeping image for compatibility if needed elsewhere
        default: 'text' 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

const aiChatHistorySchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        default: 'New Chat' 
    },
    type: {
        type: String,
        enum: ['text', 'code'],
        default: 'text'
    },
    messages: [messageSchema],
    lastMessageAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Index for efficient user-based history retrieval
aiChatHistorySchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('AIChatHistory', aiChatHistorySchema);
