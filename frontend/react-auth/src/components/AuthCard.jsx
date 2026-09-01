import React from 'react';
import { Link } from 'react-router-dom';
import "./AuthCard.css";

export default function AuthCard({ 
  title, 
  error, 
  onSubmit, 
  submitText, 
  linkTo, 
  linkText, 
  children 
}) {
  return (
    <div className="card">
      <div className="header">
        <div className="logo">
          <div className="logo-icon"></div>
        </div>
        <h1 className="brand-name">{title}</h1>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={onSubmit}>
        {children}
        
        <button className="btn btn-primary" type="submit">
          {submitText}
        </button>

        <Link to={linkTo} className="btn btn-secondary">
          {linkText}
        </Link>
      </form>
    </div>
  );
}