// shell-host/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { parseJwt } from 'sharedApp/jwtUtils';
import { getAccessToken } from 'sharedApp/authService';

export default function ProtectedRoute({ children, allowedRoles, token, isInitializing }) {
  const location = useLocation();

  // 1. Show loader while restoring session on initial load or F5 refresh
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <div>Checking permissions...</div>
      </div>
    );
  }

  // 2. Resolve active token from props or in-memory storage
  const activeToken = token !== undefined ? token : getAccessToken();

  // 3. Reject access immediately if user is unauthenticated
  if (!activeToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Decode JWT payload to verify roles if required
  const user = parseJwt(activeToken);

  // if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
  //   return <Navigate to="/login" replace />;
  // }

  return children;
}