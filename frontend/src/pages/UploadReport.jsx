import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../contexts/ReportContext';

const UploadReport = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  
  const { uploadReport, loading } = useReports();
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setErrors({});
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ file: 'Please select a valid file (JPEG, PNG, or PDF)' });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors({ file: 'File size must be less than 10MB' });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedFile) {
      newErrors.file = 'Please select a file to upload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    const result = await uploadReport(selectedFile, tagsArray, notes);
    
    if (result.success) {
      navigate(`/report/${result.report.id}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <i className="bi bi-file-image text-primary fs-1"></i>;
    } else if (fileType === 'application/pdf') {
      return <i className="bi bi-file-pdf text-danger fs-1"></i>;
    }
    return <i className="bi bi-file-earmark text-secondary fs-1"></i>;
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="h2 fw-bold text-dark mb-2">
              <i className="bi bi-cloud-upload me-2"></i>
              Upload Medical Report
            </h1>
            <p className="text-muted">
              Upload your medical report for AI-powered analysis and insights.
            </p>
          </div>

          <div className="card shadow">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* File Upload Area */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-file-earmark-medical me-2"></i>
                    Medical Report File
                  </label>
                  <div
                    className={`file-upload-area ${dragActive ? 'dragover' : ''} ${selectedFile ? 'border-success bg-light' : ''} ${errors.file ? 'border-danger' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="text-center">
                        <div className="mb-3">
                          {getFileIcon(selectedFile.type)}
                        </div>
                        <div>
                          <h6 className="fw-semibold text-dark mb-1">{selectedFile.name}</h6>
                          <p className="text-muted small mb-3">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="btn btn-outline-danger btn-sm"
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <i className="bi bi-cloud-upload text-muted" style={{ fontSize: '3rem' }}></i>
                        <div className="mt-3">
                          <p className="text-muted mb-2">
                            <span className="fw-semibold text-primary">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-muted small">PDF, PNG, JPG up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                          onChange={handleFileInput}
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                      </div>
                    )}
                  </div>
                  {errors.file && (
                    <div className="text-danger small mt-2">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      {errors.file}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label htmlFor="tags" className="form-label fw-semibold">
                    <i className="bi bi-tags me-2"></i>
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    className="form-control"
                    placeholder="e.g., blood test, x-ray, checkup (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <div className="form-text">
                    Add tags to help organize your reports
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label htmlFor="notes" className="form-label fw-semibold">
                    <i className="bi bi-journal-text me-2"></i>
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="form-control"
                    placeholder="Add any additional notes about this report..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="form-text">
                    Add any context or notes about this medical report
                  </div>
                </div>

                {/* Upload Info */}
                <div className="alert alert-info d-flex align-items-start mb-4">
                  <i className="bi bi-info-circle me-3 mt-1"></i>
                  <div>
                    <h6 className="alert-heading mb-2">What happens after upload?</h6>
                    <ul className="mb-0 small">
                      <li>Your report will be securely uploaded to our cloud storage</li>
                      <li>AI will analyze the report and provide insights in English and Roman Urdu</li>
                      <li>You'll receive a detailed summary with key findings and recommendations</li>
                      <li>Analysis typically takes 1-2 minutes to complete</li>
                    </ul>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-outline-secondary"
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !selectedFile}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-upload me-2"></i>
                        Upload Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReport;