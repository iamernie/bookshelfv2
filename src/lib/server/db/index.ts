import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const databasePath = env.DATABASE_PATH || './data/database.sqlite';

// Ensure data directory exists
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

const dir = dirname(databasePath);
if (!existsSync(dir)) {
	mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(databasePath);

// Enable WAL mode for better concurrent performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Re-export schema for convenience
export * from './schema';
