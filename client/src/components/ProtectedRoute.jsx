import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // Retrieve user from localStorage. 
  // Note: Ensure your login logic saves the user object as 'userInfo' or 'user'
  const user = JSON.parse(localStorage.getItem('userInfo') || localStorage.getItem('user') || 'null');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;