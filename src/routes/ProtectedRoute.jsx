import React from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '../store/authStore';

function ProtectedRoute({ children }) {
    const { token, user } = useAuthStore();

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // If token exists but user data is still loading, show loading state
    if (token && !user) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;

