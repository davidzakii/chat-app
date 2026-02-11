import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformServer } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 1. لو إحنا على السيرفر، مرره بسلام عشان ميعملش Redirect قبل الـ Hydration
  if (isPlatformServer(platformId)) {
    return true;
  }

  return toObservable(auth.state).pipe(
    filter((state) => state.initialized),
    take(1),
    map((state) => {
      if (state.status.isAuthenticated) {
        return router.parseUrl('/chat');
      }
      return true;
    }),
  );
};
