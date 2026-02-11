import { Injectable, signal } from '@angular/core';
import { ApiErrorResponse } from '../models/api.response.model';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly _error = signal<ApiErrorResponse | null>(null);
  readonly error = this._error.asReadonly();

  set(error: ApiErrorResponse) {
    this._error.set(error);
  }

  clear() {
    this._error.set(null);
  }
}
