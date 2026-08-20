"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const database_1 = require("./utils/database");
const logger_1 = require("./utils/logger");
const migrate_1 = require("./utils/migrate");
// Standalone entry point (`npm run migrate`) for running migrations as an
// explicit deploy step, separate from app boot — bootstrap() in server.ts
// still runs the same runMigrations() on every start so a plain `npm start`
// keeps working unattended, but production deploys can now migrate first
// and start the app after, instead of coupling the two.
(0, migrate_1.runMigrations)()
    .then(async () => {
    await database_1.db.end();
    process.exit(0);
})
    .catch(async (err) => {
    logger_1.logger.error('Migration run failed:', err);
    await database_1.db.end();
    process.exit(1);
});
//# sourceMappingURL=migrate-cli.js.map