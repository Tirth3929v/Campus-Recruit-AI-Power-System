import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, Clock, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse">Verifying session...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (user.role !== 'company') {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-white px-4 text-center">
        <div className="bg-slate-800/60 border border-slate-700 p-8 rounded-2xl max-w-md">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm mb-6">
            You are logged in as <strong>{user.role}</strong>. This portal is for companies only.
          </p>
          <button onClick={logout} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Company registered but not yet approved by employee
  if (!user.isVerified) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-white px-4 text-center">
        <div className="bg-slate-800/60 border border-amber-500/20 p-8 rounded-2xl max-w-md w-full">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock size={32} />
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building2 size={18} className="text-amber-400" />
            <h2 className="text-xl font-bold text-white">{user.companyName || 'Your Company'}</h2>
          </div>
          <h3 className="text-lg font-semibold text-amber-400 mb-3">Pending Approval</h3>
          <p className="text-gray-400 text-sm mb-2">
            Your company registration has been submitted and is currently under review by our team.
          </p>
          <p className="text-gray-500 text-xs mb-6">
            You will receive an email at <span className="text-amber-400">{user.email}</span> once your account is approved.
          </p>
          <div className="space-y-2 text-left bg-white/5 rounded-xl p-4 mb-6 text-xs text-gray-400">
            <p>✅ Registration received</p>
            <p>⏳ Employee verification — <span className="text-amber-400">In progress</span></p>
            <p className="opacity-40">🔓 Portal access granted</p>
          </div>
          <button onClick={logout} className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
