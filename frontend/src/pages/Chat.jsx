import { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useReports } from '../contexts/ReportContext';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  DocumentTextIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  ClockIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  
  const {
    messages,
    loading,
    searchResults,
    fetchChat,
    sendMessage,
    searchMessages,
    clearChatHistory,
    clearSearch
  } = useChat();
  
  const { reports } = useReports();
  const messagesEndRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    fetchChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const result = await sendMessage(message.trim(), selectedReportId || null);
    if (result.success) {
      setMessage('');
      setSelectedReportId('');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    await searchMessages(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    clearSearch();
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      await clearChatHistory();
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

  const getReportName = (reportId) => {
    if (!reportId) return null;
    const report = reports.find(r => r._id === reportId);
    return report ? report.originalName : 'Unknown Report';
  };

  const displayMessages = showSearch && searchResults.length > 0 ? searchResults : messages;

  const carouselItems = [
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      icon: LightBulbIcon,
      content: (
        <div className="d-flex flex-column gap-2 h-100">
          <button
            onClick={() => setMessage("Can you explain my latest blood test results?")}
            className="btn btn-outline-primary text-start px-2 py-1 flex-grow-1"
            disabled={loading}
          >
            <small>Explain my results</small>
          </button>
          <button
            onClick={() => setMessage("What should I ask my doctor about?")}
            className="btn btn-outline-primary text-start px-2 py-1 flex-grow-1"
            disabled={loading}
          >
            <small>Questions for doctor</small>
          </button>
          <button
            onClick={() => setMessage("What do these abnormal values mean?")}
            className="btn btn-outline-primary text-start px-2 py-1 flex-grow-1"
            disabled={loading}
          >
            <small>Explain abnormal values</small>
          </button>
          <button
            onClick={() => setMessage("Give me health recommendations based on my reports")}
            className="btn btn-outline-primary text-start px-2 py-1 flex-grow-1"
            disabled={loading}
          >
            <small>Health recommendations</small>
          </button>
        </div>
      )
    },
    {
      id: 'recent-reports',
      title: 'Recent Reports',
      icon: DocumentTextIcon,
      content: reports.length > 0 ? (
        <div className="d-flex flex-column gap-2 h-100">
          {reports.slice(0, 3).map((report) => (
            <button
              key={report._id}
              onClick={() => setSelectedReportId(report._id)}
              className={`btn text-start px-2 py-1 flex-grow-1 ${selectedReportId === report._id ? 'btn-primary' : 'btn-outline-primary'}`}
            >
              <div className="fw-semibold text-truncate small">{report.originalName}</div>
              <div className="small text-muted d-flex align-items-center mt-1">
                <ClockIcon className="h-3 w-3 me-1" />
                {new Date(report.createdAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted small h-100 d-flex align-items-center justify-content-center">
          No reports available
        </div>
      )
    },
    {
      id: 'chat-tips',
      title: 'Chat Tips',
      icon: InformationCircleIcon,
      content: (
        <div className="small text-muted h-100 d-flex flex-column justify-content-center">
          <div className="mb-1">• Ask specific questions</div>
          <div className="mb-1">• Request English/Urdu explanations</div>
          <div className="mb-1">• Ask for recommendations</div>
          <div className="mb-0">• Reference specific reports</div>
        </div>
      )
    }
  ];

  const nextCarousel = () => {
    setActiveCarouselIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const prevCarousel = () => {
    setActiveCarouselIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header mb-4 mb-md-6">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div className="flex-grow-1">
            <h1 className="h4 h3-md mb-1">AI Health Assistant</h1>
            <p className="text-secondary mb-0 small">
              Ask questions about your health and medical reports.
            </p>
          </div>
          
          <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`btn ${showSearch ? 'btn-primary' : 'btn-outline-primary'} btn-sm flex-grow-1 flex-md-grow-0`}
            >
              <MagnifyingGlassIcon className="h-4 w-4 me-1 me-md-2" />
              <span>{showSearch ? 'Hide Search' : 'Search'}</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="btn btn-outline-danger btn-sm flex-grow-1 flex-md-grow-0"
            >
              <TrashIcon className="h-4 w-4 me-1 me-md-2" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="card mb-4 mb-md-6 slide-up">
          <div className="card-body p-3 p-md-4">
            <form onSubmit={handleSearch} className="d-flex flex-column flex-md-row gap-3 align-items-end">
              <div className="flex-grow-1 w-100">
                <label className="form-label mb-2 small">Search Chat History</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type keywords to search through your conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="d-flex gap-2 w-100 w-md-auto">
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1 flex-md-grow-0"
                  disabled={loading || !searchQuery.trim()}
                >
                  {loading ? (
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  ) : (
                    <MagnifyingGlassIcon className="h-4 w-4 me-2" />
                  )}
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="btn btn-outline-secondary flex-grow-1 flex-md-grow-0"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row g-3 g-md-4">
        {/* Chat Messages - Always visible, takes full width on mobile */}
        <div className="col-12 col-lg-8">
          <div className="chat-card h-100">
            <div className="chat-messages">
              {displayMessages.length === 0 ? (
                <div className="empty-chat text-center py-5">
                  <ChatBubbleLeftRightIcon className="mx-auto h-12 h-md-16 w-12 w-md-16 text-muted mb-3" />
                  <h3 className="h5 h4-md text-muted mb-2">No messages yet</h3>
                  <p className="text-muted mb-4 small">
                    Start a conversation by asking a question about your health.
                  </p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <button
                      onClick={() => setMessage("Can you explain my latest blood test results?")}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Explain Results
                    </button>
                    <button
                      onClick={() => setMessage("What should I ask my doctor about?")}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Doctor Questions
                    </button>
                  </div>
                </div>
              ) : (
                displayMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${msg.role} fade-in`}
                  >
                    <div className="message-avatar">
                      {msg.role === 'assistant' ? (
                        <div className="ai-avatar">
                          <span>AI</span>
                        </div>
                      ) : (
                        <div className="user-avatar">
                          <UserIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-text">{msg.content}</div>
                      {msg.reportId && (
                        <div className="message-report mt-2">
                          <small className="text-muted">{getReportName(msg.reportId)}</small>
                        </div>
                      )}
                      <div className="message-time">
                        <small className="text-muted">{formatDate(msg.timestamp)}</small>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="chat-message assistant">
                  <div className="message-avatar">
                    <div className="ai-avatar">
                      <span>AI</span>
                    </div>
                  </div>
                  <div className="message-content">
                    <div className="d-flex align-items-center text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="chat-input">
              <form onSubmit={handleSendMessage} className="w-100">
                {/* Report Selection */}
                {reports.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Reference Report (Optional)
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedReportId}
                      onChange={(e) => setSelectedReportId(e.target.value)}
                    >
                      <option value="">No specific report</option>
                      {reports.map((report) => (
                        <option key={report._id} value={report._id}>
                          {report.originalName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ask about your health or medical reports..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center"
                    disabled={loading || !message.trim()}
                  >
                    {loading ? (
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="col-12 col-lg-4 d-none d-lg-block">
          <div className="chat-sidebar">
            {/* Quick Actions */}
            <div className="card mb-4">
              <div className="card-header bg-light border-bottom-0 pb-2">
                <h5 className="card-title mb-0 d-flex align-items-center fw-semibold">
                  <LightBulbIcon className="h-5 w-5 me-2 text-primary flex-shrink-0" />
                  Quick Actions
                </h5>
              </div>
              <div className="card-body pt-0 px-3">
                <div className="d-grid gap-2">
                  <button
                    onClick={() => setMessage("Can you explain my latest blood test results?")}
                    className="btn btn-outline-primary text-start px-3 py-2 d-flex align-items-center"
                    disabled={loading}
                  >
                    <span className="flex-grow-1">Explain my results</span>
                    <ArrowRightIcon className="h-4 w-4 flex-shrink-0" />
                  </button>
                  <button
                    onClick={() => setMessage("What should I ask my doctor about?")}
                    className="btn btn-outline-primary text-start px-3 py-2 d-flex align-items-center"
                    disabled={loading}
                  >
                    <span className="flex-grow-1">Questions for doctor</span>
                    <ArrowRightIcon className="h-4 w-4 flex-shrink-0" />
                  </button>
                  <button
                    onClick={() => setMessage("What do these abnormal values mean?")}
                    className="btn btn-outline-primary text-start px-3 py-2 d-flex align-items-center"
                    disabled={loading}
                  >
                    <span className="flex-grow-1">Explain abnormal values</span>
                    <ArrowRightIcon className="h-4 w-4 flex-shrink-0" />
                  </button>
                  <button
                    onClick={() => setMessage("Give me health recommendations based on my reports")}
                    className="btn btn-outline-primary text-start px-3 py-2 d-flex align-items-center"
                    disabled={loading}
                  >
                    <span className="flex-grow-1">Health recommendations</span>
                    <ArrowRightIcon className="h-4 w-4 flex-shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            {reports.length > 0 && (
              <div className="card mb-4">
                <div className="card-header bg-light border-bottom-0 pb-2">
                  <h5 className="card-title mb-0 d-flex align-items-center fw-semibold">
                    <DocumentTextIcon className="h-5 w-5 me-2 text-primary flex-shrink-0" />
                    Recent Reports
                  </h5>
                </div>
                <div className="card-body pt-0 px-3">
                  <div className="d-grid gap-2">
                    {reports.slice(0, 3).map((report) => (
                      <button
                        key={report._id}
                        onClick={() => setSelectedReportId(report._id)}
                        className={`btn text-start p-2 rounded ${selectedReportId === report._id ? 'btn-primary' : 'btn-outline-primary'}`}
                      >
                        <div className="fw-semibold text-truncate small">{report.originalName}</div>
                        <div className="small text-muted d-flex align-items-center mt-1">
                          <ClockIcon className="h-3 w-3 me-1" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Tips */}
            <div className="card">
              <div className="card-header bg-light border-bottom-0 pb-2">
                <h5 className="card-title mb-0 d-flex align-items-center fw-semibold">
                  <InformationCircleIcon className="h-5 w-5 me-2 text-warning flex-shrink-0" />
                  Chat Tips
                </h5>
              </div>
              <div className="card-body pt-0 px-3">
                <div className="small text-muted">
                  <div className="d-flex align-items-start mb-2">
                    <span className="bullet-point me-2 flex-shrink-0">•</span>
                    <span>Ask specific questions about your reports</span>
                  </div>
                  <div className="d-flex align-items-start mb-2">
                    <span className="bullet-point me-2 flex-shrink-0">•</span>
                    <span>Request explanations in both English and Roman Urdu</span>
                  </div>
                  <div className="d-flex align-items-start mb-2">
                    <span className="bullet-point me-2 flex-shrink-0">•</span>
                    <span>Ask for recommendations and next steps</span>
                  </div>
                  <div className="d-flex align-items-start mb-0">
                    <span className="bullet-point me-2 flex-shrink-0">•</span>
                    <span>Reference specific reports for context</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Carousel */}
        <div className="col-12 d-lg-none">
          <div className="mobile-cards-carousel">
            <div className="carousel-header d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0 text-muted">Quick Access</h6>
              <div className="carousel-controls d-flex gap-1">
                <button 
                  onClick={prevCarousel}
                  className="btn btn-sm btn-outline-secondary p-1"
                  disabled={carouselItems.length <= 1}
                >
                  <ChevronLeftIcon className="h-3 w-3" />
                </button>
                <button 
                  onClick={nextCarousel}
                  className="btn btn-sm btn-outline-secondary p-1"
                  disabled={carouselItems.length <= 1}
                >
                  <ChevronRightIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <div className="carousel-container position-relative">
              <div 
                ref={carouselRef}
                className="carousel-track d-flex gap-3"
                style={{ 
                  transform: `translateX(-${activeCarouselIndex * 100}%)`,
                  transition: 'transform 0.3s ease'
                }}
              >
                {carouselItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="carousel-slide flex-shrink-0 w-100"
                  >
                    <div className="card h-100 mobile-card">
                      <div className="card-header bg-light border-bottom-0 py-2">
                        <h6 className="card-title mb-0 d-flex align-items-center small">
                          <item.icon className="h-4 w-4 me-2 flex-shrink-0" />
                          {item.title}
                        </h6>
                      </div>
                      <div className="card-body py-2 px-3">
                        {item.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Indicators */}
            {carouselItems.length > 1 && (
              <div className="carousel-indicators d-flex justify-content-center gap-1 mt-2">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === activeCarouselIndex ? 'active' : ''}`}
                    onClick={() => setActiveCarouselIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;