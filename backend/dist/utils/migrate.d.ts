/** Tracked, one-shot-per-file migration runner: replaces the old pattern of
 * re-checking INFORMATION_SCHEMA on every single boot (LK-M33) with a table
 * that records which migration files have already run, so a normal boot
 * does one cheap SELECT instead of ~10 metadata-introspection queries. */
export declare function runMigrations(): Promise<void>;
//# sourceMappingURL=migrate.d.ts.map