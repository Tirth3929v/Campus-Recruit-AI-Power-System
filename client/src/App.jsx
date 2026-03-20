import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeLayout from './layouts/EmployeeLayout';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import JobPostings from './pages/Employee/JobPostings';
import Candidates from './pages/Employee/Candidates';
import Interviews from './pages/Employee/Interviews';
import Settings from './pages/Employee/Settings';
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/Student/StudentDashboard';
import MyApplications from './pages/Student/MyApplications';
import BrowseJobs from './pages/Student/BrowseJobs';
import StudentProfile from './pages/Student/StudentProfile';
import AIInterview from './pages/Career/AIInterview';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Placeholder) */}
        <Route path="/" element={
          <div style={{textAlign: 'center', marginTop: '50px'}}>
            <h1>Welcome to Campus Recruit</h1>
            <div style={{display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px'}}>
              <a href="/login" style={{padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', borderRadius: '5px', textDecoration: 'none'}}>Login</a>
              <a href="/register" style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '5px', textDecoration: 'none'}}>Register</a>
            </div>
          </div>
        } />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

        {/* Employee Panel Routes */}
        <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="jobs" element={<JobPostings />} />
            <Route path="jobs/:id/candidates" element={<Candidates />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Student Panel Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="jobs" element={<BrowseJobs />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
          <Route path="/interview" element={<AIInterview />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
