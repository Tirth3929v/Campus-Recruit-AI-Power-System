import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import UserLayout from './layouts/UserLayout';
import Dashboard from './pages/Dashboard';
import InterviewPage from './pages/InterviewPage';
import Login from './pages/Login';
import Register from './pages/Register';
import SignUp from './pages/Signup';
import ProtectedRoute from './pages/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import JobsPage from './pages/JobsPage';
import CoursesPage from './pages/CoursesPage';
import CourseViewer from './pages/CourseViewer';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import { Loader2 } from 'lucide-react';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse">Loading...</p>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/student/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ThemeProvider>
          <ChatProvider>
            <Routes>
              {/* ---------- Public ---------- */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* ---------- Student Portal (with persistent sidebar layout) ---------- */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="interview" element={<InterviewPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* ---------- Redirects ---------- */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Course Player Route - MUST be before catch-all and OUTSIDE student layout */}
              <Route path="/learning/:courseId" element={<CourseViewer />} />
              <Route path="/course/player/:courseId" element={<CourseViewer />} />
              
              {/* Catch-all redirect - must be last */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </ChatProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
