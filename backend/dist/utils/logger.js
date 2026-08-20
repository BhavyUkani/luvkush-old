"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("./config");
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}]: ${stack || message}`;
});
const transports = [
    new winston_1.default.transports.Console()
];
// Add file logging only in non-production, non-serverless environments
const isServerless = !!(process.env.LAMBDA_TASK_ROOT || process.env.VERCEL || process.env.NETLIFY);
if (config_1.config.nodeEnv !== 'production' && !isServerless) {
    transports.push(new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5
    }), new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5
    }));
}
exports.logger = winston_1.default.createLogger({
    level: config_1.config.nodeEnv === 'production' ? 'info' : 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), config_1.config.nodeEnv === 'production'
        ? winston_1.default.format.json()
        : combine(colorize(), logFormat)),
    transports
});
//# sourceMappingURL=logger.js.map