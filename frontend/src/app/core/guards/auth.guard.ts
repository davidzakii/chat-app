import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { isPlatformServer } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return true;
  }
  return toObservable(auth.state).pipe(
    filter((state) => state.initialized),
    take(1),
    map((state) => {
      if (state.status.isAuthenticated) {
        return true;
      }
      return router.parseUrl('/login');
    }),
  );
};
