import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './panels/Auth/Login';
import Register from './panels/Auth/Register';
import ForgotPassword from './panels/Auth/ForgotPassword';

// Student Pages
import Dashboard from './panels/UserPanel/pages/Dashboard';
import InterviewPage from './panels/UserPanel/pages/InterviewPage';
import InterviewHistory from './panels/UserPanel/pages/InterviewHistory';
import ProfileSettings from './panels/UserPanel/pages/ProfileSettings';
import Community from './panels/UserPanel/pages/Community';

// Admin Pages
import AdminPanel from './panels/Admin/pages/AdminPanel';

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
              <Route path="/student/dashboard" element={<Dashboard />} />
              <Route path="/student/interview" element={<InterviewPage />} />
              <Route path="/student/history" element={<InterviewHistory />} />
              <Route path="/student/profile" element={<ProfileSettings />} />
              <Route path="/student/community" element={<Community />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            {/* Catch all - Redirect to Login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;