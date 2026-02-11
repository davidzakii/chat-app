import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private url(endpoint: string) {
    return `${environment.apiBaseUrl}${endpoint}`;
  }

  get<T>(endpoint: string) {
    return this.http.get<T>(this.url(endpoint));
  }

  post<T>(endpoint: string, body: any) {
    return this.http.post<T>(this.url(endpoint), body);
  }

  patch<T>(endpoint: string, body: any) {
    return this.http.patch<T>(this.url(endpoint), body);
  }
}
