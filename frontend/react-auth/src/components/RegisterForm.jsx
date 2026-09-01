import React from 'react';
import AuthCard from './AuthCard';
import { useAuthForm } from '../hooks/useAuthForm';

export default function RegisterForm({ onSuccess }) {
  const { formData, error, loading, handleChange, handleSubmit } = useAuthForm(
    { email: '', password: '', department: '' },
    'http://localhost:3000/api/auth/register',
    onSuccess
  );

  return (
    <AuthCard
      title="Apollo Registration"
      error={error}
      onSubmit={handleSubmit}
      submitText={loading ? 'Регистрация...' : 'Зарегистрироваться'}
      linkTo="/login"
      linkText="Already registered? Login"
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
        <label className="label">Department:</label>
        <select 
          name="department"
          className="input"
          value={formData.department}
          onChange={handleChange} 
          required
        >
          <option value="" disabled>Select department</option>
          <option value="Dep1">Dep1</option>
          <option value="Dep2">Dep2</option>
        </select>
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