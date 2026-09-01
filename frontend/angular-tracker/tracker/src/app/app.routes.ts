// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'tracker', 
    pathMatch: 'full' 
  },
  { 
    path: 'tracker', 
// Lazy loading of component + attaching Functional Guard
    loadComponent: () => import('./components/space-console/space-console.component')
      .then(m => m.SpaceConsoleComponent),
    canActivate: [authGuard]
  },
  { 
    path: '**', 
    redirectTo: 'tracker' 
  }
];