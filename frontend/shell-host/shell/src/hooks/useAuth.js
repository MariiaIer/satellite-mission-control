// shell/src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem('token'));
    };

    // Listen for events within the current tab
    window.addEventListener('auth-change', handleAuthChange);
    // Listen for changes from other browser tabs
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
  };

  return { token, isAuthenticated: Boolean(token), logout };
}