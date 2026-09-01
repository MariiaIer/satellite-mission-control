import React from 'react';
import AuthCard from './AuthCard';
import { useAuthForm } from '../hooks/useAuthForm';

export default function LoginForm({ onSuccess }) {
  const { formData, error, loading, handleChange, handleSubmit } = useAuthForm(
    { email: '', password: '' },
    'http://localhost:3000/api/auth/login',
    onSuccess
  );

  return (
    <AuthCard
      title="Apollo Login"
      error={error}
      onSubmit={handleSubmit}
      submitText={loading ? 'Вход...' : 'Войти'}
      linkTo="/signup"
      linkText="Not registered? Signup"
    >
      <div className="form-group">
        <label className="label">Email:</label>
        <input 
          className="input"
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleChange} 
          required 
        />
      </div>

      <div className="form-group">
        <label className="label">Password:</label>
        <input 
          className="input"
          type="password" 
          name="password"
          value={formData.password} 
          onChange={handleChange} 
          required 
        />
      </div>
    </AuthCard>
  );
}