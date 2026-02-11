import { effect, inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { UserDTO } from '../models/user.model';
import { AuthState, LoginDTO, SignupDTO, VerifyOtpDTO } from '../models/auth.model';
import { AUTH_API } from '../api/auth.api';
import { ApiSuccessResponse } from '../models/api.response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly _state = signal<AuthState>({
    status: { isAuthenticated: false },
    currentUser: null,
    initialized: false,
    loading: false,
  });

  readonly state = this._state.asReadonly();

  constructor() {
    effect(() => {
      if (this._state().status.isAuthenticated) {
      }
    });
  }

  /**
   * Load / refresh current session from the backend `auth/check` endpoint.
   * Used both on app startup and by route guards.
   */
  checkAuth() {
    this.setLoading(true);
    return this.api.get<ApiSuccessResponse<UserDTO>>(AUTH_API.check).pipe(
      tap((res: any) => {
        this._state.set({
          status: { isAuthenticated: true },
          currentUser: res.data,
          initialized: true,
          loading: false,
        });
      }),
      catchError(() => {
        this._state.set({
          status: { isAuthenticated: false },
          currentUser: null,
          initialized: true,
          loading: false,
        });
        return of(null);
      }),
    );
  }

  signup(payload: SignupDTO) {
    this.setLoading(true);
    return this.api.post<ApiSuccessResponse<null>>(AUTH_API.signup, payload).pipe(
      tap(() => {
        this.setLoading(false);
      }),
    );
  }

  verifyOtp(payload: VerifyOtpDTO) {
    this.setLoading(true);
    return this.api.post<ApiSuccessResponse<null>>(AUTH_API.verifyOtp, payload).pipe(
      tap(() => {
        this.setLoading(false);
      }),
    );
  }

  login(payload: LoginDTO) {
    // this.setLoading(true);
    return this.api.post<ApiSuccessResponse<null>>(AUTH_API.login, payload).pipe(
      tap({ next: () => this.setLoading(false), error: () => this.setLoading(false) }),
      switchMap(() => {
        return this.checkAuth();
      }),
    );
  }

  logout() {
    this.setLoading(true);
    return this.api.post<ApiSuccessResponse<null>>(AUTH_API.logout, {}).pipe(
      tap(() => {
        this._state.set({
          status: { isAuthenticated: false },
          currentUser: null,
          initialized: true,
          loading: false,
        });
        this.router.navigate(['/login']);
      }),
    );
  }

  /**
   * Update the current user snapshot (e.g. after profile update).
   */
  updateCurrentUser(user: UserDTO): void {
    this._state.update((state) => ({
      ...state,
      currentUser: user,
    }));
  }

  forceLogout() {
    this._state.set({
      status: { isAuthenticated: false },
      currentUser: null,
      initialized: true,
      loading: false,
    });
  }

  googleLogin() {
    window.location.href = 'http://localhost:3000/api/auth/google';
  }

  private setLoading(loading: boolean) {
    this._state.update((s) => ({ ...s, loading }));
  }
}
