import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReports } from '../contexts/ReportContext';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  TrashIcon,
  TagIcon,
  PencilIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentReport, 
    loading, 
    fetchReport, 
    updateReport, 
    deleteReport, 
    retryAnalysis 
  } = useReports();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    tags: [],
    notes: '',
    isImportant: false
  });

  useEffect(() => {
    if (id) {
      fetchReport(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentReport) {
      setEditData({
        tags: currentReport.tags || [],
        notes: currentReport.notes || '',
        isImportant: currentReport.isImportant || false
      });
    }
  }, [currentReport]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (currentReport) {
      setEditData({
        tags: currentReport.tags || [],
        notes: currentReport.notes || '',
        isImportant: currentReport.isImportant || false
      });
    }
  };

  const handleSaveEdit = async () => {
    const result = await updateReport(id, editData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      const result = await deleteReport(id);
      if (result.success) {
        navigate('/dashboard');
      }
    }
  };

  const handleRetryAnalysis = async () => {
    await retryAnalysis(id);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Analysis Complete';
      case 'processing':
        return 'Analyzing...';
      case 'failed':
        return 'Analysis Failed';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading && !currentReport) {
    return <LoadingSpinner text="Loading report details..." />;
  }

  if (!currentReport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Report not found</h3>
          <p className="text-gray-600 mb-6">
            The report you're looking for doesn't exist or has been deleted.
          </p>
         
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
       
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                      {currentReport.originalName}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span>{formatFileSize(currentReport.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(currentReport.createdAt)}</span>
                      {currentReport.isImportant && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center text-amber-600">
                            <StarIcon className="w-4 h-4 mr-1" />
                            Important
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                {currentReport.analysisStatus === 'failed' && (
                  <button
                    onClick={handleRetryAnalysis}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Retry Analysis
                  </button>
                )}
                
             
                  
                
             
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
        


            {/* AI Analysis */}
            {currentReport.analysisStatus === 'completed' && currentReport.aiSummary ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">AI Analysis</h2>
                
                {/* English Summary */}
                {currentReport.aiSummary.english && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">English Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">
                        {currentReport.aiSummary.english}
                      </p>
                    </div>
                  </div>
                )}

                {/* Roman Urdu Summary */}
                {currentReport.aiSummary.romanUrdu && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">Roman Urdu Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">
                        {currentReport.aiSummary.romanUrdu}
                      </p>
                    </div>
                  </div>
                )}

                {/* Key Findings */}
                {currentReport.aiSummary.keyFindings && currentReport.aiSummary.keyFindings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">Key Findings</h3>
                    <ul className="space-y-2">
                      {currentReport.aiSummary.keyFindings.map((finding, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          <span className="text-gray-700">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Abnormal Values */}
                {currentReport.aiSummary.abnormalValues && currentReport.aiSummary.abnormalValues.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">Abnormal Values</h3>
                    <ul className="space-y-2">
                      {currentReport.aiSummary.abnormalValues.map((value, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2 mt-1">•</span>
                          <span className="text-red-700">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {currentReport.aiSummary.recommendations && currentReport.aiSummary.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {currentReport.aiSummary.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-1">•</span>
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Doctor Questions */}
                {currentReport.aiSummary.doctorQuestions && currentReport.aiSummary.doctorQuestions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">Questions for Your Doctor</h3>
                    <ul className="space-y-2">
                      {currentReport.aiSummary.doctorQuestions.map((question, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-500 mr-2 mt-1">•</span>
                          <span className="text-gray-700">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : currentReport.analysisStatus === 'processing' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
               
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis in Progress</h3>
                <p className="text-gray-600">
                  Our AI is analyzing your report. This usually takes 1-2 minutes.
                </p>
              </div>
            ) : currentReport.analysisStatus === 'failed' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <XCircleIcon className="mx-auto w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Failed</h3>
                <p className="text-gray-600 mb-4">
                  {currentReport.analysisError || 'Unable to analyze this report. Please try again.'}
                </p>
                <button
                  onClick={handleRetryAnalysis}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  disabled={loading}
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2 inline" />
                  Retry Analysis
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <ClockIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Pending</h3>
                <p className="text-gray-600">
                  Your report is queued for analysis.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            

            {/* Report Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Type</dt>
                  <dd className="text-sm text-gray-900 font-medium">{currentReport.fileType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Size</dt>
                  <dd className="text-sm text-gray-900 font-medium">{formatFileSize(currentReport.fileSize)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
                  <dd className="text-sm text-gray-900 font-medium">{formatDate(currentReport.createdAt)}</dd>
                </div>
              </dl>
            </div>

            {/* Tags and Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags & Notes</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter tags separated by commas"
                      value={editData.tags.join(', ')}
                      onChange={(e) => setEditData({
                        ...editData,
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add notes about this report"
                      value={editData.notes}
                      onChange={(e) => setEditData({
                        ...editData,
                        notes: e.target.value
                      })}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isImportant"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={editData.isImportant}
                      onChange={(e) => setEditData({
                        ...editData,
                        isImportant: e.target.checked
                      })}
                    />
                    <label htmlFor="isImportant" className="ml-2 text-sm text-gray-700">
                      Mark as important
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex-1"
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentReport.tags && currentReport.tags.length > 0 ? (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
                      <div className="flex flex-wrap gap-2">
                        {currentReport.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tags</dt>
                      <dd className="text-sm text-gray-500 italic">No tags added</dd>
                    </div>
                  )}
                  
                  {currentReport.notes ? (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-2">Notes</dt>
                      <dd className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{currentReport.notes}</dd>
                    </div>
                  ) : (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="text-sm text-gray-500 italic">No notes added</dd>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;