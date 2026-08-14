import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { tap, catchError, map } from 'rxjs/operators';
import { Observable, Subject, throwError, of, firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
}

// Legacy keys from before auth moved to httpOnly cookies (LK-H21) — purged
// on startup so no stale token/identity data lingers in already-visited
// browsers.
const LEGACY_LOCALSTORAGE_KEYS = ['lk_token', 'lk_refresh_token', 'lk_user'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private _user = signal<User | null>(null);
  private _loading = signal(false);

  // Session-scoped state (cart, wishlist, ...) subscribes to this instead of
  // AuthService depending on them directly — keeps the dependency one-way.
  private readonly _loggedOut$ = new Subject<void>();
  readonly loggedOut$ = this._loggedOut$.asObservable();

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isAdmin = computed(() => {
    const role = this._user()?.role;
    return role === 'super_admin' || role === 'admin';
  });
  readonly loading = this._loading.asReadonly();

  constructor() {
    this.purgeLegacyStorage();
  }

  /** Runs once at app startup (see app.config.ts's app initializer) — asks
   * the server who, if anyone, the lk_access_token cookie belongs to. There
   * is nothing to read client-side any more, so this network round trip
   * replaces the old synchronous localStorage restore(). */
  bootstrap(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve();

    return firstValueFrom(
      this.api.get<User>('/auth/me').pipe(
        map(res => { this._user.set((res.data as User) ?? null); }),
        catchError(() => { this._user.set(null); return of(void 0); })
      )
    );
  }

  get fullName(): string {
    const u = this._user();
    return u ? `${u.first_name} ${u.last_name}`.trim() : '';
  }

  login(email: string, password: string): Observable<any> {
    this._loading.set(true);
    return this.api.post('/auth/login', { email, password }).pipe(
      tap((res: any) => {
        this._user.set(res.data?.user ?? null);
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  register(data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone?: string;
  }): Observable<any> {
    this._loading.set(true);
    return this.api.post('/auth/register', data).pipe(
      tap((res: any) => {
        this._user.set(res.data?.user ?? null);
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.api.post('/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.api.post('/auth/reset-password', { token, password });
  }

  // No body: the refresh cookie is scoped to this endpoint and sent by the
  // browser automatically. A successful response re-sets both cookies.
  refreshToken(): Observable<any> {
    return this.api.post('/auth/refresh-token', {}).pipe(
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  updateProfile(user: Partial<User>): void {
    this._user.update(u => u ? { ...u, ...user } : null);
  }

  logout(): void {
    // Best-effort: tell the server to invalidate the refresh token row and
    // clear the cookies too, so "logging out" actually ends the server-side
    // session. Local state is cleared unconditionally below regardless of
    // whether this call succeeds.
    if (this.isLoggedIn()) {
      this.api.post('/auth/logout', {}).pipe(catchError(() => of(null))).subscribe();
    }

    this._user.set(null);
    this._loggedOut$.next();
    this.router.navigate(['/login']);
  }

  private purgeLegacyStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      for (const key of LEGACY_LOCALSTORAGE_KEYS) localStorage.removeItem(key);
    } catch { /* ignore */ }
  }
}
