// src/utils/authService.js (в sharedApp)

// 1. In-memory storage for Access Token (isolated from XSS vs localStorage)
let accessToken = null;

// Singleton Promise to deduplicate concurrent refresh calls across all MFEs
let refreshPromise = null;

// Cross-tab and inter-service synchronization channel
const authChannel = new BroadcastChannel('auth_sync');

authChannel.onmessage = (event) => {
  const { type, token } = event.data || {};

  if (type === 'TOKEN_UPDATED') {
    accessToken = token;
    window.dispatchEvent(new CustomEvent('auth-change', { detail: { token } }));
  } else if (type === 'LOGOUT') {
    accessToken = null;
    window.dispatchEvent(new CustomEvent('auth-change', { detail: { token: null } }));
  }
};

/**
 * Returns the active Access Token from memory.
 */
export const getAccessToken = () => accessToken;

/**
 * Sets access token in memory and notifies all local microfrontends & tabs.
 */
export const setAccessToken = (token) => {
  accessToken = token;

  // Broadcast to other tabs/windows
  authChannel.postMessage({ type: 'TOKEN_UPDATED', token });

  // Notify components and MFEs in the current tab
  window.dispatchEvent(new CustomEvent('auth-change', { detail: { token } }));
};

/**
 * Requests a new Access Token using HttpOnly Cookie with duplicate call locking.
 */
export const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Обязательно передает HttpOnly куку
      });

      if (!res.ok) {
        throw new Error(`Refresh failed with status: ${res.status}`);
      }

      const data = await res.json();
      
      // 👈 Поддерживаем оба варианта названия поля
      const newToken = data.token || data.accessToken; 
      
      if (!newToken) {
        throw new Error('No token found in refresh response');
      }

      setAccessToken(newToken);
      return newToken;
    } catch (err) {
      setAccessToken(null);
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Performs full logout by clearing the server-side HttpOnly cookie
 * and broadcasting the logout event across all tabs and MFEs.
 */
export const logout = async () => {
  const token = getAccessToken();

  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });
  } finally {
    setAccessToken(null);
    authChannel.postMessage({ type: 'LOGOUT' });
  }
};