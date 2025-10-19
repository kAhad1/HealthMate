const Chat = require('../models/Chat');
const Report = require('../models/Report');
const { generateChatResponse } = require('../utils/geminiClient');

// Get or create chat for user
const getOrCreateChat = async (req, res) => {
  try {
    const userId = req.user._id;

    let chat = await Chat.findOne({ userId });
    
    if (!chat) {
      // Create new chat
      chat = new Chat({
        userId,
        messages: []
      });
      await chat.save();
    }

    // Get recent messages
    const recentMessages = chat.getRecentMessages(50);

    res.json({
      success: true,
      data: {
        chat: {
          id: chat._id,
          messages: recentMessages,
          lastActivity: chat.lastActivity,
          isActive: chat.isActive
        }
      }
    });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat'
    });
  }
};

// Send message and get AI response
const sendMessage = async (req, res) => {
  try {
    const { message, reportId } = req.body;
    const userId = req.user._id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Get or create chat
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
      await chat.save();
    }

    // Add user message
    await chat.addMessage('user', message.trim(), reportId || null, 'text');

    // Get context from recent reports if available
    let context = '';
    if (reportId) {
      const report = await Report.findOne({ _id: reportId, userId });
      if (report && report.aiSummary) {
        context = `Recent report context: ${report.originalName}\nSummary: ${report.aiSummary.english}`;
      }
    } else {
      // Get recent reports for context
      const recentReports = await Report.find({ userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('originalName aiSummary');
      
      if (recentReports.length > 0) {
        context = 'Recent reports context:\n';
        recentReports.forEach(report => {
          if (report.aiSummary && report.aiSummary.english) {
            context += `${report.originalName}: ${report.aiSummary.english.substring(0, 200)}...\n`;
          }
        });
      }
    }

    // Generate AI response
    const aiResponse = await generateChatResponse(message, context);

    if (aiResponse.success) {
      // Add AI response to chat
      await chat.addMessage('assistant', aiResponse.response, reportId || null, 'text');

      res.json({
        success: true,
        data: {
          userMessage: {
            role: 'user',
            content: message.trim(),
            timestamp: new Date(),
            reportId: reportId || null
          },
          aiResponse: {
            role: 'assistant',
            content: aiResponse.response,
            timestamp: new Date(),
            reportId: reportId || null
          }
        }
      });
    } else {
      // Add error message to chat
      const errorMessage = 'I apologize, but I encountered an error processing your request. Please try again.';
      await chat.addMessage('assistant', errorMessage, reportId || null, 'text');

      res.status(500).json({
        success: false,
        message: 'Error generating AI response',
        data: {
          userMessage: {
            role: 'user',
            content: message.trim(),
            timestamp: new Date(),
            reportId: reportId || null
          },
          aiResponse: {
            role: 'assistant',
            content: errorMessage,
            timestamp: new Date(),
            reportId: reportId || null
          }
        }
      });
    }

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user._id;

    const chat = await Chat.findOne({ userId });
    
    if (!chat) {
      return res.json({
        success: true,
        data: {
          messages: [],
          totalMessages: 0
        }
      });
    }

    // Get messages with pagination
    const totalMessages = chat.messages.length;
    const messages = chat.messages
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .reverse();

    res.json({
      success: true,
      data: {
        messages,
        totalMessages,
        hasMore: parseInt(offset) + parseInt(limit) < totalMessages
      }
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat history'
    });
  }
};

// Clear chat history
const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const chat = await Chat.findOne({ userId });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    await chat.clearHistory();

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing chat history'
    });
  }
};

// Get chat statistics
const getChatStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chat = await Chat.findOne({ userId });
    
    if (!chat) {
      return res.json({
        success: true,
        data: {
          totalMessages: 0,
          userMessages: 0,
          aiMessages: 0,
          lastActivity: null,
          isActive: false
        }
      });
    }

    const userMessages = chat.messages.filter(msg => msg.role === 'user').length;
    const aiMessages = chat.messages.filter(msg => msg.role === 'assistant').length;

    res.json({
      success: true,
      data: {
        totalMessages: chat.messages.length,
        userMessages,
        aiMessages,
        lastActivity: chat.lastActivity,
        isActive: chat.isActive
      }
    });

  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat statistics'
    });
  }
};

// Search chat messages
const searchMessages = async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const chat = await Chat.findOne({ userId });
    
    if (!chat) {
      return res.json({
        success: true,
        data: {
          messages: [],
          totalResults: 0
        }
      });
    }

    // Search messages
    const searchRegex = new RegExp(query.trim(), 'i');
    const matchingMessages = chat.messages
      .filter(msg => searchRegex.test(msg.content))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        messages: matchingMessages,
        totalResults: matchingMessages.length,
        query: query.trim()
      }
    });

  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching messages'
    });
  }
};

module.exports = {
  getOrCreateChat,
  sendMessage,
  getChatHistory,
  clearChatHistory,
  getChatStats,
  searchMessages
};
