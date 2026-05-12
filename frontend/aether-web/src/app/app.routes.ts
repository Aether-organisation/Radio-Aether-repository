import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'request', loadComponent: () => import('./pages/request/request.component').then(m => m.RequestComponent) },
  { path: 'status', loadComponent: () => import('./pages/status/status.component').then(m => m.StatusComponent) },
  { path: '**', redirectTo: '' }
];
