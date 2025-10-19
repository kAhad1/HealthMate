import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../contexts/ReportContext';
import {
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const Timeline = () => {
  const { fetchTimeline, loading } = useReports();
  const [timeline, setTimeline] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadTimeline();
  }, [selectedYear, selectedMonth]);

  const loadTimeline = async () => {
    const result = await fetchTimeline(selectedYear, selectedMonth);
    if (result.success) {
      setTimeline(result.timeline);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <ClockIcon className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  };

  const generateMonthOptions = () => {
    const months = [];
    for (let month = 1; month <= 12; month++) {
      months.push(month);
    }
    return months;
  };

  const timelineEntries = Object.entries(timeline).sort(([a], [b]) => new Date(b) - new Date(a));

  if (loading) {
    return <LoadingSpinner text="Loading timeline..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Report Timeline</h1>
        <p className="mt-2 text-gray-600">
          View your medical reports organized by date and time.
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="label">Year</label>
            <select
              className="input-field"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {generateYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Month</label>
            <select
              className="input-field"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {generateMonthOptions().map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadTimeline}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {timelineEntries.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No reports found for {getMonthName(selectedMonth)} {selectedYear}.
          </p>
          <div className="mt-6">
            <Link to="/upload" className="btn-primary">
              Upload Report
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {timelineEntries.map(([date, reports]) => (
            <div key={date} className="card">
              <div className="flex items-center mb-4">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <span className="ml-2 text-sm text-gray-500">
                  ({reports.length} report{reports.length !== 1 ? 's' : ''})
                </span>
              </div>

              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow duration-200"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {report.originalName}
                          </h4>
                          {report.isImportant && (
                            <StarIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatFileSize(report.fileSize)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(report.createdAt)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(report.analysisStatus)}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.analysisStatus)}`}>
                              {report.analysisStatus === 'completed' ? 'Complete' : 
                               report.analysisStatus === 'processing' ? 'Processing' :
                               report.analysisStatus === 'failed' ? 'Failed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/report/${report._id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;
