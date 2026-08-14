import 'dotenv/config';
import app from './app';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { db } from './utils/database';

async function runMigrations(): Promise<void> {
  try {
    logger.info('Running database migrations...');

    // 1. Create order_statuses table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_statuses (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        slug        VARCHAR(255) NOT NULL UNIQUE,
        color       VARCHAR(50) DEFAULT '#B87333',
        sort_order  INT UNSIGNED DEFAULT 0,
        is_system   BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Check if orders.status is ENUM. If so, convert it to VARCHAR(50)
    const columns = await db.query<any[]>(`
      SELECT DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'status'
    `);

    if (columns.length > 0 && columns[0].DATA_TYPE === 'enum') {
      logger.info('Converting orders.status from ENUM to VARCHAR(50)...');
      await db.query(`
        ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending'
      `);
    }

    // 3. Seed default statuses if table is empty
    const countRes = await db.queryOne<{ count: number }>(`
      SELECT COUNT(*) as count FROM order_statuses
    `);

    if (countRes && countRes.count === 0) {
      logger.info('Seeding default order statuses...');
      const defaults = [
        ['Order Placed', 'pending', '#B87333', 1, true],
        ['Confirmed', 'confirmed', '#3182CE', 2, true],
        ['Processing', 'processing', '#805AD5', 3, true],
        ['Quality Check', 'quality_check', '#319795', 4, true],
        ['Shipped', 'shipped', '#D69E2E', 5, true],
        ['Out For Delivery', 'out_for_delivery', '#4A5568', 6, true],
        ['Delivered', 'delivered', '#38A169', 7, true],
        ['Cancelled', 'cancelled', '#E53E3E', 8, true],
        ['Refund Requested', 'refund_requested', '#DD6B20', 9, true],
        ['Refunded', 'refunded', '#718096', 10, true],
        ['Returned', 'returned', '#E53E3E', 11, true]
      ];

      for (const d of defaults) {
        await db.query(`
          INSERT INTO order_statuses (name, slug, color, sort_order, is_system)
          VALUES (?, ?, ?, ?, ?)
        `, d);
      }
      logger.info('Seeding default order statuses completed.');
    }

    // 4. Check if orders.paid_at column exists, if not, add it
    const paidAtColumn = await db.query<any[]>(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'paid_at'
    `);
    if (paidAtColumn.length === 0) {
      logger.info("Adding missing column 'paid_at' to orders table...");
      await db.query(`
        ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP NULL DEFAULT NULL AFTER payment_status
      `);
    }

    // 5. Create payment_transactions table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id           INT UNSIGNED NOT NULL,
        gateway            VARCHAR(50) NOT NULL,
        gateway_order_id   VARCHAR(255) DEFAULT NULL,
        gateway_payment_id VARCHAR(255) DEFAULT NULL,
        amount             DECIMAL(10,2) NOT NULL,
        status             VARCHAR(50) NOT NULL,
        created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5a. Check if orders.pending_charge_amount column exists, if not, add it.
    // This is set server-side (never by the client) whenever a Razorpay
    // order is created, so payment verification always knows the exact
    // amount that was actually charged instead of trusting client input.
    const pendingChargeColumn = await db.query<any[]>(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'pending_charge_amount'
    `);
    if (pendingChargeColumn.length === 0) {
      logger.info("Adding missing column 'pending_charge_amount' to orders table...");
      await db.query(`
        ALTER TABLE orders ADD COLUMN pending_charge_amount DECIMAL(10,2) NULL DEFAULT NULL AFTER razorpay_signature
      `);
    }

    // 6. Check if users.avatar_url column exists, if not, add it
    // (user.service.ts reads/writes this column; without it every profile
    // request fails with ER_BAD_FIELD_ERROR)
    const avatarUrlColumn = await db.query<any[]>(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar_url'
    `);
    if (avatarUrlColumn.length === 0) {
      logger.info("Adding missing column 'avatar_url' to users table...");
      await db.query(`
        ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL DEFAULT NULL AFTER phone
      `);
    }

    // 5b. Check if newsletter_subscribers.unsubscribe_token column exists
    const unsubTokenColumn = await db.query<any[]>(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'newsletter_subscribers' AND COLUMN_NAME = 'unsubscribe_token'
    `);
    if (unsubTokenColumn.length === 0) {
      logger.info("Adding missing column 'unsubscribe_token' to newsletter_subscribers table...");
      await db.query(`
        ALTER TABLE newsletter_subscribers ADD COLUMN unsubscribe_token VARCHAR(64) NULL DEFAULT NULL AFTER email
      `);
      await db.query(`
        UPDATE newsletter_subscribers SET unsubscribe_token = SHA2(CONCAT(email, RAND()), 256) WHERE unsubscribe_token IS NULL
      `);
    }

    // 7a. Create order_status_history table if it doesn't exist
    // (moved here from order.service.ts, which used to run this CREATE TABLE
    // on every status update/read — DDL has no place in a hot request path)
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        status VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        note TEXT NULL,
        changed_by INT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_id (order_id)
      )
    `);

    // 7. Create review_votes table if it doesn't exist (dedupes "helpful" votes per user)
    await db.query(`
      CREATE TABLE IF NOT EXISTS review_votes (
        id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        review_id  INT UNSIGNED NOT NULL,
        user_id    INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY idx_review_votes_unique (review_id, user_id),
        CONSTRAINT fk_review_votes_review FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE CASCADE,
        CONSTRAINT fk_review_votes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Add indexes on columns that are filtered/looked-up on every request
    // but were never indexed — refresh_tokens.token in particular is looked
    // up on every token refresh.
    const ensureIndex = async (table: string, indexName: string, ddl: string) => {
      const existing = await db.query<any[]>(`
        SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?
      `, [table, indexName]);
      if (existing.length === 0) {
        logger.info(`Adding missing index '${indexName}' on ${table}...`);
        await db.query(ddl);
      }
    };
    await ensureIndex('refresh_tokens', 'idx_refresh_tokens_token', 'ALTER TABLE refresh_tokens ADD INDEX idx_refresh_tokens_token (token(255))');
    await ensureIndex('reviews', 'idx_reviews_status', 'ALTER TABLE reviews ADD INDEX idx_reviews_status (status)');
    await ensureIndex('products', 'idx_products_category_id', 'ALTER TABLE products ADD INDEX idx_products_category_id (category_id)');
    await ensureIndex('blog_posts', 'idx_blog_posts_status', 'ALTER TABLE blog_posts ADD INDEX idx_blog_posts_status (status)');

    logger.info('✓ Database migrations completed successfully');
  } catch (error) {
    logger.error('Database migration failed:', error);
    throw error;
  }
}

async function bootstrap(): Promise<void> {
  try {
    // Test database connection and run migrations
    await db.getConnection().then(async (conn) => {
      logger.info('✓ MySQL connected successfully');
      conn.release();
      await runMigrations();
    });

    const server = app.listen(config.port, () => {
      logger.info(`

         
  Port:    ${config.port}               
  Mode:    ${config.nodeEnv.padEnd(10)} 
  Prefix: ${config.apiPrefix.padEnd(15)}

      `);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      const forceExit = setTimeout(() => {
        logger.error('Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
      }, 10000);
      forceExit.unref();

      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await db.end();
          logger.info('MySQL pool closed.');
        } catch (err) {
          logger.error('Error closing MySQL pool:', err);
        }
        clearTimeout(forceExit);
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection:', reason);
    });
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception:', err);
      shutdown('uncaughtException');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
