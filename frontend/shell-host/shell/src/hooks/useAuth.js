import { useState, useEffect } from 'react';
import { getAccessToken, refreshAccessToken, logout as apiLogout } from 'sharedApp/authService';

export function useAuth() {
  const [token, setToken] = useState(() => getAccessToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt automatic session restoration on app initialization / F5 refresh
    async function initAuth() {
      try {
        let currentToken = getAccessToken();
        if (!currentToken) {
          currentToken = await refreshAccessToken();
        }
        setToken(currentToken);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Listen to custom cross-MFE auth changes (login, logout, token refresh)
    const handleAuthChange = (event) => {
      const newToken = event.detail?.token ?? getAccessToken();
      setToken(newToken);
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Handle explicit user logout
  const handleLogout = async () => {
    await apiLogout();
    setToken(null);
  };

  return {
    isAuthenticated: !!token,
    token,
    loading,
    logout: handleLogout
  };
}