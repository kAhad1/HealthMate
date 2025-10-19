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
  timestamp: {
    type: Date,
    default: Date.now
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    default: null
  },
  messageType: {
    type: String,
    enum: ['text', 'report_analysis', 'question', 'summary'],
    default: 'text'
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  messages: [messageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sessionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ userId: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ 'messages.timestamp': -1 });

// Method to add a new message
chatSchema.methods.addMessage = function(role, content, reportId = null, messageType = 'text') {
  this.messages.push({
    role,
    content,
    reportId,
    messageType,
    timestamp: new Date()
  });
  this.lastActivity = new Date();
  return this.save();
};

// Method to get recent messages
chatSchema.methods.getRecentMessages = function(limit = 50) {
  return this.messages
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .reverse();
};

// Method to clear chat history
chatSchema.methods.clearHistory = function() {
  this.messages = [];
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);
