import { Routes } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayout } from './shared/components/auth-layout/auth-layout';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup/signup').then((m) => m.Signup),
      },
      {
        path: 'verify-otp',
        loadComponent: () =>
          import('./features/auth/verify-otp/verify-otp').then((m) => m.VerifyOtp),
      },
      {
        path: 'google-login',
        loadComponent: () => import('./features/auth/google-login').then((m) => m.GoogleLogin),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: 'reset-password/:token',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password').then((m) => m.ResetPassword),
      },
    ],
  },
  {
    path: '',
    component: Navbar,
    canActivate: [authGuard],
    children: [
      {
        path: 'chat',
        loadComponent: () =>
          import('./features/chat/chat-shell/chat-shell').then((m) => m.ChatShell),
      },
      {
        path: 'chat/:id',
        loadComponent: () =>
          import('./features/chat/chat-shell/chat-shell').then((m) => m.ChatShell),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/edit-profile/edit-profile').then((m) => m.EditProfile),
      },
    ],
  },
];
