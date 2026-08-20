"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("./config");
const logger_1 = require("./logger");
class Database {
    pool;
    constructor() {
        this.pool = promise_1.default.createPool({
            host: config_1.config.db.host,
            port: config_1.config.db.port,
            database: config_1.config.db.name,
            user: config_1.config.db.user,
            password: config_1.config.db.password,
            waitForConnections: true,
            connectionLimit: config_1.config.db.poolMax,
            // Bounded so a stalled DB fails fast under load instead of piling up
            // unbounded latency (queued requests beyond this reject immediately).
            queueLimit: config_1.config.db.poolMax * 10,
            connectTimeout: 10000,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            timezone: '+05:30',
            charset: 'utf8mb4',
        });
        this.pool.on('connection', () => {
            logger_1.logger.debug('New MySQL connection established');
        });
    }
    async getConnection() {
        return this.pool.getConnection();
    }
    async end() {
        await this.pool.end();
    }
    async query(sql, params) {
        const [rows] = await this.pool.execute(sql, params);
        return rows;
    }
    async queryOne(sql, params) {
        const rows = await this.query(sql, params);
        return rows[0] || null;
    }
    async transaction(callback) {
        const conn = await this.getConnection();
        await conn.beginTransaction();
        try {
            const result = await callback(conn);
            await conn.commit();
            return result;
        }
        catch (error) {
            try {
                await conn.rollback();
            }
            catch (rollbackError) {
                logger_1.logger.error('Rollback failed after transaction error:', rollbackError);
            }
            throw error;
        }
        finally {
            conn.release();
        }
    }
    async paginate(sql, params, page, limit) {
        // LIMIT/OFFSET are inlined as validated integers rather than bound parameters:
        // MySQL 8.4 rejects string-typed values there in the prepared-statement protocol.
        // Clamping here also caps runaway page sizes for every paginated endpoint.
        const safeLimit = Math.min(Math.max(1, Math.floor(Number(limit)) || 20), 100);
        const safePage = Math.max(1, Math.floor(Number(page)) || 1);
        const offset = (safePage - 1) * safeLimit;
        const countSql = `SELECT COUNT(*) as total FROM (${sql}) as count_query`;
        const [countResult] = await this.pool.execute(countSql, params);
        const total = countResult[0]?.total || 0;
        const paginatedSql = `${sql} LIMIT ${safeLimit} OFFSET ${offset}`;
        const data = await this.query(paginatedSql, params);
        return {
            data,
            total,
            page: safePage,
            limit: safeLimit,
            pages: Math.ceil(total / safeLimit)
        };
    }
}
exports.db = new Database();
//# sourceMappingURL=database.js.map