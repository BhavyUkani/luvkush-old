"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const config_1 = require("./utils/config");
const logger_1 = require("./utils/logger");
const database_1 = require("./utils/database");
const migrate_1 = require("./utils/migrate");
const order_service_1 = require("./modules/order/order.service");
const ABANDONED_ORDER_SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const ABANDONED_ORDER_THRESHOLD_MINUTES = 30;
function startAbandonedOrderReaper() {
    const orderService = new order_service_1.OrderService();
    const sweep = async () => {
        try {
            await orderService.releaseAbandonedOnlineOrders(ABANDONED_ORDER_THRESHOLD_MINUTES);
        }
        catch (err) {
            logger_1.logger.error('[AbandonedOrderReaper] Sweep failed:', err);
        }
    };
    const timer = setInterval(sweep, ABANDONED_ORDER_SWEEP_INTERVAL_MS);
    timer.unref();
    sweep();
    return timer;
}
async function bootstrap() {
    try {
        // Test database connection and run migrations
        await database_1.db.getConnection().then(async (conn) => {
            logger_1.logger.info('✓ MySQL connected successfully');
            conn.release();
            await (0, migrate_1.runMigrations)();
        });
        const server = app_1.default.listen(config_1.config.port, () => {
            logger_1.logger.info(`

         
  Port:    ${config_1.config.port}               
  Mode:    ${config_1.config.nodeEnv.padEnd(10)} 
  Prefix: ${config_1.config.apiPrefix.padEnd(15)}

      `);
        });
        const reaperTimer = startAbandonedOrderReaper();
        // Graceful shutdown
        const shutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}. Shutting down gracefully...`);
            clearInterval(reaperTimer);
            const forceExit = setTimeout(() => {
                logger_1.logger.error('Graceful shutdown timed out. Forcing exit.');
                process.exit(1);
            }, 10000);
            forceExit.unref();
            server.close(async () => {
                logger_1.logger.info('HTTP server closed.');
                try {
                    await database_1.db.end();
                    logger_1.logger.info('MySQL pool closed.');
                }
                catch (err) {
                    logger_1.logger.error('Error closing MySQL pool:', err);
                }
                clearTimeout(forceExit);
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('unhandledRejection', (reason) => {
            logger_1.logger.error('Unhandled promise rejection:', reason);
        });
        process.on('uncaughtException', (err) => {
            logger_1.logger.error('Uncaught exception:', err);
            shutdown('uncaughtException');
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=server.js.map