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

// ============================================================================
// SCHEMA MIGRATION - Ensures all required tables and columns exist
// ============================================================================

function tableExists(tableName: string): boolean {
	const result = sqlite.prepare(
		"SELECT name FROM sqlite_master WHERE type='table' AND name=?"
	).get(tableName);
	return !!result;
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
		try {
			sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
			console.log(`[db] Added column ${tableName}.${columnName}`);
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
		try {
			sqlite.exec(createSQL);
			console.log(`[db] Created table ${tableName}`);
			return true;
		} catch (e) {
			console.error(`[db] Failed to create table ${tableName}:`, e);
			return false;
		}
	}
	return false;
}

// Run migrations
function runMigrations() {
	console.log('[db] Checking schema...');

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

	// Settings table
	safeCreateTable('settings', `
		CREATE TABLE settings (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			key TEXT NOT NULL UNIQUE,
			value TEXT,
			category TEXT DEFAULT 'general',
			createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
			updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// ========== Books table columns ==========
	if (tableExists('books')) {
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
	}

	console.log('[db] Schema check complete');
}

// Run migrations on module load
runMigrations();

export const db = drizzle(sqlite, { schema });

// Re-export schema for convenience
export * from './schema';
