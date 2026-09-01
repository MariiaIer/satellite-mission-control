import { useState } from 'react';
import { setAccessToken } from '../utils/authService.js';

export function useAuthForm(initialState, url, onSuccess) {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Will send/set the httpOnly Cookie
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          // Will save to localStorage and trigger 'auth-change'
          setAccessToken(data.token); 
        }

        if (onSuccess) onSuccess(data);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch {
      setError('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  return { formData, error, loading, handleChange, handleSubmit };
}