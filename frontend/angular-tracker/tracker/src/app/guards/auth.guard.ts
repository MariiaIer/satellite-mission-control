// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, RedirectCommand } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  
  // Проверяем наличие токена
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  console.warn('[AuthGuard] Доступ ограничен: отсутствует токен авторизации.');

  // Использование RedirectCommand — современный стандарт отмены навигации и перенаправления
  return false;
};