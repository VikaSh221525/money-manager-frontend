import React from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '../store/authStore';

function PublicRoute({ children }) {
    const { token, user } = useAuthStore();

    // If user is already logged in, redirect to dashboard
    if (token && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default PublicRoute;
