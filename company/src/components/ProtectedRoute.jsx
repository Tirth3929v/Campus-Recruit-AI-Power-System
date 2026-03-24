import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Prevent students or employees from entering the company dashboard
  if (user.role !== 'company') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white px-4 text-center">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm mb-6">
            You are logged in as a <strong>{user.role}</strong>. This portal is for company representatives only. Please log out and sign in with a company account to access this page.
          </p>
          <a href="/login" onClick={(e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = '/login';
          }} className="block w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">
            Sign Out
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;