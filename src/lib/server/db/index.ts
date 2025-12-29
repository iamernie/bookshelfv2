import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const databasePath = env.DATABASE_PATH || './data/database.sqlite';

// Ensure data directory exists
import { mkdirSync, existsSync, copyFileSync } from 'fs';
import { dirname, basename, join } from 'path';

const dir = dirname(databasePath);
if (!existsSync(dir)) {
	mkdirSync(dir, { recursive: true });
}

// ============================================================================
// PRE-MIGRATION BACKUP - Creates backup before any schema changes
// ============================================================================

function createPreMigrationBackup(): string | null {
	// Only backup if database exists and has content
	if (!existsSync(databasePath)) {
		return null;
	}

	try {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const dbName = basename(databasePath, '.sqlite');
		const backupDir = join(dir, 'backups');

		// Ensure backup directory exists
		if (!existsSync(backupDir)) {
			mkdirSync(backupDir, { recursive: true });
		}

		const backupPath = join(backupDir, `${dbName}-pre-migration-${timestamp}.sqlite`);

		// Copy the database file
		copyFileSync(databasePath, backupPath);

		// Also copy WAL file if it exists
		const walPath = databasePath + '-wal';
		if (existsSync(walPath)) {
			copyFileSync(walPath, backupPath + '-wal');
		}

		// Also copy SHM file if it exists
		const shmPath = databasePath + '-shm';
		if (existsSync(shmPath)) {
			copyFileSync(shmPath, backupPath + '-shm');
		}

		console.log(`[db] Created pre-migration backup: ${backupPath}`);
		return backupPath;
	} catch (e) {
		console.error('[db] Failed to create pre-migration backup:', e);
		return null;
	}
}

const sqlite = new Database(databasePath);

// Enable WAL mode for better concurrent performance
sqlite.pragma('journal_mode = WAL');

// ============================================================================
// SCHEMA MIGRATION - Ensures all required tables and columns exist
// ============================================================================

// Migration status for tracking progress
export interface MigrationStatus {
	inProgress: boolean;
	completed: boolean;
	currentStep: string;
	steps: string[];
	completedSteps: string[];
	error: string | null;
	backupPath: string | null;
	startTime: number | null;
	endTime: number | null;
}

export const migrationStatus: MigrationStatus = {
	inProgress: false,
	completed: false,
	currentStep: '',
	steps: [],
	completedSteps: [],
	error: null,
	backupPath: null,
	startTime: null,
	endTime: null
};

// Track if we've made any changes (to know if backup was needed)
let migrationsMade = false;
let backupCreated = false;

function updateStatus(step: string) {
	migrationStatus.currentStep = step;
	console.log(`[db] ${step}`);
}

function completeStep(step: string) {
	if (!migrationStatus.completedSteps.includes(step)) {
		migrationStatus.completedSteps.push(step);
	}
}

function ensureBackup() {
	if (!backupCreated && !migrationsMade) {
		updateStatus('Creating pre-migration backup...');
		const backup = createPreMigrationBackup();
		if (backup) {
			backupCreated = true;
			migrationStatus.backupPath = backup;
			completeStep('Backup created');
		}
	}
}

function tableExists(tableName: string): boolean {
	// SQLite table names are case-insensitive, so check with LOWER()
	const result = sqlite.prepare(
		"SELECT name FROM sqlite_master WHERE type='table' AND LOWER(name)=LOWER(?)"
	).get(tableName);
	return !!result;
}

// Get actual table name (with correct case) from database
function getActualTableName(tableName: string): string | null {
	const result = sqlite.prepare(
		"SELECT name FROM sqlite_master WHERE type='table' AND LOWER(name)=LOWER(?)"
	).get(tableName) as { name: string } | undefined;
	return result?.name || null;
}

function columnExists(tableName: string, columnName: string): boolean {
	try {
		const columns = sqlite.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string }[];
		return columns.some(col => col.name === columnName);
	} catch {
		return false;
	}
}

function safeAddColumn(tableName: string, columnName: string, columnDef: string): boolean {
	if (!columnExists(tableName, columnName)) {
		ensureBackup(); // Create backup before first change
		try {
			sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
			console.log(`[db] Added column ${tableName}.${columnName}`);
			migrationsMade = true;
			return true;
		} catch (e) {
			console.error(`[db] Failed to add column ${tableName}.${columnName}:`, e);
			return false;
		}
	}
	return false;
}

function safeCreateTable(tableName: string, createSQL: string): boolean {
	if (!tableExists(tableName)) {
		ensureBackup(); // Create backup before first change
		try {
			sqlite.exec(createSQL);
			console.log(`[db] Created table ${tableName}`);
			migrationsMade = true;
			return true;
		} catch (e) {
			console.error(`[db] Failed to create table ${tableName}:`, e);
			return false;
		}
	}
	return false;
}

// Migrate old settings table schema (id-based) to new schema (key-based)
function migrateSettingsTableSchema(): boolean {
	if (!tableExists('settings')) {
		return false;
	}

	// Check if the table has the old schema (has 'id' column)
	const hasIdColumn = columnExists('settings', 'id');
	const hasKeyAsPrimary = !hasIdColumn || columnExists('settings', 'type');

	if (hasIdColumn && !hasKeyAsPrimary) {
		ensureBackup();
		try {
			console.log('[db] Migrating settings table from old schema to new schema...');

			// Create new table with correct schema
			sqlite.exec(`
				CREATE TABLE settings_new (
					key TEXT PRIMARY KEY,
					value TEXT,
					type TEXT DEFAULT 'string',
					category TEXT DEFAULT 'general',
					label TEXT,
					description TEXT,
					isSystem INTEGER DEFAULT 0,
					createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
					updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
				)
			`);

			// Copy data from old table (only key, value, category exist in old schema)
			sqlite.exec(`
				INSERT OR IGNORE INTO settings_new (key, value, category, createdAt, updatedAt)
				SELECT key, value, category, createdAt, updatedAt FROM settings
			`);

			// Drop old table and rename new one
			sqlite.exec('DROP TABLE settings');
			sqlite.exec('ALTER TABLE settings_new RENAME TO settings');

			console.log('[db] Settings table migrated successfully');
			migrationsMade = true;
			return true;
		} catch (e) {
			console.error('[db] Failed to migrate settings table:', e);
			// Try to clean up
			try {
				sqlite.exec('DROP TABLE IF EXISTS settings_new');
			} catch {}
			return false;
		}
	}
	return false;
}

// Rename table if old name exists and new name doesn't
// Handles case-insensitive SQLite table names properly
function safeRenameTable(oldName: string, newName: string): boolean {
	const actualOldName = getActualTableName(oldName);
	const actualNewName = getActualTableName(newName);

	// If both exist (case variations), they're the same table - nothing to do
	if (actualOldName && actualNewName) {
		// Both names resolve to tables - if they're different tables, we have a conflict
		// If same table (just different case), nothing to do
		if (actualOldName.toLowerCase() === actualNewName.toLowerCase()) {
			return false; // Same table, already exists
		}
		// Different tables with similar names - skip rename to avoid conflict
		console.log(`[db] Skipping rename ${oldName} -> ${newName}: both tables exist`);
		return false;
	}

	// Only rename if old exists and new doesn't
	if (actualOldName && !actualNewName) {
		ensureBackup(); // Create backup before first change
		try {
			sqlite.exec(`ALTER TABLE "${actualOldName}" RENAME TO "${newName}"`);
			console.log(`[db] Renamed table ${actualOldName} to ${newName}`);
			migrationsMade = true;
			return true;
		} catch (e) {
			console.error(`[db] Failed to rename table ${actualOldName} to ${newName}:`, e);
			return false;
		}
	}
	return false;
}

// Run migrations
function runMigrations() {
	migrationStatus.inProgress = true;
	migrationStatus.startTime = Date.now();
	migrationStatus.steps = [
		'Checking database schema',
		'Migrating table names',
		'Creating core tables',
		'Adding new columns',
		'Creating V2 tables',
		'Creating indexes',
		'Setting up per-user libraries',
		'Creating audiobook tables',
		'Finalizing'
	];

	try {
		updateStatus('Checking database schema...');
		completeStep('Checking database schema');

		// ========== V1 to V2 table name migrations ==========
		updateStatus('Migrating table names...');
		// V1 used PascalCase for some junction tables, V2 uses lowercase
		safeRenameTable('BookAuthors', 'bookauthors');
		safeRenameTable('BookSeries', 'bookseries');
		safeRenameTable('BookTags', 'booktags');
		safeRenameTable('SeriesTags', 'seriestags');
		completeStep('Migrating table names');

		// ========== Core V1 tables (needed for fresh installs or V1 migration) ==========
		updateStatus('Creating core tables...');

		// Users table
	safeCreateTable('users', `
		CREATE TABLE users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT NOT NULL UNIQUE,
			passwordHash TEXT NOT NULL,
			firstName TEXT,
			lastName TEXT,
			role TEXT DEFAULT 'user',
			failedLoginAttempts INTEGER DEFAULT 0,
			lockoutUntil TEXT,
			passwordResetToken TEXT,
			passwordResetExpires TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Genres table
	safeCreateTable('genres', `
		CREATE TABLE genres (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE,
			color TEXT,
			icon TEXT,
			description TEXT,
			displayOrder INTEGER DEFAULT 0,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Statuses table
	safeCreateTable('statuses', `
		CREATE TABLE statuses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			key TEXT,
			isSystem INTEGER DEFAULT 0,
			sortOrder INTEGER DEFAULT 0,
			color TEXT,
			icon TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Series statuses table
	safeCreateTable('seriesstatuses', `
		CREATE TABLE seriesstatuses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE,
			color TEXT,
			icon TEXT,
			sortOrder INTEGER DEFAULT 0,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Authors table
	safeCreateTable('authors', `
		CREATE TABLE authors (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			bio TEXT,
			website TEXT,
			photoUrl TEXT,
			birthDate TEXT,
			deathDate TEXT,
			nationality TEXT,
			wikipediaUrl TEXT,
			goodreadsUrl TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Series table
	safeCreateTable('series', `
		CREATE TABLE series (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT,
			status TEXT DEFAULT 'ongoing',
			color TEXT,
			icon TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Tags table
	safeCreateTable('tags', `
		CREATE TABLE tags (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE,
			color TEXT,
			icon TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Formats table (V2 addition - may be missing from V1)
	safeCreateTable('formats', `
		CREATE TABLE formats (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Narrators table (V2 addition - may be missing from V1)
	safeCreateTable('narrators', `
		CREATE TABLE narrators (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			bio TEXT,
			photoUrl TEXT,
			website TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Books table
	safeCreateTable('books', `
		CREATE TABLE books (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			subtitle TEXT,
			description TEXT,
			coverImageUrl TEXT,
			originalCoverUrl TEXT,
			isbn10 TEXT,
			isbn13 TEXT,
			asin TEXT,
			goodreadsId TEXT,
			googleBooksId TEXT,
			pageCount INTEGER,
			publisher TEXT,
			publishYear INTEGER,
			language TEXT DEFAULT 'English',
			edition TEXT,
			purchasePrice REAL,
			bookNum REAL,
			bookNumEnd INTEGER,
			rating REAL,
			statusId INTEGER REFERENCES statuses(id),
			genreId INTEGER REFERENCES genres(id),
			formatId INTEGER REFERENCES formats(id),
			narratorId INTEGER REFERENCES narrators(id),
			startReadingDate TEXT,
			completedDate TEXT,
			comments TEXT,
			ebookPath TEXT,
			ebookFormat TEXT,
			readingProgress REAL DEFAULT 0,
			lastReadAt TEXT,
			readingPosition TEXT,
			dnfPage INTEGER,
			dnfPercent INTEGER,
			dnfReason TEXT,
			dnfDate TEXT,
			dnfPercentComplete INTEGER,
			libraryType TEXT DEFAULT 'personal',
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Junction tables
	safeCreateTable('bookauthors', `
		CREATE TABLE bookauthors (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			bookId INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
			authorId INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
			authorOrder INTEGER DEFAULT 0,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(bookId, authorId)
		)
	`);

	safeCreateTable('bookseries', `
		CREATE TABLE bookseries (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			bookId INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
			seriesId INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
			seriesOrder REAL,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(bookId, seriesId)
		)
	`);

	safeCreateTable('booktags', `
		CREATE TABLE booktags (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			bookId INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
			tagId INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(bookId, tagId)
		)
	`);

	safeCreateTable('booknarrators', `
		CREATE TABLE booknarrators (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			bookId INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
			narratorId INTEGER NOT NULL REFERENCES narrators(id) ON DELETE CASCADE,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(bookId, narratorId)
		)
	`);

	// Create indexes for junction tables
	try {
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_bookauthors_book ON bookauthors(bookId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_bookauthors_author ON bookauthors(authorId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_bookseries_book ON bookseries(bookId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_bookseries_series ON bookseries(seriesId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_booktags_book ON booktags(bookId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_booktags_tag ON booktags(tagId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_booknarrators_book ON booknarrators(bookId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_booknarrators_narrator ON booknarrators(narratorId)');
	} catch {
		// Indexes may already exist
	}

	// ========== V2-specific tables ==========

	// Magic Shelves table
	safeCreateTable('magicshelves', `
		CREATE TABLE magicshelves (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT,
			icon TEXT DEFAULT 'bookmark',
			iconColor TEXT DEFAULT '#6c757d',
			filterJson TEXT NOT NULL DEFAULT '{"logic":"AND","rules":[]}',
			sortField TEXT DEFAULT 'title',
			sortOrder TEXT DEFAULT 'asc',
			isPublic INTEGER DEFAULT 0,
			userId INTEGER REFERENCES users(id),
			displayOrder INTEGER DEFAULT 0,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Reading Goals table
	safeCreateTable('readinggoals', `
		CREATE TABLE readinggoals (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			year INTEGER NOT NULL,
			targetBooks INTEGER DEFAULT 12,
			booksRead INTEGER DEFAULT 0,
			isActive INTEGER DEFAULT 1,
			challengeType TEXT,
			name TEXT,
			targetGenres INTEGER,
			targetAuthors INTEGER,
			targetFormats INTEGER,
			targetPages INTEGER,
			targetMonthly INTEGER,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Settings table - first migrate old schema if needed
	migrateSettingsTableSchema();

	// Create settings table if it doesn't exist (fresh install)
	safeCreateTable('settings', `
		CREATE TABLE settings (
			key TEXT PRIMARY KEY,
			value TEXT,
			type TEXT DEFAULT 'string',
			category TEXT DEFAULT 'general',
			label TEXT,
			description TEXT,
			isSystem INTEGER DEFAULT 0,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Add missing columns to settings table (for databases that were migrated but may still lack columns)
	if (tableExists('settings')) {
		safeAddColumn('settings', 'type', "TEXT DEFAULT 'string'");
		safeAddColumn('settings', 'label', 'TEXT');
		safeAddColumn('settings', 'description', 'TEXT');
		safeAddColumn('settings', 'isSystem', 'INTEGER DEFAULT 0');
	}
	completeStep('Creating core tables');

	// ========== Books table columns ==========
	updateStatus('Adding new columns...');
	if (tableExists('books')) {
		// V2 additions - format and narrator references
		safeAddColumn('books', 'formatId', 'INTEGER REFERENCES formats(id)');
		safeAddColumn('books', 'narratorId', 'INTEGER REFERENCES narrators(id)');

		// Ebook-related columns
		safeAddColumn('books', 'ebookPath', 'VARCHAR(255)');
		safeAddColumn('books', 'ebookFormat', 'VARCHAR(50)');
		safeAddColumn('books', 'readingProgress', 'REAL DEFAULT 0');
		safeAddColumn('books', 'lastReadAt', 'DATETIME');
		safeAddColumn('books', 'readingPosition', 'TEXT');

		// Book metadata columns (may be missing from older V1 databases)
		safeAddColumn('books', 'isbn10', 'VARCHAR(10)');
		safeAddColumn('books', 'isbn13', 'VARCHAR(13)');
		safeAddColumn('books', 'asin', 'VARCHAR(10)');
		safeAddColumn('books', 'goodreadsId', 'VARCHAR(50)');
		safeAddColumn('books', 'googleBooksId', 'VARCHAR(50)');
		safeAddColumn('books', 'originalCoverUrl', 'VARCHAR(255)');
		safeAddColumn('books', 'pageCount', 'INTEGER');
		safeAddColumn('books', 'publisher', 'VARCHAR(255)');
		safeAddColumn('books', 'publishYear', 'INTEGER');
		safeAddColumn('books', 'language', "VARCHAR(50) DEFAULT 'English'");
		safeAddColumn('books', 'edition', 'VARCHAR(100)');
		safeAddColumn('books', 'purchasePrice', 'DECIMAL(10,2)');
		safeAddColumn('books', 'bookNumEnd', 'INTEGER');

		// DNF tracking columns
		safeAddColumn('books', 'dnfPage', 'INTEGER');
		safeAddColumn('books', 'dnfPercent', 'INTEGER');
		safeAddColumn('books', 'dnfReason', 'VARCHAR(255)');
		safeAddColumn('books', 'dnfDate', 'DATETIME');
		safeAddColumn('books', 'dnfPercentComplete', 'INTEGER');
	}

	// ========== Users table columns ==========
	if (tableExists('users')) {
		safeAddColumn('users', 'firstName', 'VARCHAR(100)');
		safeAddColumn('users', 'lastName', 'VARCHAR(100)');
		safeAddColumn('users', 'role', "VARCHAR(50) DEFAULT 'user'");
		safeAddColumn('users', 'failedLoginAttempts', 'INTEGER DEFAULT 0');
		safeAddColumn('users', 'lockoutUntil', 'DATETIME');
		safeAddColumn('users', 'passwordResetToken', 'VARCHAR(255)');
		safeAddColumn('users', 'passwordResetExpires', 'DATETIME');
	}

	// ========== Sessions table ==========
	safeCreateTable('sessions', `
		CREATE TABLE sessions (
			sid TEXT PRIMARY KEY,
			expires TEXT,
			data TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// ========== Authors table columns ==========
	if (tableExists('authors')) {
		safeAddColumn('authors', 'bio', 'TEXT');
		safeAddColumn('authors', 'website', 'VARCHAR(255)');
		safeAddColumn('authors', 'photoUrl', 'VARCHAR(255)');
		safeAddColumn('authors', 'birthDate', 'DATE');
		safeAddColumn('authors', 'deathDate', 'DATE');
		safeAddColumn('authors', 'nationality', 'VARCHAR(100)');
		safeAddColumn('authors', 'wikipediaUrl', 'VARCHAR(255)');
		safeAddColumn('authors', 'goodreadsUrl', 'VARCHAR(255)');
	}

	// ========== Series table columns ==========
	if (tableExists('series')) {
		safeAddColumn('series', 'status', "VARCHAR(50) DEFAULT 'ongoing'");
		safeAddColumn('series', 'color', 'VARCHAR(20)');
		safeAddColumn('series', 'icon', 'VARCHAR(50)');
	}

	// ========== Genres table columns ==========
	if (tableExists('genres')) {
		safeAddColumn('genres', 'color', 'VARCHAR(20)');
		safeAddColumn('genres', 'icon', 'VARCHAR(50)');
		safeAddColumn('genres', 'description', 'TEXT');
		safeAddColumn('genres', 'displayOrder', 'INTEGER DEFAULT 0');
	}

	// ========== Formats table columns ==========
	if (tableExists('formats')) {
		safeAddColumn('formats', 'icon', "TEXT DEFAULT 'book'");
		safeAddColumn('formats', 'color', "TEXT DEFAULT '#6c757d'");
	}

	// ========== Statuses table columns ==========
	if (tableExists('statuses')) {
		safeAddColumn('statuses', 'key', 'VARCHAR(50)');
		safeAddColumn('statuses', 'isSystem', 'INTEGER DEFAULT 0');
		safeAddColumn('statuses', 'sortOrder', 'INTEGER DEFAULT 0');
		safeAddColumn('statuses', 'color', 'VARCHAR(20)');
		safeAddColumn('statuses', 'icon', 'VARCHAR(50)');
	}

	// ========== Reading Goals table ==========
	safeCreateTable('readinggoals', `
		CREATE TABLE readinggoals (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			year INTEGER NOT NULL,
			targetBooks INTEGER DEFAULT 12,
			booksRead INTEGER DEFAULT 0,
			isActive INTEGER DEFAULT 1,
			challengeType TEXT,
			name TEXT,
			targetGenres INTEGER,
			targetAuthors INTEGER,
			targetFormats INTEGER,
			targetPages INTEGER,
			targetMonthly INTEGER,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Reading Goals columns (may be missing from older databases)
	if (tableExists('readinggoals')) {
		safeAddColumn('readinggoals', 'challengeType', 'TEXT');
		safeAddColumn('readinggoals', 'name', 'TEXT');
		safeAddColumn('readinggoals', 'icon', 'TEXT');
		safeAddColumn('readinggoals', 'targetGenres', 'INTEGER');
		safeAddColumn('readinggoals', 'targetAuthors', 'INTEGER');
		safeAddColumn('readinggoals', 'targetFormats', 'INTEGER');
		safeAddColumn('readinggoals', 'targetPages', 'INTEGER');
		safeAddColumn('readinggoals', 'targetMonthly', 'INTEGER');
	}
	completeStep('Adding new columns');

	// ========== V2 Tables ==========
	updateStatus('Creating V2 tables...');

	// ========== BookDrop Queue table ==========
	safeCreateTable('bookdrop_queue', `
		CREATE TABLE bookdrop_queue (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userId INTEGER REFERENCES users(id),
			filename TEXT NOT NULL,
			filePath TEXT NOT NULL,
			fileSize INTEGER,
			fileHash TEXT,
			source TEXT DEFAULT 'upload',
			status TEXT DEFAULT 'pending',
			bookId INTEGER REFERENCES books(id),
			metadata TEXT,
			coverData TEXT,
			errorMessage TEXT,
			processedAt TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// ========== BookDrop Settings table ==========
	safeCreateTable('bookdrop_settings', `
		CREATE TABLE bookdrop_settings (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userId INTEGER REFERENCES users(id),
			folderPath TEXT,
			enabled INTEGER DEFAULT 1,
			autoImport INTEGER DEFAULT 0,
			afterImport TEXT DEFAULT 'move',
			processedFolder TEXT,
			afterSkip TEXT DEFAULT 'keep',
			skippedFolder TEXT,
			defaultStatusId INTEGER REFERENCES statuses(id),
			defaultFormatId INTEGER REFERENCES formats(id),
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// ========== Series Tags junction table ==========
	safeCreateTable('seriestags', `
		CREATE TABLE seriestags (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			seriesId INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
			tagId INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
			createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// ========== Public Library Feature ==========

	// Add libraryType column to books (personal vs public)
	if (tableExists('books')) {
		safeAddColumn('books', 'libraryType', "TEXT DEFAULT 'personal'");
	}

	// User-specific book data table (for personal reading data)
	safeCreateTable('user_books', `
		CREATE TABLE user_books (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			bookId INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
			-- Reading status
			statusId INTEGER REFERENCES statuses(id),
			rating REAL,
			-- Reading dates
			startReadingDate TEXT,
			completedDate TEXT,
			-- Personal notes
			comments TEXT,
			-- Reading progress
			readingProgress REAL DEFAULT 0,
			readingPosition TEXT,
			lastReadAt TEXT,
			-- DNF tracking
			dnfPage INTEGER,
			dnfPercent INTEGER,
			dnfReason TEXT,
			dnfDate TEXT,
			-- Timestamps
			addedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(userId, bookId)
		)
	`);

	// Create index for user_books queries
	try {
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_user_books_user ON user_books(userId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_user_books_book ON user_books(bookId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_user_books_status ON user_books(statusId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_books_libraryType ON books(libraryType)');
	} catch {
		// Indexes may already exist
	}

	// User-specific tags (personal tags on books)
	safeCreateTable('user_book_tags', `
		CREATE TABLE user_book_tags (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			bookId INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
			tagId INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(userId, bookId, tagId)
		)
	`);

	// Create index for user_book_tags queries
	try {
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_user_book_tags_user_book ON user_book_tags(userId, bookId)');
	} catch {
		// Index may already exist
	}

	// Metadata edit suggestions queue
	safeCreateTable('metadata_suggestions', `
		CREATE TABLE metadata_suggestions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			bookId INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
			userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			field TEXT NOT NULL,
			oldValue TEXT,
			newValue TEXT,
			status TEXT DEFAULT 'pending',
			reviewedBy INTEGER REFERENCES users(id),
			reviewedAt TEXT,
			reviewNotes TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Create index for metadata_suggestions queries
	try {
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_metadata_suggestions_status ON metadata_suggestions(status)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_metadata_suggestions_book ON metadata_suggestions(bookId)');
	} catch {
		// Index may already exist
	}

	// ========== Reading Sessions table (for heatmap) ==========
	safeCreateTable('reading_sessions', `
		CREATE TABLE reading_sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			bookId INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
			userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
			startedAt TEXT NOT NULL,
			endedAt TEXT,
			durationMinutes INTEGER,
			pagesRead INTEGER,
			startProgress REAL,
			endProgress REAL,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Create indexes for reading_sessions queries
	try {
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_reading_sessions_book ON reading_sessions(bookId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_reading_sessions_user ON reading_sessions(userId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_reading_sessions_started ON reading_sessions(startedAt)');
	} catch {
		// Indexes may already exist
	}

	// ========== User role column for permissions ==========
	if (tableExists('users')) {
		// Ensure role column exists with proper values
		// Roles: admin, librarian, member, viewer, guest
		// (role column already exists but may need values updated)
		safeAddColumn('users', 'username', 'TEXT');
		safeAddColumn('users', 'password', 'TEXT');
		safeAddColumn('users', 'resetToken', 'TEXT');
		safeAddColumn('users', 'resetTokenExpires', 'TEXT');
		// Email verification columns
		safeAddColumn('users', 'emailVerified', 'INTEGER DEFAULT 0');
		safeAddColumn('users', 'emailVerificationToken', 'TEXT');
		safeAddColumn('users', 'emailVerificationExpires', 'TEXT');

		// Account approval columns
		safeAddColumn('users', 'approvalStatus', "TEXT DEFAULT 'approved'");
		safeAddColumn('users', 'approvedBy', 'INTEGER');
		safeAddColumn('users', 'approvedAt', 'TEXT');
		safeAddColumn('users', 'inviteCodeUsed', 'TEXT');

		// Migrate passwordHash to password column for V1 databases
		if (columnExists('users', 'passwordHash') && columnExists('users', 'password')) {
			try {
				const result = sqlite.prepare(`
					UPDATE users
					SET password = passwordHash
					WHERE password IS NULL OR password = ''
					  AND passwordHash IS NOT NULL AND passwordHash != ''
				`).run();
				if (result.changes > 0) {
					console.log(`[db] Migrated passwordHash to password for ${result.changes} users`);
					migrationsMade = true;
				}
			} catch (e) {
				console.error('[db] Failed to migrate passwordHash to password:', e);
			}
		}
	}

	// ========== Invite Codes table ==========
	safeCreateTable('invitecodes', `
		CREATE TABLE invitecodes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			code TEXT NOT NULL UNIQUE,
			label TEXT,
			maxUses INTEGER,
			usedCount INTEGER DEFAULT 0,
			expiresAt TEXT,
			isActive INTEGER DEFAULT 1,
			createdBy INTEGER REFERENCES users(id),
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// ========== User Preferences table ==========
	safeCreateTable('user_preferences', `
		CREATE TABLE user_preferences (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userId INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
			-- Display preferences
			theme TEXT DEFAULT 'system',
			accentColor TEXT DEFAULT '#3b82f6',
			-- Dashboard preferences (JSON)
			dashboardWidgets TEXT,
			-- Default view preferences
			defaultBooksView TEXT DEFAULT 'grid',
			defaultBooksSort TEXT DEFAULT 'title',
			defaultBooksSortOrder TEXT DEFAULT 'asc',
			booksPerPage INTEGER DEFAULT 24,
			-- Reader preferences
			readerFontFamily TEXT DEFAULT 'system',
			readerFontSize INTEGER DEFAULT 16,
			readerLineHeight REAL DEFAULT 1.6,
			readerTheme TEXT DEFAULT 'auto',
			-- Notification preferences
			emailNotifications INTEGER DEFAULT 0,
			goalReminders INTEGER DEFAULT 1,
			-- Sidebar state
			sidebarCollapsed INTEGER DEFAULT 0,
			-- Timestamps
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Create index for user_preferences queries
	try {
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(userId)');
	} catch {
		// Index may already exist
	}

	// ========== OIDC Providers table ==========
	safeCreateTable('oidc_providers', `
		CREATE TABLE oidc_providers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			slug TEXT NOT NULL UNIQUE,
			issuerUrl TEXT NOT NULL,
			clientId TEXT NOT NULL,
			clientSecret TEXT NOT NULL,
			scopes TEXT DEFAULT '["openid", "profile", "email"]',
			enabled INTEGER DEFAULT 1,
			autoCreateUsers INTEGER DEFAULT 0,
			defaultRole TEXT DEFAULT 'member',
			iconUrl TEXT,
			buttonColor TEXT,
			displayOrder INTEGER DEFAULT 0,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// ========== User OIDC Links table ==========
	safeCreateTable('user_oidc_links', `
		CREATE TABLE user_oidc_links (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			providerId INTEGER NOT NULL REFERENCES oidc_providers(id) ON DELETE CASCADE,
			oidcSubject TEXT NOT NULL,
			oidcEmail TEXT,
			oidcName TEXT,
			linkedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			lastLoginAt TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(providerId, oidcSubject)
		)
	`);
	completeStep('Creating V2 tables');

	// Create indexes for OIDC tables
	updateStatus('Creating indexes...');
	try {
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_user_oidc_links_user ON user_oidc_links(userId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_user_oidc_links_provider ON user_oidc_links(providerId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_user_oidc_links_subject ON user_oidc_links(providerId, oidcSubject)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_oidc_providers_slug ON oidc_providers(slug)');
	} catch {
		// Indexes may already exist
	}
	completeStep('Creating indexes');

	// ========== Per-User Libraries Feature ==========
	updateStatus('Setting up per-user libraries...');

	// Add ownerId column to books table for book ownership
	if (tableExists('books')) {
		safeAddColumn('books', 'ownerId', 'INTEGER REFERENCES users(id)');

		// Migrate existing books to admin user (id=1) if they don't have an owner
		try {
			// Check if we have any books without an owner
			const unownedBooks = sqlite.prepare(`
				SELECT COUNT(*) as count FROM books WHERE ownerId IS NULL
			`).get() as { count: number };

			if (unownedBooks.count > 0) {
				ensureBackup();
				// Get the first admin user (or first user if no admin)
				const adminUser = sqlite.prepare(`
					SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1
				`).get() as { id: number } | undefined;

				const fallbackUser = sqlite.prepare(`
					SELECT id FROM users ORDER BY id ASC LIMIT 1
				`).get() as { id: number } | undefined;

				const ownerId = adminUser?.id || fallbackUser?.id || 1;

				const result = sqlite.prepare(`
					UPDATE books SET ownerId = ? WHERE ownerId IS NULL
				`).run(ownerId);

				if (result.changes > 0) {
					console.log(`[db] Assigned ${result.changes} existing books to user ${ownerId}`);
					migrationsMade = true;
				}
			}
		} catch (e) {
			console.error('[db] Failed to migrate book ownership:', e);
		}

		// Create index for ownerId queries
		try {
			sqlite.exec('CREATE INDEX IF NOT EXISTS idx_books_owner ON books(ownerId)');
		} catch {
			// Index may already exist
		}
	}

	// Library Shares table - allows users to share their library with others
	safeCreateTable('library_shares', `
		CREATE TABLE library_shares (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			ownerId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			sharedWithId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			permission TEXT NOT NULL DEFAULT 'read',
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(ownerId, sharedWithId)
		)
	`);

	// Create indexes for library_shares queries
	try {
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_library_shares_owner ON library_shares(ownerId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_library_shares_shared_with ON library_shares(sharedWithId)');
	} catch {
		// Indexes may already exist
	}

	// ========== Audiobook Tables ==========
	updateStatus('Creating audiobook tables...');

	// Audiobooks main table
	safeCreateTable('audiobooks', `
		CREATE TABLE audiobooks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			bookId INTEGER REFERENCES books(id) ON DELETE SET NULL,
			userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			author TEXT,
			narratorId INTEGER REFERENCES narrators(id),
			narratorName TEXT,
			description TEXT,
			coverPath TEXT,
			duration REAL DEFAULT 0,
			seriesName TEXT,
			seriesNumber REAL,
			asin TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Audiobook files table (supports multi-file audiobooks)
	safeCreateTable('audiobook_files', `
		CREATE TABLE audiobook_files (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			audiobookId INTEGER NOT NULL REFERENCES audiobooks(id) ON DELETE CASCADE,
			filename TEXT NOT NULL,
			filePath TEXT NOT NULL,
			fileSize INTEGER,
			mimeType TEXT DEFAULT 'audio/mpeg',
			trackNumber INTEGER NOT NULL DEFAULT 1,
			title TEXT,
			duration REAL NOT NULL DEFAULT 0,
			startOffset REAL DEFAULT 0,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Audiobook progress table (per-user listening progress)
	safeCreateTable('audiobook_progress', `
		CREATE TABLE audiobook_progress (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			audiobookId INTEGER NOT NULL REFERENCES audiobooks(id) ON DELETE CASCADE,
			userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			currentTime REAL DEFAULT 0,
			currentFileId INTEGER REFERENCES audiobook_files(id),
			duration REAL DEFAULT 0,
			progress REAL DEFAULT 0,
			playbackRate REAL DEFAULT 1,
			isFinished INTEGER DEFAULT 0,
			finishedAt TEXT,
			lastPlayedAt TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(audiobookId, userId)
		)
	`);

	// Audiobook chapters table
	safeCreateTable('audiobook_chapters', `
		CREATE TABLE audiobook_chapters (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			audiobookId INTEGER NOT NULL REFERENCES audiobooks(id) ON DELETE CASCADE,
			title TEXT NOT NULL,
			startTime REAL NOT NULL DEFAULT 0,
			endTime REAL,
			chapterNumber INTEGER NOT NULL DEFAULT 1,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Audiobook bookmarks table
	safeCreateTable('audiobook_bookmarks', `
		CREATE TABLE audiobook_bookmarks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			audiobookId INTEGER NOT NULL REFERENCES audiobooks(id) ON DELETE CASCADE,
			userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			time REAL NOT NULL,
			title TEXT,
			note TEXT,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Add libraryType column to audiobooks (for public library feature)
	if (tableExists('audiobooks')) {
		safeAddColumn('audiobooks', 'libraryType', "TEXT DEFAULT 'personal'");
	}

	// User audiobooks junction table (for "add to library" functionality)
	safeCreateTable('user_audiobooks', `
		CREATE TABLE user_audiobooks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			audiobookId INTEGER NOT NULL REFERENCES audiobooks(id) ON DELETE CASCADE,
			statusId INTEGER REFERENCES statuses(id),
			rating REAL,
			comments TEXT,
			addedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(userId, audiobookId)
		)
	`);

	// Create indexes for audiobook tables
	try {
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_audiobooks_user ON audiobooks(userId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_audiobooks_book ON audiobooks(bookId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_audiobooks_libraryType ON audiobooks(libraryType)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_audiobook_files_audiobook ON audiobook_files(audiobookId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_audiobook_progress_user ON audiobook_progress(userId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_audiobook_progress_audiobook ON audiobook_progress(audiobookId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_audiobook_chapters_audiobook ON audiobook_chapters(audiobookId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_audiobook_bookmarks_user_audiobook ON audiobook_bookmarks(userId, audiobookId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_user_audiobooks_user ON user_audiobooks(userId)');
		sqlite.exec('CREATE INDEX IF NOT EXISTS idx_user_audiobooks_audiobook ON user_audiobooks(audiobookId)');
	} catch {
		// Indexes may already exist
	}
	completeStep('Creating audiobook tables');

	// ========== Migrate owned books to user_books table ==========
	// For users who own books (via ownerId), ensure those books appear in their personal library (user_books)
	if (tableExists('user_books') && tableExists('books') && columnExists('books', 'ownerId')) {
		try {
			// Count books that have owners but aren't in user_books
			const missingEntries = sqlite.prepare(`
				SELECT COUNT(*) as count
				FROM books b
				WHERE b.ownerId IS NOT NULL
				  AND NOT EXISTS (
				    SELECT 1 FROM user_books ub
				    WHERE ub.userId = b.ownerId AND ub.bookId = b.id
				  )
			`).get() as { count: number };

			if (missingEntries.count > 0) {
				ensureBackup();
				console.log(`[db] Migrating ${missingEntries.count} owned books to user_books table...`);

				// Insert into user_books for all owned books that aren't already there
				const result = sqlite.prepare(`
					INSERT INTO user_books (userId, bookId, statusId, rating, startReadingDate, completedDate, comments, readingProgress, readingPosition, lastReadAt, dnfPage, dnfPercent, dnfReason, dnfDate, addedAt, createdAt, updatedAt)
					SELECT
						b.ownerId,
						b.id,
						b.statusId,
						b.rating,
						b.startReadingDate,
						b.completedDate,
						b.comments,
						b.readingProgress,
						b.readingPosition,
						b.lastReadAt,
						b.dnfPage,
						b.dnfPercent,
						b.dnfReason,
						b.dnfDate,
						COALESCE(b.createdAt, CURRENT_TIMESTAMP),
						COALESCE(b.createdAt, CURRENT_TIMESTAMP),
						COALESCE(b.updatedAt, CURRENT_TIMESTAMP)
					FROM books b
					WHERE b.ownerId IS NOT NULL
					  AND NOT EXISTS (
					    SELECT 1 FROM user_books ub
					    WHERE ub.userId = b.ownerId AND ub.bookId = b.id
					  )
				`).run();

				if (result.changes > 0) {
					console.log(`[db] Added ${result.changes} books to user_books for their owners`);
					migrationsMade = true;
				}
			}
		} catch (e) {
			console.error('[db] Failed to migrate owned books to user_books:', e);
		}
	}

	completeStep('Setting up per-user libraries');

	// ========== Data migrations for V1 compatibility ==========
	updateStatus('Migrating V1 user data...');

	// Mark existing V1 users as email verified (they were created before verification was required)
	// Only update users who have emailVerified=0 and no verification token
	try {
		const result = sqlite.prepare(`
			UPDATE users
			SET emailVerified = 1
			WHERE emailVerified = 0
			  AND (emailVerificationToken IS NULL OR emailVerificationToken = '')
		`).run();
		if (result.changes > 0) {
			console.log(`[db] Marked ${result.changes} existing V1 users as email verified`);
			migrationsMade = true;
		}
	} catch (e) {
		console.error('[db] Failed to update V1 user email verification:', e);
	}

	// Finalize
	updateStatus('Finalizing...');
	completeStep('Finalizing');

	if (migrationsMade) {
		console.log('[db] Schema migrations complete');
	} else {
		console.log('[db] Schema up to date');
	}

	} catch (e) {
		migrationStatus.error = e instanceof Error ? e.message : String(e);
		console.error('[db] Migration failed:', e);
		throw e;
	} finally {
		migrationStatus.inProgress = false;
		migrationStatus.completed = true;
		migrationStatus.endTime = Date.now();
	}
}

// Run migrations on module load
runMigrations();

export const db = drizzle(sqlite, { schema });

// Re-export schema for convenience
export * from './schema';
