"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = require("express-rate-limit");
const config_1 = require("./utils/config");
const logger_1 = require("./utils/logger");
const error_middleware_1 = require("./middleware/error.middleware");
// Route imports
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const product_routes_1 = __importDefault(require("./modules/product/product.routes"));
const category_routes_1 = __importDefault(require("./modules/category/category.routes"));
const order_routes_1 = __importDefault(require("./modules/order/order.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const review_routes_1 = __importDefault(require("./modules/review/review.routes"));
const cart_routes_1 = __importDefault(require("./modules/cart/cart.routes"));
const wishlist_routes_1 = __importDefault(require("./modules/wishlist/wishlist.routes"));
const coupon_routes_1 = __importDefault(require("./modules/coupon/coupon.routes"));
const hair_solution_routes_1 = __importDefault(require("./modules/hair-solution/hair-solution.routes"));
const hair_solution_admin_routes_1 = __importDefault(require("./modules/hair-solution/hair-solution-admin.routes"));
const blog_routes_1 = __importDefault(require("./modules/blog/blog.routes"));
const contact_routes_1 = __importDefault(require("./modules/contact/contact.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const media_routes_1 = __importDefault(require("./modules/media/media.routes"));
const seo_routes_1 = __importDefault(require("./modules/seo/seo.routes"));
const newsletter_routes_1 = __importDefault(require("./modules/newsletter/newsletter.routes"));
const payment_routes_1 = __importDefault(require("./modules/payment/payment.routes"));
const app = (0, express_1.default)();
// Trust the first hop (nginx). Without this, X-Forwarded-For is ignored and
// every request appears to come from 127.0.0.1, which collapses rate
// limiting into a single shared bucket for the entire internet.
app.set('trust proxy', 1);
// ── Security headers ─────────────────────
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            fontSrc: ["'self'", 'data:'],
            connectSrc: ["'self'", 'https://api.razorpay.com', 'https://lumberjack.razorpay.com'],
            frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
            objectSrc: ["'none'"],
            baseUri: ["'self'"]
        }
    }
}));
// ── CORS ────────────────────────────────
app.use((0, cors_1.default)({
    origin: config_1.config.nodeEnv === 'production'
        ? config_1.config.frontendUrl
        : (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// ── Compression ──────────────────────────
app.use((0, compression_1.default)());
// ── Body parsing ─────────────────────────
// The `verify` hook stashes the exact raw bytes on the request before
// JSON-parsing them. The Razorpay webhook needs those exact bytes (not a
// re-serialised JSON.stringify) to validate its HMAC signature — see
// payment.service.ts#handleWebhook.
app.use(express_1.default.json({
    limit: '10mb',
    verify: (req, _res, buf) => { req.rawBody = buf; }
}));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// ── Request logging ──────────────────────
if (config_1.config.nodeEnv !== 'test') {
    app.use((0, morgan_1.default)('combined', {
        stream: { write: (message) => logger_1.logger.http(message.trim()) }
    }));
}
// ── Global rate limiting ─────────────────
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: config_1.config.rateLimitWindowMs,
    max: config_1.config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again after some time.'
    }
});
app.use(`${config_1.config.apiPrefix}`, limiter);
// ── Static files ─────────────────────────
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads'), {
    maxAge: '7d',
    setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('X-Content-Type-Options', 'nosniff');
    }
}));
// A missing upload should 404, not fall through to the SPA's index.html —
// the wildcard handler below only serves non-API, non-upload routes.
app.use('/uploads', (_req, res) => {
    res.status(404).json({ success: false, message: 'File not found' });
});
// ── Health check ─────────────────────────
app.get(`${config_1.config.apiPrefix}/health`, (_req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'Luv Kush Natural API'
    });
});
// ── API Routes ───────────────────────────
const prefix = config_1.config.apiPrefix;
app.use(`${prefix}/auth`, auth_routes_1.default);
app.use(`${prefix}/products`, product_routes_1.default);
app.use(`${prefix}/categories`, category_routes_1.default);
app.use(`${prefix}/orders`, order_routes_1.default);
app.use(`${prefix}/account`, user_routes_1.default);
app.use(`${prefix}/reviews`, review_routes_1.default);
app.use(`${prefix}/cart`, cart_routes_1.default);
app.use(`${prefix}/wishlist`, wishlist_routes_1.default);
app.use(`${prefix}/coupons`, coupon_routes_1.default);
app.use(`${prefix}/hair-solutions`, hair_solution_routes_1.default);
app.use(`${prefix}/admin/hair-solutions`, hair_solution_admin_routes_1.default);
app.use(`${prefix}/blog`, blog_routes_1.default);
app.use(`${prefix}/contact`, contact_routes_1.default);
app.use(`${prefix}/admin`, admin_routes_1.default);
app.use(`${prefix}/media`, media_routes_1.default);
app.use(`${prefix}/seo`, seo_routes_1.default);
app.use(`${prefix}/newsletter`, newsletter_routes_1.default);
app.use(`${prefix}/payment`, payment_routes_1.default);
// ── Serve Frontend UI ────────────────────
const uiPath = path_1.default.join(process.cwd(), 'ui/browser');
app.use(express_1.default.static(uiPath));
// Wildcard handler to serve Angular SPA index.html/index.csr.html for client-side routing
app.get('*', (req, res, next) => {
    if (req.path.startsWith(config_1.config.apiPrefix)) {
        return next();
    }
    const indexHtmlPath = path_1.default.join(uiPath, 'index.html');
    const indexCsrPath = path_1.default.join(uiPath, 'index.csr.html');
    const fileToServe = fs_1.default.existsSync(indexHtmlPath) ? indexHtmlPath : indexCsrPath;
    res.sendFile(fileToServe);
});
// ── Error handling ───────────────────────
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map