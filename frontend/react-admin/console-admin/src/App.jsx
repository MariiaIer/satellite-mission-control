import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';

// 1. IMPORT LOCAL PROTECTED ROUTE
import ProtectedRoute from './components/ProtectedRoute'; 

import { getAccessToken, refreshAccessToken } from 'sharedApp/authService';

// 2. LAZY IMPORTS FROM MODULE FEDERATION
const AngularTrackerWrapper = React.lazy(() => import('shellHost/AngularTrackerWrapper'));
const MainLayout = React.lazy(() => import('sharedApp/MainLayout'));

export default function App() {
  // Get initial value from authService in-memory storage
  const [userToken, setUserToken] = useState(() => getAccessToken());
  // Flag to wait for session restoration via HttpOnly cookie on F5 refresh
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Restore session on initial load / F5 refresh
    async function initAuth() {
      try {
        let token = getAccessToken();
        if (!token) {
          // If in-memory storage is empty, try to request a new token via HttpOnly cookie
          token = await refreshAccessToken();
        }
        setUserToken(token);
      } catch (err) {
        console.warn('[App] Session restoration failed:', err);
        setUserToken(null);
      } finally {
        setIsInitializing(false);
      }
    }

    initAuth();

    // Listen for token changes from all microfrontends (sharedApp, react-auth, angular)
    const handleAuthChange = (event) => {
      const newToken = event.detail?.token ?? getAccessToken();
      setUserToken(newToken);
    };

    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // Show loading screen while the /refresh request is pending on F5 (DO NOT redirect)
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <div>Restoring session...</div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading shell...</div>}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Protected Dashboard */}
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute token={userToken} >
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected User List */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute token={userToken} >
              <h1>User List</h1>
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Angular MFE — passing the restored token */}
        <Route 
          path="/tracker/*" 
          element={
            <ProtectedRoute token={userToken}>
              <AngularTrackerWrapper token={userToken} />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </Suspense>
  );
}
