const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../utils/cloudinary');
const {
  uploadReport,
  getUserReports,
  getReport,
  updateReport,
  deleteReport,
  getReportsTimeline,
  retryAnalysis
} = require('../controllers/reportController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Upload report with file upload middleware
router.post('/upload', uploadSingle, uploadReport);

// Get all reports for user
router.get('/', getUserReports);

// Get reports timeline
router.get('/timeline', getReportsTimeline);

// Get single report
router.get('/:id', getReport);

// Update report
router.put('/:id', updateReport);

// Delete report
router.delete('/:id', deleteReport);

// Retry failed analysis
router.post('/:id/retry-analysis', retryAnalysis);

module.exports = router;
