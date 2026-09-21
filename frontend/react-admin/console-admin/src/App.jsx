import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';

// 1. ИМПОРТИРУЕМ ЛОКАЛЬНЫЙ PROTECTED ROUTE
import ProtectedRoute from './components/ProtectedRoute'; // Проверьте путь относительно App.jsx (обычно './components/ProtectedRoute')

import { getAccessToken, refreshAccessToken } from 'sharedApp/authService';

// 2. ЛЕНИВЫЙ ИМПОРТ ИЗ MODULE FEDERATION
const AngularTrackerWrapper = React.lazy(() => import('shellHost/AngularTrackerWrapper'));
const MainLayout = React.lazy(() => import('sharedApp/MainLayout'));

export default function App() {
  // Берем начальное значение из памяти authService
  const [userToken, setUserToken] = useState(() => getAccessToken());
  // Флаг ожидания восстановления сессии по HttpOnly cookie при F5
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Восстановление сессии при первой загрузке / F5
    async function initAuth() {
      try {
        let token = getAccessToken();
        if (!token) {
          // Если в памяти пусто, пробуем запросить новый token по HttpOnly cookie
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

    // Слушаем изменение токена из всех микрофронтендов (sharedApp, react-auth, angular)
    const handleAuthChange = (event) => {
      const newToken = event.detail?.token ?? getAccessToken();
      setUserToken(newToken);
    };

    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // Пока идет запрос /refresh при F5, показываем экраны загрузки (НЕ редиректим)
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
        
        {/* Защищенный Dashboard (доступен admin и manager) */}
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute token={userToken} >
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Защищенный User List (доступен только admin) */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute token={userToken} >
              <h1>User List</h1>
            </ProtectedRoute>
          } 
        />
        
        {/* Защищенный Angular MFE — передаем восстановленный токен */}
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
