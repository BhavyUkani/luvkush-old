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
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
