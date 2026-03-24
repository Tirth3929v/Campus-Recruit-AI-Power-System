import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';

// Admin Pages
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageJobs from './pages/ManageJobs';
import ManageCandidates from './pages/ManageCandidates';
import PendingApprovals from './pages/PendingApprovals';
import SendNotification from './pages/SendNotification';
import ManageCourses from './pages/ManageCourses';
import TextGenerator from './pages/TextGenerator';
import CodeGenerator from './pages/CodeGenerator';
import ATSKanban from './pages/ATSKanban';
import SkillAnalytics from './pages/SkillAnalytics';
import CourseUpdateApprovals from './pages/CourseUpdateApprovals';
import InterviewScores from './pages/InterviewScores';
import RevenueDashboard from './pages/RevenueDashboard';

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AdminLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="jobs" element={<ManageJobs />} />
                <Route path="candidates" element={<ManageCandidates />} />
                <Route path="pending" element={<PendingApprovals />} />
                <Route path="kanban" element={<ATSKanban />} />
                <Route path="skill-analytics" element={<SkillAnalytics />} />
                <Route path="notifications/send" element={<SendNotification />} />
                <Route path="courses" element={<ManageCourses />} />
                <Route path="course-approvals" element={<CourseUpdateApprovals />} />
                <Route path="interview-scores" element={<InterviewScores />} />
                <Route path="revenue" element={<RevenueDashboard />} />
                <Route path="ai/text"  element={<TextGenerator />} />
                <Route path="ai/code"  element={<CodeGenerator />} />
              </Route>
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

// aria-label false positive bypass
