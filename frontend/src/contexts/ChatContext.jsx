import { createContext, useContext, useReducer } from 'react';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';

const ChatContext = createContext();

const initialState = {
  messages: [],
  loading: false,
  error: null,
  stats: {
    totalMessages: 0,
    userMessages: 0,
    aiMessages: 0,
    lastActivity: null,
    isActive: false
  },
  searchQuery: '',
  searchResults: []
};

const chatReducer = (state, action) => {
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
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
        loading: false,
        error: null
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'ADD_MESSAGES':
      return {
        ...state,
        messages: [...state.messages, ...action.payload]
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: []
      };
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload
      };
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload
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

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const fetchChat = async () => {
    try {
      setLoading(true);
      
      const response = await chatAPI.getChat();
      
      if (response.data.success) {
        dispatch({ type: 'SET_MESSAGES', payload: response.data.data.chat.messages });
      } else {
        throw new Error(response.data.message || 'Failed to fetch chat');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch chat';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      // ✅ Add finally block
      setLoading(false);
    }
  };
  
  const sendMessage = async (message, reportId = null) => {
    try {
      setLoading(true);
      
      const response = await chatAPI.sendMessage({ message, reportId });
      
      if (response.data.success) {
        const { userMessage, aiResponse } = response.data.data;
        
        dispatch({ type: 'ADD_MESSAGES', payload: [userMessage, aiResponse] });
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // ✅ CRITICAL FIX: Always reset loading state
      setLoading(false);
    }
  };

  const fetchChatHistory = async (limit = 50, offset = 0) => {
    try {
      setLoading(true);
      
      const response = await chatAPI.getChatHistory({ limit, offset });
      
      if (response.data.success) {
        dispatch({ type: 'SET_MESSAGES', payload: response.data.data.messages });
        return { 
          success: true, 
          hasMore: response.data.data.hasMore 
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch chat history');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch chat history';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // ✅ Add finally block
      setLoading(false);
    }
  };
  

  const clearChatHistory = async () => {
    try {
      setLoading(true);
      
      const response = await chatAPI.clearChatHistory();
      
      if (response.data.success) {
        dispatch({ type: 'CLEAR_MESSAGES' });
        toast.success('Chat history cleared successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to clear chat history');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear chat history';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // ✅ Add finally block
      setLoading(false);
    }
  };

  const fetchChatStats = async () => {
    try {
      const response = await chatAPI.getChatStats();
      
      if (response.data.success) {
        dispatch({ type: 'SET_STATS', payload: response.data.data });
        return { success: true, stats: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to fetch chat stats');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch chat stats';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const searchMessages = async (query, limit = 20) => {
    try {
      setLoading(true);
      
      const response = await chatAPI.searchMessages({ query, limit });
      
      if (response.data.success) {
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: response.data.data.messages });
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
        return { 
          success: true, 
          results: response.data.data.messages,
          totalResults: response.data.data.totalResults
        };
      } else {
        throw new Error(response.data.message || 'Search failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Search failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // ✅ Add finally block
      setLoading(false);
    }
  };
  const clearSearch = () => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
  };
    
  const value = {
    ...state,
    fetchChat,
    sendMessage,
    fetchChatHistory,
    clearChatHistory,
    fetchChatStats,
    searchMessages,
    clearSearch,
    setLoading,
    setError,
    clearError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
