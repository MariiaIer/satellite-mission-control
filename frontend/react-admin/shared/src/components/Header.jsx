import React from 'react';
import { parseJwt } from '../utils/jwt';

export default function Header({ onLogout }) {

  const token = localStorage.getItem('token');
  const user = parseJwt(token); // Вытаскиваем { id, role, email }

  // const handleLogout = async () => {
  // const token = localStorage.getItem('token');

  //   try {
  //     // 1. Уведомляем бэкенд о выходе
  //     await fetch('http://localhost:5000/logout', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Ошибка при выходе на сервере:', error);
  //   } finally {
  //     // 2. В ЛЮБОМ СЛУЧАЕ стираем токен у клиента
  //     localStorage.removeItem('token');
      
  //     // 3. Перенаправляем на страницу авторизации
  //     window.location.href = '/login';
  //   }
  // };


  return (
    <header style={{ gridArea: 'header', background: '#fff', borderBottom: '1px solid #ddd', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
      <h2>Apollo App</h2>


      {user && (
        <div className="user-info">
          <span>{user.email}</span>
          <span className={`badge badge-${user.role}`}>{user.role}</span>
          <button onClick={onLogout} type="button">Logout</button>
        </div>
      )}

      {!user && onLogout && (
        <button onClick={onLogout} type="button">Logout</button>
      )}

    </header>
  );
}