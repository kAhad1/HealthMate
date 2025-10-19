import { createContext, useContext, useReducer } from 'react';
import { reportAPI } from '../services/api';
import toast from 'react-hot-toast';

const ReportContext = createContext();

const initialState = {
  reports: [],
  currentReport: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

const reportReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'SET_REPORTS':
      return {
        ...state,
        reports: action.payload.reports,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };
    case 'ADD_REPORT':
      return {
        ...state,
        reports: [action.payload, ...state.reports],
        pagination: {
          ...state.pagination,
          totalReports: state.pagination.totalReports + 1
        }
      };
    case 'UPDATE_REPORT':
      return {
        ...state,
        reports: state.reports.map(report =>
          report._id === action.payload._id ? action.payload : report
        ),
        currentReport: state.currentReport?._id === action.payload._id ? action.payload : state.currentReport
      };
    case 'DELETE_REPORT':
      return {
        ...state,
        reports: state.reports.filter(report => report._id !== action.payload),
        pagination: {
          ...state.pagination,
          totalReports: state.pagination.totalReports - 1
        },
        currentReport: state.currentReport?._id === action.payload ? null : state.currentReport
      };
    case 'SET_CURRENT_REPORT':
      return {
        ...state,
        currentReport: action.payload
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const ReportProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reportReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const fetchReports = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: 10,
        ...state.filters,
        ...filters
      };

      const response = await reportAPI.getReports(params);
      
      if (response.data.success) {
        dispatch({
          type: 'SET_REPORTS',
          payload: {
            reports: response.data.data.reports,
            pagination: response.data.data.pagination
          }
        });
        
        if (filters && Object.keys(filters).length > 0) {
          dispatch({ type: 'SET_FILTERS', payload: filters });
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch reports');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch reports';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const fetchReport = async (id) => {
    try {
      setLoading(true);
      
      const response = await reportAPI.getReport(id);
      
      if (response.data.success) {
        dispatch({ type: 'SET_CURRENT_REPORT', payload: response.data.data.report });
      } else {
        throw new Error(response.data.message || 'Failed to fetch report');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch report';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const uploadReport = async (file, tags = [], notes = '') => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('report', file);
      if (tags.length > 0) formData.append('tags', tags.join(','));
      if (notes) formData.append('notes', notes);

      const response = await reportAPI.uploadReport(formData);
      
      if (response.data.success) {
        dispatch({ type: 'ADD_REPORT', payload: response.data.data.report });
        toast.success('Report uploaded successfully! AI analysis in progress.');
        return { success: true, report: response.data.data.report };
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateReport = async (id, updateData) => {
    try {
      setLoading(true);
      
      const response = await reportAPI.updateReport(id, updateData);
      
      if (response.data.success) {
        dispatch({ type: 'UPDATE_REPORT', payload: response.data.data.report });
        toast.success('Report updated successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteReport = async (id) => {
    try {
      setLoading(true);
      
      const response = await reportAPI.deleteReport(id);
      
      if (response.data.success) {
        dispatch({ type: 'DELETE_REPORT', payload: id });
        toast.success('Report deleted successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Delete failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Delete failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const retryAnalysis = async (id) => {
    try {
      setLoading(true);
      
      const response = await reportAPI.retryAnalysis(id);
      
      if (response.data.success) {
        toast.success('Analysis retry initiated!');
        // Refresh the report to get updated status
        await fetchReport(id);
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Retry failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Retry failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const fetchTimeline = async (year, month) => {
    try {
      setLoading(true);
      
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;

      const response = await reportAPI.getTimeline(params);
      
      if (response.data.success) {
        return { success: true, timeline: response.data.data.timeline };
      } else {
        throw new Error(response.data.message || 'Failed to fetch timeline');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch timeline';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const value = {
    ...state,
    fetchReports,
    fetchReport,
    uploadReport,
    updateReport,
    deleteReport,
    retryAnalysis,
    fetchTimeline,
    setFilters,
    setLoading,
    setError,
    clearError
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
};
