"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookies = setAuthCookies;
exports.clearAuthCookies = clearAuthCookies;
const config_1 = require("../../utils/config");
const auth_service_1 = require("./auth.service");
const isProd = config_1.config.nodeEnv === 'production';
// The refresh cookie is scoped to the auth routes only (refresh/logout) —
// it never needs to leave the browser on any other request, so it isn't
// exposed to the rest of the API surface.
const REFRESH_COOKIE_PATH = `${config_1.config.apiPrefix}/auth`;
const baseCookieOptions = {
    httpOnly: true,
    secure: isProd,
    // 'lax' is sent on same-site requests and top-level GET navigations, but
    // withheld from cross-site subresource/XHR/fetch requests and cross-site
    // form POSTs — the standard no-token CSRF mitigation for cookie auth.
    sameSite: 'lax'
};
function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie('lk_access_token', accessToken, {
        ...baseCookieOptions,
        path: '/',
        maxAge: (0, auth_service_1.parseDurationMs)(config_1.config.jwt.accessExpiresIn)
    });
    res.cookie('lk_refresh_token', refreshToken, {
        ...baseCookieOptions,
        path: REFRESH_COOKIE_PATH,
        maxAge: (0, auth_service_1.parseDurationMs)(config_1.config.jwt.refreshExpiresIn)
    });
}
function clearAuthCookies(res) {
    res.clearCookie('lk_access_token', { path: '/' });
    res.clearCookie('lk_refresh_token', { path: REFRESH_COOKIE_PATH });
}
//# sourceMappingURL=auth-cookies.js.map