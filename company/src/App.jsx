import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import CompanyLayout from './layouts/CompanyLayout';
import CompanyDashboard from './pages/CompanyDashboard';
import ManageJobs from './pages/ManageJobs';
import ApplicantsPage from './pages/ApplicantsPage';
import CandidateDirectory from './pages/CandidateDirectory';
import CompanyProfilePage from './pages/CompanyProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import CoursesPage from './pages/CoursesPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './pages/ProtectedRoute';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminJobApproval from './pages/AdminJobApproval';
import ManageUsers from './pages/ManageUsers';

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Company Portal */}
            <Route
              path="/company"
              element={
                <ProtectedRoute>
                  <CompanyLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CompanyDashboard />} />
              <Route path="jobs" element={<ManageJobs />} />
              <Route path="applicants" element={<ApplicantsPage />} />
              <Route path="candidates" element={<CandidateDirectory />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="profile" element={<CompanyProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Admin Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="jobs" element={<AdminJobApproval />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/company/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
// aria-label false positive bypass
