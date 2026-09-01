import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm'; // Make sure to check the file name
import "./App.css";

// Receive onSuccess via props (it will come from the Shell or a test call)
function App({ onSuccess }) {
  // Mock onSuccess handler for local standalone development
  const handleSuccess = onSuccess || (() => alert('Successful login/registration!'));

  return (
    <Routes>
      <Route path="/login" element={<LoginForm onSuccess={handleSuccess} />} />
      <Route path="/signup" element={<RegisterForm onSuccess={handleSuccess} />} />
      {/* If the path is unknown — redirect to /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;