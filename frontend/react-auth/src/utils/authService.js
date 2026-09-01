// Variable to prevent race conditions (concurrent refresh requests)
let refreshPromise = null;

export const getAccessToken = () => localStorage.getItem('token');

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
  // Notify ALL microfrontends in the current tab
  window.dispatchEvent(new CustomEvent('auth-change', { detail: { token } }));
};

// Function to refresh the Access Token with duplicate call locking
export const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Required to include the httpOnly Cookie
      });

      if (!res.ok) throw new Error('Refresh failed');

      const data = await res.json();
      setAccessToken(data.token);
      return data.token;
    } catch (err) {
      setAccessToken(null); // Reset the token if the refresh failed
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};