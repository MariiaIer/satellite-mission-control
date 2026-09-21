import { getAccessToken, refreshAccessToken, logout } from 'sharedApp/authService';

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

  // If the token is expired (401), attempt to renew it using the HttpOnly refresh cookie
  if (response.status === 401) {
    try {
      token = await refreshAccessToken();
      headers['Authorization'] = `Bearer ${token}`;

      // Retry the original request with the new access token
      response = await fetch(url, { ...options, headers, credentials: 'include' });
    } catch (err) {
      // If the refresh token request fails, perform a full logout
      await logout();
      throw err;
    }
  }

  return response;
}
