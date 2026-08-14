import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Shared across all in-flight requests so N requests that all 401 at once
// trigger exactly one refresh call, not N of them racing each other.
let refreshInFlight: Observable<any> | null = null;

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh-token'];

/**
 * Central 401 handling: on an expired access token, refresh once and retry
 * the original request with the new token. Without this, every one of the
 * app's hand-written ApiService calls had to notice a 401 and react on its
 * own — in practice none of them did, so sessions just died silently at the
 * access-token expiry instead of renewing.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  if (AUTH_ENDPOINTS.some(p => req.url.includes(p))) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401 || !auth.isLoggedIn()) {
        return throwError(() => err);
      }

      if (!refreshInFlight) {
        // shareReplay makes this hot: every concurrent 401 handler below
        // subscribes to the SAME underlying HTTP call instead of each
        // triggering its own refresh request.
        refreshInFlight = auth.refreshToken().pipe(shareReplay(1));
      }

      return refreshInFlight.pipe(
        switchMap(() => {
          refreshInFlight = null;
          const token = auth.token();
          const retried = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
          return next(retried);
        }),
        catchError(refreshErr => {
          refreshInFlight = null;
          auth.logout();
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
