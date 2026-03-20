import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout & Route Guards
import EmployeeLayout from './pages/EmployeeLayout';
import ProtectedRoute from './pages/ProtectedRoute';

// Public pages
import Login from './pages/Login';
import EmployeeRegister from './pages/EmployeeRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Employee pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import CourseBuilder from './pages/CourseBuilder';
import JobBoard from './pages/JobBoard';
import EmployeeJobBoard from './pages/EmployeeJobBoard';
import MyProfile from './pages/MyProfile';
import SendNotification from './pages/SendNotification';

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* ---------- Public ---------- */}
            <Route path="/login" element={<Login />} />
            <Route path="/employee/register" element={<EmployeeRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* ---------- Employee Panel ---------- */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute>
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<EmployeeDashboard />} />
              <Route path="courses" element={<CourseBuilder />} />
              <Route path="jobs" element={<EmployeeJobBoard />} />
              <Route path="all-jobs" element={<JobBoard />} />
              <Route path="notifications/send" element={<SendNotification />} />
              <Route path="profile" element={<MyProfile />} />
            </Route>

            {/* ---------- Redirects ---------- */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;