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

  // Если токен просрочен (401), пробуем обновить через refresh-куку
  if (response.status === 401) {
    try {
      token = await refreshAccessToken();
      headers['Authorization'] = `Bearer ${token}`;

      // Повторяем исходный запрос с новым токеном
      response = await fetch(url, { ...options, headers, credentials: 'include' });
    } catch (err) {
      // Если рефреш не удался — делаем полный logout
      await logout();
      throw err;
    }
  }

  return response;
}