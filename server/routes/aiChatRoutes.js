const express = require('express');
const router = express.Router();
const { getChats, getChat, addMessage, deleteChat } = require('../controllers/aiChatController');
const { protect } = require('../middleware/authMiddleware');

// All AI chat history routes are protected
router.use(protect);

router.get('/', getChats);
router.get('/:id', getChat);
router.post('/message', addMessage);
router.delete('/:id', deleteChat);

module.exports = router;
