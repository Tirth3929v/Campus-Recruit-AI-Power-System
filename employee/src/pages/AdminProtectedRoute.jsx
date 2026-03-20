import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';

const AdminProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Fetch current user details
                const res = await axiosInstance.get('/me');
                const user = res.data;

                setIsAuthenticated(true);
                // Only allow admin role
                if (user && user.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
                setIsAdmin(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        // Loading state
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // If not logged in at all, go to admin login
    if (isAuthenticated === false) {
        return <Navigate to="/admin/login" replace />;
    }

    // If logged in but NOT an admin, kick them back to the employee dashboard or fallback
    if (!isAdmin) {
        return <Navigate to="/employee" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
