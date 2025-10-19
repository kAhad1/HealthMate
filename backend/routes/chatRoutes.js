const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getOrCreateChat,
  sendMessage,
  getChatHistory,
  clearChatHistory,
  getChatStats,
  searchMessages
} = require('../controllers/chatController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get or create chat
router.get('/', getOrCreateChat);

// Send message
router.post('/message', sendMessage);

// Get chat history with pagination
router.get('/history', getChatHistory);

// Clear chat history
router.delete('/history', clearChatHistory);

// Get chat statistics
router.get('/stats', getChatStats);

// Search messages
router.get('/search', searchMessages);

module.exports = router;
