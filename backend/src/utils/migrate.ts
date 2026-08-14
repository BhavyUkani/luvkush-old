import fs from 'fs';
import path from 'path';
import { db } from './database';
import { logger } from './logger';

// backend/dist/utils (built) and backend/src/utils (ts-node-dev) are both
// exactly two levels below backend/ — this resolves to backend/migrations
// either way.
const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');

/** Splits a .sql file into individual statements. Deliberately simple (no
 * awareness of semicolons inside string literals, stored procedures, etc.)
 * — sufficient because every migration file here is authored by us and
 * contains only plain DDL/DML statements. Comment lines are stripped before
 * splitting so a semicolon inside a `-- comment` (explaining what a column
 * is used for, say) can't be mistaken for a statement boundary. */
function splitStatements(sql: string): string[] {
  const withoutComments = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

  return withoutComments
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/** Tracked, one-shot-per-file migration runner: replaces the old pattern of
 * re-checking INFORMATION_SCHEMA on every single boot (LK-M33) with a table
 * that records which migration files have already run, so a normal boot
 * does one cheap SELECT instead of ~10 metadata-introspection queries. */
export async function runMigrations(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const applied = new Set(
    (await db.query<{ name: string }[]>('SELECT name FROM schema_migrations')).map(r => r.name)
  );

  const files = fs.existsSync(MIGRATIONS_DIR)
    ? fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()
    : [];

  const pending = files.filter(f => !applied.has(f));
  if (pending.length === 0) {
    logger.info('Database schema is up to date (no pending migrations).');
    return;
  }

  logger.info(`Running ${pending.length} pending migration(s): ${pending.join(', ')}`);
  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    for (const statement of splitStatements(sql)) {
      await db.query(statement);
    }
    await db.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
    logger.info(`✓ Applied migration ${file}`);
  }
  logger.info('✓ Database migrations completed successfully');
}
