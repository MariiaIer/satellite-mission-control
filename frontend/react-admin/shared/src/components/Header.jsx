import React from 'react';
import { parseJwt } from '../utils/jwt';

export default function Header({ onLogout }) {

  const token = localStorage.getItem('token');
  const user = parseJwt(token); // { id, role, email }

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