import 'dotenv/config';
import { db } from './utils/database';
import { logger } from './utils/logger';
import { runMigrations } from './utils/migrate';

// Standalone entry point (`npm run migrate`) for running migrations as an
// explicit deploy step, separate from app boot — bootstrap() in server.ts
// still runs the same runMigrations() on every start so a plain `npm start`
// keeps working unattended, but production deploys can now migrate first
// and start the app after, instead of coupling the two.
runMigrations()
  .then(async () => {
    await db.end();
    process.exit(0);
  })
  .catch(async (err) => {
    logger.error('Migration run failed:', err);
    await db.end();
    process.exit(1);
  });
