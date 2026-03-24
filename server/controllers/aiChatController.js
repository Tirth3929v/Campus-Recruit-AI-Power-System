const AIChatHistory = require('../models/AIChatHistory');

// Get all chat sessions for the current user
exports.getChats = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = { user: req.user.id };
        if (type) filter.type = type;

        const chats = await AIChatHistory.find(filter)
            .select('title lastMessageAt updatedAt type')
            .sort({ updatedAt: -1 });
        res.json(chats);
    } catch (err) {
        console.error('getChats error:', err);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
};

// Get a specific chat session with full message history
exports.getChat = async (req, res) => {
    try {
        const chat = await AIChatHistory.findOne({ _id: req.params.id, user: req.user.id });
        if (!chat) return res.status(404).json({ error: 'Chat not found' });
        res.json(chat);
    } catch (err) {
        console.error('getChat error:', err);
        res.status(500).json({ error: 'Failed to fetch chat session' });
    }
};

// Add a message to a session or create a new one
exports.addMessage = async (req, res) => {
    try {
        const { chatId, role, content, type } = req.body;
        
        let chat;
        if (chatId) {
            chat = await AIChatHistory.findOne({ _id: chatId, user: req.user.id });
        }

        if (!chat) {
            // Create a new session if no chatId or chat not found
            const title = role === 'user' ? (content.substring(0, 30) + (content.length > 30 ? '...' : '')) : 'New Chat';
            chat = await AIChatHistory.create({
                user: req.user.id,
                title,
                type: type || 'text',
                messages: [{ role, content, type: type || 'text' }]
            });
        } else {
            // Append to existing session
            chat.messages.push({ role, content, type });
            chat.lastMessageAt = Date.now();
            await chat.save();
        }

        res.json(chat);
    } catch (err) {
        console.error('addMessage error:', err);
        res.status(500).json({ error: 'Failed to save message' });
    }
};

// Delete a chat session
exports.deleteChat = async (req, res) => {
    try {
        const chat = await AIChatHistory.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!chat) return res.status(404).json({ error: 'Chat not found' });
        res.json({ success: true, message: 'Chat deleted' });
    } catch (err) {
        console.error('deleteChat error:', err);
        res.status(500).json({ error: 'Failed to delete chat' });
    }
};
