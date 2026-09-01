// src/utils/authService.js

export const getAccessToken = () => localStorage.getItem('token');

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
  // Notify other components and MFEs in the current tab
  window.dispatchEvent(new CustomEvent('auth-change', { detail: { token } }));
};

// Function to update the Access Token via Refresh Token stored in an httpOnly Cookie
export const refreshAccessToken = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Will send the httpOnly Cookie containing the refresh token
    });

    if (!res.ok) throw new Error('Refresh failed');

    const data = await res.json();
    setAccessToken(data.token);
    return data.token;
  } catch (err) {
    setAccessToken(null);
    throw err;
  }
};