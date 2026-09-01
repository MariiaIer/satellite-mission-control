// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, RedirectCommand } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  
  // Check for the presence of the token
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  console.warn('[AuthGuard] Access restricted: missing authorization token.');

  // Using RedirectCommand — modern standard for canceling navigation and redirecting
  return false;
};