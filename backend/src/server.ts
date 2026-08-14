import 'dotenv/config';
import app from './app';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { db } from './utils/database';
import { runMigrations } from './utils/migrate';
import { OrderService } from './modules/order/order.service';

const ABANDONED_ORDER_SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const ABANDONED_ORDER_THRESHOLD_MINUTES = 30;

function startAbandonedOrderReaper(): NodeJS.Timeout {
  const orderService = new OrderService();
  const sweep = async () => {
    try {
      await orderService.releaseAbandonedOnlineOrders(ABANDONED_ORDER_THRESHOLD_MINUTES);
    } catch (err) {
      logger.error('[AbandonedOrderReaper] Sweep failed:', err);
    }
  };
  const timer = setInterval(sweep, ABANDONED_ORDER_SWEEP_INTERVAL_MS);
  timer.unref();
  sweep();
  return timer;
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

    const reaperTimer = startAbandonedOrderReaper();

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      clearInterval(reaperTimer);
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
