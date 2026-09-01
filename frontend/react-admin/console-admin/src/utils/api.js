import { getAccessToken, refreshAccessToken } from './authService.js';

export async function fetchWithAuth(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  let token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers, credentials: 'include' });

  // If the token has expired, try to refresh it
  if (response.status === 401) {
    try {
      token = await refreshAccessToken();
      headers['Authorization'] = `Bearer ${token}`;
      
      // Retry the original request with the new token
      response = await fetch(url, { ...options, headers, credentials: 'include' });
    } catch (err) {
      // Refresh failed — redirect user to login
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
  }

  return response;
}