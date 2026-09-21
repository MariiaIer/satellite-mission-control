// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
// @ts-ignore (ignore remote MFE module for TypeScript)
import { getAccessToken, refreshAccessToken } from 'sharedApp/authService';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);

  // 1. Check for the token in in-memory storage
  let token = getAccessToken();

  // 2. If no token is found in memory, attempt to restore it via HttpOnly Cookie
  if (!token) {
    try {
      token = await refreshAccessToken();
    } catch (err) {
      console.warn('[AuthGuard] Access restricted: session expired or invalid cookie.');
      return false;
    }
  }

  return Boolean(token);
};
