const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  },
  fileSize: {
    type: Number,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: false,
    default: null
  },
  aiSummary: {
    english: {
      type: String,
      default: ''
    },
    romanUrdu: {
      type: String,
      default: ''
    },
    keyFindings: [String],
    recommendations: [String],
    abnormalValues: [String],
    doctorQuestions: [String]
  },
  analysisStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  analysisError: {
    type: String,
    default: null
  },
  tags: [String],
  isImportant: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ analysisStatus: 1 });
reportSchema.index({ tags: 1 });

// Virtual for formatted file size
reportSchema.virtual('formattedFileSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Ensure virtual fields are serialized
reportSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Report', reportSchema);
