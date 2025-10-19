const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'healthmate/reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 1200, height: 1200, crop: 'limit' }
    ],
    resource_type: 'auto',
    public_id: (req, file) => {
      // Generate unique public_id
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      return `healthmate/reports/${timestamp}_${randomString}`;
    }
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
    }
  }
});

// Upload single file
const uploadSingle = upload.single('report');

// Upload multiple files
const uploadMultiple = upload.array('reports', 5);

// Delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Get file info
const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error);
    throw error;
  }
};

// Generate signed URL for private access
const generateSignedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    resource_type: 'auto',
    expires_at: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    ...options
  };
  
  return cloudinary.url(publicId, {
    ...defaultOptions,
    sign_url: true
  });
};

module.exports = {
  cloudinary,
  uploadSingle,
  uploadMultiple,
  deleteFile,
  getFileInfo,
  generateSignedUrl
};
