import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ReportProvider } from './contexts/ReportContext';
import { ChatProvider } from './contexts/ChatContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadReport from './pages/UploadReport';
import ReportDetail from './pages/ReportDetail';
import Timeline from './pages/Timeline';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <ReportProvider>
        <ChatProvider>
          <Router>
            <div className="min-vh-100 bg-light">
              <Navbar />
              <main className="pb-5">
                <Routes>
                  {/* Public Routes */}
                  <Route 
                    path="/login" 
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    } 
                  />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/upload" 
                    element={
                      <ProtectedRoute>
                        <UploadReport />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/report/:id" 
                    element={
                      <ProtectedRoute>
                        <ReportDetail />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/timeline" 
                    element={
                      <ProtectedRoute>
                        <Timeline />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* 404 Route */}
                  <Route 
                    path="*" 
                    element={
                      <div className="min-vh-100 d-flex align-items-center justify-content-center">
                        <div className="text-center">
                          <h1 className="display-1 fw-bold text-primary mb-4">404</h1>
                          <p className="lead text-muted mb-4">Page not found</p>
                          <a href="/dashboard" className="btn btn-primary btn-lg">
                            <i className="bi bi-house-door me-2"></i>
                            Go to Dashboard
                          </a>
                        </div>
                      </div>
                    } 
                  />
                </Routes>
              </main>
            </div>
          </Router>
        </ChatProvider>
      </ReportProvider>
    </AuthProvider>
  );
}

export default App;