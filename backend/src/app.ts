import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/product/product.routes';
import categoryRoutes from './modules/category/category.routes';
import orderRoutes from './modules/order/order.routes';
import userRoutes from './modules/user/user.routes';
import reviewRoutes from './modules/review/review.routes';
import cartRoutes from './modules/cart/cart.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import couponRoutes from './modules/coupon/coupon.routes';
import hairSolutionRoutes from './modules/hair-solution/hair-solution.routes';
import hairSolutionAdminRoutes from './modules/hair-solution/hair-solution-admin.routes';
import blogRoutes from './modules/blog/blog.routes';
import contactRoutes from './modules/contact/contact.routes';
import adminRoutes from './modules/admin/admin.routes';
import mediaRoutes from './modules/media/media.routes';
import seoRoutes from './modules/seo/seo.routes';
import newsletterRoutes from './modules/newsletter/newsletter.routes';
import paymentRoutes from './modules/payment/payment.routes';

const app: Application = express();

// Trust the first hop (nginx). Without this, X-Forwarded-For is ignored and
// every request appears to come from 127.0.0.1, which collapses rate
// limiting into a single shared bucket for the entire internet.
app.set('trust proxy', 1);

// ── Security headers ─────────────────────
app.use(helmet({
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
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? config.frontendUrl
    : (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ── Compression ──────────────────────────
app.use(compression());

// ── Body parsing ─────────────────────────
// The `verify` hook stashes the exact raw bytes on the request before
// JSON-parsing them. The Razorpay webhook needs those exact bytes (not a
// re-serialised JSON.stringify) to validate its HMAC signature — see
// payment.service.ts#handleWebhook.
app.use(express.json({
  limit: '10mb',
  verify: (req: Request, _res, buf) => { (req as any).rawBody = buf; }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Request logging ──────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message: string) => logger.http(message.trim()) }
  }));
}

// ── Global rate limiting ─────────────────
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again after some time.'
  }
});
app.use(`${config.apiPrefix}`, limiter);

// ── Static files ─────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));
// A missing upload should 404, not fall through to the SPA's index.html —
// the wildcard handler below only serves non-API, non-upload routes.
app.use('/uploads', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'File not found' });
});

// ── Health check ─────────────────────────
app.get(`${config.apiPrefix}/health`, (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'Luv Kush Natural API'
  });
});

// ── API Routes ───────────────────────────
const prefix = config.apiPrefix;

app.use(`${prefix}/auth`,          authRoutes);
app.use(`${prefix}/products`,      productRoutes);
app.use(`${prefix}/categories`,    categoryRoutes);
app.use(`${prefix}/orders`,        orderRoutes);
app.use(`${prefix}/account`,       userRoutes);
app.use(`${prefix}/reviews`,       reviewRoutes);
app.use(`${prefix}/cart`,          cartRoutes);
app.use(`${prefix}/wishlist`,      wishlistRoutes);
app.use(`${prefix}/coupons`,       couponRoutes);
app.use(`${prefix}/hair-solutions`, hairSolutionRoutes);
app.use(`${prefix}/admin/hair-solutions`, hairSolutionAdminRoutes);
app.use(`${prefix}/blog`,          blogRoutes);
app.use(`${prefix}/contact`,       contactRoutes);
app.use(`${prefix}/admin`,         adminRoutes);
app.use(`${prefix}/media`,         mediaRoutes);
app.use(`${prefix}/seo`,           seoRoutes);
app.use(`${prefix}/newsletter`,    newsletterRoutes);
app.use(`${prefix}/payment`,       paymentRoutes);

// ── Serve Frontend UI ────────────────────
const uiPath = path.join(process.cwd(), 'ui/browser');
app.use(express.static(uiPath));

// Wildcard handler to serve Angular SPA index.html/index.csr.html for client-side routing
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith(config.apiPrefix)) {
    return next();
  }
  const indexHtmlPath = path.join(uiPath, 'index.html');
  const indexCsrPath = path.join(uiPath, 'index.csr.html');
  const fileToServe = fs.existsSync(indexHtmlPath) ? indexHtmlPath : indexCsrPath;
  res.sendFile(fileToServe);
});

// ── Error handling ───────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
