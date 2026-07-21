import winston from 'winston';
import { config } from './config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

const transports: winston.transport[] = [
  new winston.transports.Console()
];

// Add file logging only in non-production, non-serverless environments
const isServerless = !!(process.env.LAMBDA_TASK_ROOT || process.env.VERCEL || process.env.NETLIFY);
if (config.nodeEnv !== 'production' && !isServerless) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5
    })
  );
}

export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    config.nodeEnv === 'production'
      ? winston.format.json()
      : combine(colorize(), logFormat)
  ),
  transports
});
