const Report = require('../models/Report');
const Chat = require('../models/Chat');
const { analyzeReport } = require('../utils/geminiClient');
const { deleteFile } = require('../utils/cloudinary');

// Upload and analyze report
const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user._id;
    const { tags, notes } = req.body;

    // Debug: Log file information
    console.log('File upload details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      public_id: req.file.public_id,
      fieldname: req.file.fieldname
    });

    // Generate public_id if not provided by Cloudinary
    let cloudinaryPublicId = req.file.public_id;
    if (!cloudinaryPublicId) {
      // Extract public_id from the path or generate one
      const pathParts = req.file.path.split('/');
      cloudinaryPublicId = pathParts[pathParts.length - 1].split('.')[0];
      console.log('Generated public_id:', cloudinaryPublicId);
    }

    // Create report record
    const report = new Report({
      userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      cloudinaryPublicId: cloudinaryPublicId,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      notes: notes || ''
    });

    await report.save();

    // Start AI analysis in background
    analyzeReportAsync(report._id, req.file.path, req.file.mimetype);

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully. AI analysis in progress.',
      data: {
        report: {
          id: report._id,
          fileName: report.fileName,
          originalName: report.originalName,
          fileUrl: report.fileUrl,
          fileType: report.fileType,
          fileSize: report.fileSize,
          analysisStatus: report.analysisStatus,
          tags: report.tags,
          notes: report.notes,
          createdAt: report.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Upload report error:', error);
    
    // Clean up uploaded file if report creation fails
    if (req.file) {
      try {
        const publicId = req.file.public_id || cloudinaryPublicId;
        if (publicId) {
          await deleteFile(publicId);
        }
      } catch (deleteError) {
        console.error('Error deleting file after upload failure:', deleteError);
      }
    }

    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during report upload',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Background AI analysis
const analyzeReportAsync = async (reportId, fileUrl, fileType) => {
  try {
    // Update status to processing
    await Report.findByIdAndUpdate(reportId, { analysisStatus: 'processing' });

    // Analyze with Gemini
    const analysisResult = await analyzeReport(fileUrl, fileType);

    if (analysisResult.success) {
      // Update report with AI analysis
      await Report.findByIdAndUpdate(reportId, {
        aiSummary: analysisResult.data,
        analysisStatus: 'completed'
      });

      // Add to chat history
      const chat = await Chat.findOne({ userId: (await Report.findById(reportId)).userId });
      if (chat) {
        await chat.addMessage(
          'assistant',
          `New medical report analyzed: ${(await Report.findById(reportId)).originalName}\n\n${analysisResult.data.english}`,
          reportId,
          'report_analysis'
        );
      }
    } else {
      // Mark as failed
      await Report.findByIdAndUpdate(reportId, {
        analysisStatus: 'failed',
        analysisError: analysisResult.error
      });
    }

  } catch (error) {
    console.error('AI analysis error:', error);
    await Report.findByIdAndUpdate(reportId, {
      analysisStatus: 'failed',
      analysisError: error.message
    });
  }
};

// Get all reports for user
const getUserReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { userId };
    
    if (status) {
      query.analysisStatus = status;
    }
    
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const reports = await Report.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-cloudinaryPublicId');

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReports: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports'
    });
  }
};

// Get single report
const getReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await Report.findOne({ _id: id, userId });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: { report }
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching report'
    });
  }
};

// Update report
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { tags, notes, isImportant } = req.body;

    const updateData = {};
    if (tags !== undefined) updateData.tags = tags;
    if (notes !== undefined) updateData.notes = notes;
    if (isImportant !== undefined) updateData.isImportant = isImportant;

    const report = await Report.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: { report }
    });

  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating report'
    });
  }
};

// Delete report
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await Report.findOne({ _id: id, userId });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Delete from Cloudinary
    try {
      await deleteFile(report.cloudinaryPublicId);
    } catch (deleteError) {
      console.error('Error deleting file from Cloudinary:', deleteError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await Report.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting report'
    });
  }
};

// Get reports timeline
const getReportsTimeline = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.query;

    // Build date filter
    const dateFilter = { userId };
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateFilter.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Group reports by date
    const reports = await Report.find(dateFilter)
      .sort({ createdAt: -1 })
      .select('originalName fileUrl createdAt analysisStatus aiSummary tags isImportant');

    // Group by date
    const timeline = reports.reduce((acc, report) => {
      const date = report.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(report);
      return acc;
    }, {});

    res.json({
      success: true,
      data: { timeline }
    });

  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching timeline'
    });
  }
};

// Retry failed analysis
const retryAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await Report.findOne({ _id: id, userId });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.analysisStatus === 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Analysis already in progress'
      });
    }

    // Reset status and retry
    await Report.findByIdAndUpdate(id, {
      analysisStatus: 'pending',
      analysisError: null
    });

    // Start analysis in background
    analyzeReportAsync(id, report.fileUrl, report.fileType);

    res.json({
      success: true,
      message: 'Analysis retry initiated'
    });

  } catch (error) {
    console.error('Retry analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrying analysis'
    });
  }
};

module.exports = {
  uploadReport,
  getUserReports,
  getReport,
  updateReport,
  deleteReport,
  getReportsTimeline,
  retryAnalysis
};
