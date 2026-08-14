import { Response } from 'express';
import { config } from '../../utils/config';
import { parseDurationMs } from './auth.service';

const isProd = config.nodeEnv === 'production';

// The refresh cookie is scoped to the auth routes only (refresh/logout) —
// it never needs to leave the browser on any other request, so it isn't
// exposed to the rest of the API surface.
const REFRESH_COOKIE_PATH = `${config.apiPrefix}/auth`;

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  // 'lax' is sent on same-site requests and top-level GET navigations, but
  // withheld from cross-site subresource/XHR/fetch requests and cross-site
  // form POSTs — the standard no-token CSRF mitigation for cookie auth.
  sameSite: 'lax' as const
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie('lk_access_token', accessToken, {
    ...baseCookieOptions,
    path: '/',
    maxAge: parseDurationMs(config.jwt.accessExpiresIn)
  });
  res.cookie('lk_refresh_token', refreshToken, {
    ...baseCookieOptions,
    path: REFRESH_COOKIE_PATH,
    maxAge: parseDurationMs(config.jwt.refreshExpiresIn)
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('lk_access_token', { path: '/' });
  res.clearCookie('lk_refresh_token', { path: REFRESH_COOKIE_PATH });
}
