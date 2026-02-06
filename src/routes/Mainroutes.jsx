import React from 'react'
import { Route, Routes, Navigate } from 'react-router'
import SignUpPage from '../pages/SignUpPage'
import LoginPage from '../pages/LoginPage'
import Dashboard from '../pages/Dashboard'
import TransactionsPage from '../pages/TransactionsPage'
import ReportsPage from '../pages/ReportsPage'
import SettingsPage from '../pages/SettingsPage'
import NotFound from '../pages/NotFound'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import { useAuthStore } from '../store/authStore'

function Mainroutes() {
    const { token, user } = useAuthStore();

    return (
        <Routes>
            <Route
                path="/"
                element={
                    token && user ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    )
                }
            />
            <Route
                path="/signup"
                element={
                    <PublicRoute>
                        <SignUpPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/transactions"
                element={
                    <ProtectedRoute>
                        <TransactionsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <ReportsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <SettingsPage />
                    </ProtectedRoute>
                }
            />
            {/* Catch-all route for undefined paths */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default Mainroutes