import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './component/Dashboard';

const MainLayout = React.lazy(() => import('sharedApp/MainLayout'));

export default function App() {
  // Add state for the token
  const [userToken, setUserToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    const handleAuthChange = (event) => {
      const newToken = event.detail?.token || localStorage.getItem('token');
      setUserToken(newToken);
    };

    // 1. Listen for changes within the CURRENT tab
    window.addEventListener('auth-change', handleAuthChange);
    
    // 2. Listen for changes from OTHER tabs (native Event)
    window.addEventListener('storage', (e) => {
      if (e.key === 'token') handleAuthChange(e);
    });

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return (
    <Suspense fallback={<div>Loading shell...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/users" element={<h1>User List</h1>} />
        {/* <Route path="/tracker/*" element={<AngularTrackerWrapper />} /> */}
        <Route path="*" element={<h1>Page not found</h1>} />
        </Routes>
    </Suspense>
  );
}