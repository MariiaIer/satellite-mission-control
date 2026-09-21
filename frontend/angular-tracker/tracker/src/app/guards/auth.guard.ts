// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
// @ts-ignore (игнорируем удалённый MFE модуль для TypeScript)
import { getAccessToken, refreshAccessToken } from 'sharedApp/authService';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);

  // 1. Проверяем токен в оперативной памяти
  let token = getAccessToken();

  // 2. Если токена нет в памяти, пробуем восстановить через HttpOnly Cookie
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