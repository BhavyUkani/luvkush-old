import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  page?: number;
  pages?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Auth is carried entirely by the httpOnly lk_access_token/lk_refresh_token
  // cookies the backend sets — never read from JS, only sent by the browser
  // when a request opts into credentials.
  private readonly jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  get<T>(path: string, params?: Record<string, any>): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          httpParams = httpParams.set(key, String(val));
        }
      });
    }
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`, {
      headers: this.jsonHeaders,
      params: httpParams,
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  post<T>(path: string, body: any = {}): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body, {
      headers: this.jsonHeaders,
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  put<T>(path: string, body: any = {}): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${path}`, body, {
      headers: this.jsonHeaders,
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  patch<T>(path: string, body: any = {}): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${path}`, body, {
      headers: this.jsonHeaders,
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  delete<T>(path: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${path}`, {
      headers: this.jsonHeaders,
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  uploadFormData<T>(path: string, formData: FormData, method: 'post' | 'put' = 'post'): Observable<ApiResponse<T>> {
    const req = method === 'put'
      ? this.http.put<ApiResponse<T>>(`${this.baseUrl}${path}`, formData, { withCredentials: true })
      : this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, formData, { withCredentials: true });
    return req.pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    const message =
      error?.error?.message ||
      error?.message ||
      'Something went wrong. Please try again.';
    return throwError(() => ({ ...error, userMessage: message }));
  }
}
