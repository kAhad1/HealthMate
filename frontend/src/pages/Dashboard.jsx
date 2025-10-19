import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../contexts/ReportContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { 
    reports, 
    loading, 
    pagination, 
    filters, 
    fetchReports, 
    deleteReport, 
    retryAnalysis,
    setFilters 
  } = useReports();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [sortBy, setSortBy] = useState(filters.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState(filters.sortOrder || 'desc');

  useEffect(() => {
    fetchReports(1, { search: searchTerm, status: statusFilter, sortBy, sortOrder });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReports(1, { search: searchTerm, status: statusFilter, sortBy, sortOrder });
  };

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchReports(1, updatedFilters);
  };

  const handlePageChange = (page) => {
    fetchReports(page, { search: searchTerm, status: statusFilter, sortBy, sortOrder });
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      await deleteReport(reportId);
    }
  };

  const handleRetryAnalysis = async (reportId) => {
    await retryAnalysis(reportId);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { class: 'badge-status-completed', text: 'Complete', icon: 'bi-check-circle' },
      processing: { class: 'badge-status-processing', text: 'Processing', icon: 'bi-clock' },
      failed: { class: 'badge-status-failed', text: 'Failed', icon: 'bi-x-circle' },
      pending: { class: 'badge-status-pending', text: 'Pending', icon: 'bi-clock' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`badge ${config.class}`}>
        <i className={`bi ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 fw-bold text-dark mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-muted mb-0">
            Manage your medical reports and AI-powered health insights.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <Link to="/upload" className="text-decoration-none">
            <div className="card h-100 report-card">
              <div className="card-body d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-cloud-upload text-primary fs-2"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="card-title mb-1">Upload Report</h5>
                  <p className="card-text text-muted small mb-0">Add a new medical report for analysis</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="col-md-4 mb-3">
          <Link to="/timeline" className="text-decoration-none">
            <div className="card h-100 report-card">
              <div className="card-body d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-clock-history text-primary fs-2"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="card-title mb-1">View Timeline</h5>
                  <p className="card-text text-muted small mb-0">See your reports chronologically</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="col-md-4 mb-3">
          <Link to="/chat" className="text-decoration-none">
            <div className="card h-100 report-card">
              <div className="card-body d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-chat-dots text-primary fs-2"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="card-title mb-1">AI Chat</h5>
                  <p className="card-text text-muted small mb-0">Ask questions about your health</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Search Reports</label>
                <div className="search-container">
                  <i className="bi bi-search search-icon"></i>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Sort By</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Date</option>
                  <option value="originalName">Name</option>
                  <option value="analysisStatus">Status</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Order</label>
                <select
                  className="form-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              <div className="col-md-3 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i>
                      Search
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setSortBy('createdAt');
                    setSortOrder('desc');
                    fetchReports(1, {});
                  }}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Reports List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-file-medical me-2"></i>
            Your Reports ({pagination.totalReports})
          </h5>
        </div>
        <div className="card-body">
          {reports.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-file-medical"></i>
              <h4 className="mt-3 mb-2">No reports found</h4>
              <p className="text-muted mb-4">
                {searchTerm || statusFilter
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by uploading your first medical report.'}
              </p>
              {!searchTerm && !statusFilter && (
                <Link to="/upload" className="btn btn-primary">
                  <i className="bi bi-cloud-upload me-2"></i>
                  Upload Report
                </Link>
              )}
            </div>
          ) : (
            <div className="row">
              {reports.map((report) => (
                <div key={report._id} className="col-12 mb-3">
                  <div className="card report-card">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <div className="d-flex align-items-start">
                            <i className="bi bi-file-medical text-muted me-3 fs-4"></i>
                            <div className="flex-grow-1">
                              <h6 className="card-title mb-1 d-flex align-items-center">
                                {report.originalName}
                                {report.isImportant && (
                                  <i className="bi bi-star-fill text-warning ms-2"></i>
                                )}
                              </h6>
                              <div className="d-flex align-items-center text-muted small mb-2">
                                <span className="me-3">
                                  <i className="bi bi-file-earmark me-1"></i>
                                  {formatFileSize(report.fileSize)}
                                </span>
                                <span>
                                  <i className="bi bi-calendar me-1"></i>
                                  {formatDate(report.createdAt)}
                                </span>
                              </div>
                              
                              {report.tags && report.tags.length > 0 && (
                                <div className="mb-2">
                                  {report.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="badge bg-light text-dark me-1"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="d-flex align-items-center">
                                {getStatusBadge(report.analysisStatus)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-4 text-end">
                          <div className="btn-group" role="group">
                            <Link
                              to={`/report/${report._id}`}
                              className="btn btn-outline-primary btn-sm"
                              title="View Report"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>

                            {report.analysisStatus === 'failed' && (
                              <button
                                onClick={() => handleRetryAnalysis(report._id)}
                                className="btn btn-outline-warning btn-sm"
                                title="Retry Analysis"
                                disabled={loading}
                              >
                                <i className="bi bi-arrow-clockwise"></i>
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(report._id)}
                              className="btn btn-outline-danger btn-sm"
                              title="Delete Report"
                              disabled={loading}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted small">
                Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalReports} total reports)
              </div>
              <div className="btn-group" role="group">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-chevron-left"></i>
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="btn btn-outline-primary"
                >
                  Next
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;