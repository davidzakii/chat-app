import { inject, PLATFORM_ID, REQUEST } from '@angular/core'; // ✅ REQUEST is now here
import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const errors = inject(ErrorService);
  const platformId = inject(PLATFORM_ID);

  // Inject the Request object on the server (it will be null in the browser)
  const serverRequest = inject(REQUEST, { optional: true });

  let authReq = req.clone({ withCredentials: true });

  //  Fix: Forward cookies from the browser to your API during SSR
  if (isPlatformServer(platformId) && serverRequest) {
    // If the browser sent a cookie, attach it to the backend-to-backend request
    const cookie =
      (serverRequest as any).headers?.get?.('cookie') || (serverRequest as any).headers?.cookie;
    if (cookie) {
      authReq = authReq.clone({
        setHeaders: { Cookie: cookie },
      });
    }
  }

  return next(authReq).pipe(
    catchError((err) => {
      if (err.error?.isPass === false) {
        if (err.status === 401 && auth.state().initialized) {
          auth.forceLogout();
          // Only navigate on the client side to avoid SSR redirect issues
          if (!isPlatformServer(platformId)) {
            router.navigate(['/login']);
          }
        } else errors.set(err.error);
      }
      if (err.status === 401 && auth.state().initialized) {
        auth.forceLogout();
        // Only navigate on the client side to avoid SSR redirect issues
        if (!isPlatformServer(platformId)) {
          router.navigate(['/login']);
        }
      }
      auth.state().loading = false;

      return throwError(() => err);
    }),
  );
};
