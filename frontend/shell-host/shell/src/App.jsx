// shell-host/src/App.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AngularTrackerWrapper from './components/AngularTrackerWrapper';

// Dynamic imports for micro-frontends and exposed components
const RemoteLoginForm = React.lazy(() => import('authApp/LoginForm'));
const RemoteAdminApp = React.lazy(() => import('adminApp/App'));
const RemoteMainLayout = React.lazy(() => import('sharedApp/MainLayout'));
const ProtectedRoute = React.lazy(() => import('adminApp/ProtectedRoute'));

export default function App() {
  // Use centralized in-memory auth state
  const { token, loading, logout } = useAuth();

  return (
    <Suspense fallback={<div>Loading shell...</div>}>
      <Routes>
        {/* Public login route */}
        <Route 
          path="/login/*" 
          element={
            !token && !loading ? (
              <RemoteLoginForm />
            ) : (
              <Navigate to="/admin" replace />
            )
          } 
        />

        {/* 🔒 Protected Route 1: Admin MFE */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute token={token} isInitializing={loading} allowedRoles={['admin', 'user']}>
              <RemoteMainLayout onLogout={logout}>
                <RemoteAdminApp />
              </RemoteMainLayout>
            </ProtectedRoute>
          } 
        />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* 🔒 Protected Route 2: Angular Tracker MFE */}
        <Route 
          path="/tracker/*" 
          element={
            <ProtectedRoute token={token} isInitializing={loading}>
              <RemoteMainLayout onLogout={logout}>
                <AngularTrackerWrapper token={token} />
              </RemoteMainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Root URL handler: Redirects to /admin by default if authenticated */}
        <Route 
          path="/" 
          element={<Navigate to={token ? "/admin" : "/login"} replace />} 
        />

        {/* Default fallback for unknown paths */}
        <Route 
          path="*" 
          element={<Navigate to={token ? "/admin" : "/login"} replace />} 
        />
      </Routes>
    </Suspense>
  );
}