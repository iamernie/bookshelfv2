import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ============================================
// Core Tables
// ============================================

export const books = sqliteTable('books', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	rating: real('rating'),
	coverImageUrl: text('coverImageUrl'),
	originalCoverUrl: text('originalCoverUrl'),
	bookNum: integer('bookNum'),
	bookNumEnd: integer('bookNumEnd'),
	summary: text('summary'),
	comments: text('comments'),
	releaseDate: text('releaseDate'), // ISO date string
	startReadingDate: text('startReadingDate'),
	completedDate: text('completedDate'),
	isbn10: text('isbn10'),
	isbn13: text('isbn13'),
	asin: text('asin'),
	goodreadsId: text('goodreadsId'),
	googleBooksId: text('googleBooksId'),
	pageCount: integer('pageCount'),
	publisher: text('publisher'),
	publishYear: integer('publishYear'),
	language: text('language').default('English'),
	edition: text('edition'),
	purchasePrice: real('purchasePrice'),
	// DNF (Did Not Finish) tracking
	dnfPage: integer('dnfPage'),
	dnfPercent: integer('dnfPercent'),
	dnfReason: text('dnfReason'),
	dnfDate: text('dnfDate'),
	// Ebook support
	ebookPath: text('ebookPath'),
	ebookFormat: text('ebookFormat'),
	readingProgress: text('readingProgress'), // JSON
	lastReadAt: text('lastReadAt'),
	// Library type: 'personal' or 'public'
	libraryType: text('libraryType').default('personal'),
	// Foreign keys
	statusId: integer('statusId').references(() => statuses.id),
	genreId: integer('genreId').references(() => genres.id),
	formatId: integer('formatId').references(() => formats.id),
	narratorId: integer('narratorId').references(() => narrators.id),
	// Legacy single author/series (for backwards compat)
	authorId: integer('authorId').references(() => authors.id),
	seriesId: integer('seriesId').references(() => series.id),
	// Timestamps
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const authors = sqliteTable('authors', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	bio: text('bio'),
	birthDate: text('birthDate'),
	deathDate: text('deathDate'),
	birthPlace: text('birthPlace'),
	photoUrl: text('photoUrl'),
	website: text('website'),
	wikipediaUrl: text('wikipediaUrl'),
	comments: text('comments'),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const series = sqliteTable('series', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	description: text('description'),
	numBooks: integer('numBooks'),
	comments: text('comments'),
	statusId: integer('statusId').references(() => seriesStatuses.id),
	genreId: integer('genreId').references(() => genres.id),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const genres = sqliteTable('genres', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	color: text('color'),
	icon: text('icon'),
	slug: text('slug').unique(),
	displayOrder: integer('displayOrder').default(0),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const statuses = sqliteTable('statuses', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	key: text('key').unique(), // READ, CURRENT, NEXT, DNF, WISHLIST, PARKED
	isSystem: integer('isSystem', { mode: 'boolean' }).default(false),
	color: text('color').default('#6c757d'),
	icon: text('icon').default('fas fa-bookmark'),
	sortOrder: integer('sortOrder').default(0),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const seriesStatuses = sqliteTable('seriesstatuses', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	key: text('key'),
	isSystem: integer('isSystem', { mode: 'boolean' }).default(false),
	color: text('color').default('#6c757d'),
	icon: text('icon').default('fas fa-bookmark'),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const narrators = sqliteTable('narrators', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	bio: text('bio'),
	url: text('url'),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const formats = sqliteTable('formats', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	icon: text('icon').default('book'),
	color: text('color').default('#6c757d'),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const tags = sqliteTable('tags', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	color: text('color').default('#6c757d'),
	icon: text('icon'),
	isSystem: integer('isSystem', { mode: 'boolean' }).default(false),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	role: text('role').default('user'), // admin, editor, user
	firstName: text('firstName'),
	lastName: text('lastName'),
	failedLoginAttempts: integer('failedLoginAttempts').default(0),
	lockoutUntil: text('lockoutUntil'),
	resetToken: text('resetToken'),
	resetTokenExpires: text('resetTokenExpires'),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const settings = sqliteTable('settings', {
	key: text('key').primaryKey(),
	value: text('value'),
	type: text('type').default('string'), // string, number, boolean, json
	category: text('category'),
	label: text('label'),
	description: text('description'),
	isSystem: integer('isSystem', { mode: 'boolean' }).default(false),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const readingGoals = sqliteTable('readinggoals', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	year: integer('year').notNull(),
	targetBooks: integer('targetBooks').default(12),
	booksRead: integer('booksRead').default(0),
	isActive: integer('isActive', { mode: 'boolean' }).default(true),
	challengeType: text('challengeType'), // books, genres, authors, formats, pages, monthly
	name: text('name'),
	icon: text('icon'), // Custom icon override (lucide icon name)
	targetGenres: integer('targetGenres'),
	targetAuthors: integer('targetAuthors'),
	targetFormats: integer('targetFormats'),
	targetPages: integer('targetPages'),
	targetMonthly: integer('targetMonthly'),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const sessions = sqliteTable('Sessions', {
	sid: text('sid').primaryKey(),
	expires: text('expires'),
	data: text('data'),
	createdAt: text('createdAt').notNull().default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').notNull().default('CURRENT_TIMESTAMP')
});

export const magicShelves = sqliteTable('magicshelves', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	icon: text('icon').default('bookmark'),
	iconColor: text('iconColor').default('#6c757d'),
	filterJson: text('filterJson').notNull(), // JSON-encoded filter rules
	sortField: text('sortField').default('title'),
	sortOrder: text('sortOrder').default('asc'),
	isPublic: integer('isPublic', { mode: 'boolean' }).default(false),
	userId: integer('userId').references(() => users.id),
	displayOrder: integer('displayOrder').default(0),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

// ============================================
// BookDrop Tables
// ============================================

export const bookdropQueue = sqliteTable('bookdrop_queue', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('userId').references(() => users.id),
	filename: text('filename').notNull(),
	filePath: text('filePath').notNull(),
	fileSize: integer('fileSize'),
	fileHash: text('fileHash'), // For duplicate detection
	source: text('source').default('upload'), // upload, watched_folder
	status: text('status').default('pending'), // pending, processing, imported, failed, skipped
	bookId: integer('bookId').references(() => books.id), // Link to created book after import
	// Extracted metadata (JSON)
	metadata: text('metadata'),
	// Cover image (stored as base64 or path)
	coverData: text('coverData'),
	// Error info
	errorMessage: text('errorMessage'),
	// Processing timestamps
	processedAt: text('processedAt'),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const bookdropSettings = sqliteTable('bookdrop_settings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('userId').references(() => users.id), // Per-user settings (null = global default)
	folderPath: text('folderPath'),
	enabled: integer('enabled', { mode: 'boolean' }).default(true),
	autoImport: integer('autoImport', { mode: 'boolean' }).default(false), // Preview mode by default
	// After import action: keep, move, delete
	afterImport: text('afterImport').default('move'), // keep, move, delete
	processedFolder: text('processedFolder'), // Where to move after import
	// After skip action: keep, move, delete
	afterSkip: text('afterSkip').default('keep'),
	skippedFolder: text('skippedFolder'),
	// Defaults for imported books
	defaultStatusId: integer('defaultStatusId').references(() => statuses.id),
	defaultFormatId: integer('defaultFormatId').references(() => formats.id),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

// ============================================
// Junction Tables (Many-to-Many)
// ============================================

export const bookAuthors = sqliteTable('bookauthors', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	bookId: integer('bookId').notNull().references(() => books.id, { onDelete: 'cascade' }),
	authorId: integer('authorId').notNull().references(() => authors.id, { onDelete: 'cascade' }),
	role: text('role').default('Author'), // Author, Co-Author, Editor, Translator, Illustrator
	isPrimary: integer('isPrimary', { mode: 'boolean' }).default(false),
	displayOrder: integer('displayOrder').default(0),
	createdAt: text('createdAt').notNull(),
	updatedAt: text('updatedAt').notNull()
});

export const bookSeries = sqliteTable('bookseries', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	bookId: integer('bookId').notNull().references(() => books.id, { onDelete: 'cascade' }),
	seriesId: integer('seriesId').notNull().references(() => series.id, { onDelete: 'cascade' }),
	bookNum: real('bookNum'), // Support decimals like 2.5
	bookNumEnd: integer('bookNumEnd'),
	isPrimary: integer('isPrimary', { mode: 'boolean' }).default(false),
	displayOrder: integer('displayOrder').default(0),
	createdAt: text('createdAt').notNull(),
	updatedAt: text('updatedAt').notNull()
});

export const bookTags = sqliteTable('booktags', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	bookId: integer('bookId').notNull().references(() => books.id, { onDelete: 'cascade' }),
	tagId: integer('tagId').notNull().references(() => tags.id, { onDelete: 'cascade' }),
	createdAt: text('createdAt').notNull(),
	updatedAt: text('updatedAt').notNull()
});

export const seriesTags = sqliteTable('seriestags', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	seriesId: integer('seriesId').notNull().references(() => series.id, { onDelete: 'cascade' }),
	tagId: integer('tagId').notNull().references(() => tags.id, { onDelete: 'cascade' }),
	createdAt: text('createdAt').notNull(),
	updatedAt: text('updatedAt').notNull()
});

// ============================================
// User-Specific Book Data (Public Library Feature)
// ============================================

// User's personal reading data for a book
export const userBooks = sqliteTable('user_books', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	bookId: integer('bookId').notNull().references(() => books.id, { onDelete: 'cascade' }),
	// Reading status (user-specific)
	statusId: integer('statusId').references(() => statuses.id),
	rating: real('rating'),
	// Reading dates
	startReadingDate: text('startReadingDate'),
	completedDate: text('completedDate'),
	// Personal notes
	comments: text('comments'),
	// Reading progress
	readingProgress: real('readingProgress').default(0),
	readingPosition: text('readingPosition'),
	lastReadAt: text('lastReadAt'),
	// DNF tracking
	dnfPage: integer('dnfPage'),
	dnfPercent: integer('dnfPercent'),
	dnfReason: text('dnfReason'),
	dnfDate: text('dnfDate'),
	// When user added book to their library
	addedAt: text('addedAt').default('CURRENT_TIMESTAMP'),
	// Timestamps
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

// User's personal tags on a book
export const userBookTags = sqliteTable('user_book_tags', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	bookId: integer('bookId').notNull().references(() => books.id, { onDelete: 'cascade' }),
	tagId: integer('tagId').notNull().references(() => tags.id, { onDelete: 'cascade' }),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP')
});

// Metadata edit suggestions queue
export const metadataSuggestions = sqliteTable('metadata_suggestions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	bookId: integer('bookId').notNull().references(() => books.id, { onDelete: 'cascade' }),
	userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
	field: text('field').notNull(), // Which field to change
	oldValue: text('oldValue'),
	newValue: text('newValue'),
	status: text('status').default('pending'), // pending, approved, rejected
	reviewedBy: integer('reviewedBy').references(() => users.id),
	reviewedAt: text('reviewedAt'),
	reviewNotes: text('reviewNotes'),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

// Reading sessions for heatmap tracking
export const readingSessions = sqliteTable('reading_sessions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	bookId: integer('bookId').notNull().references(() => books.id, { onDelete: 'cascade' }),
	userId: integer('userId').references(() => users.id, { onDelete: 'cascade' }),
	startedAt: text('startedAt').notNull(), // ISO timestamp when reading started
	endedAt: text('endedAt'), // ISO timestamp when reading ended (null if still active)
	durationMinutes: integer('durationMinutes'), // Calculated duration in minutes
	pagesRead: integer('pagesRead'), // Optional: pages read during session
	startProgress: real('startProgress'), // Progress % when session started
	endProgress: real('endProgress'), // Progress % when session ended
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP')
});

// ============================================
// Relations
// ============================================

export const booksRelations = relations(books, ({ one, many }) => ({
	status: one(statuses, { fields: [books.statusId], references: [statuses.id] }),
	genre: one(genres, { fields: [books.genreId], references: [genres.id] }),
	format: one(formats, { fields: [books.formatId], references: [formats.id] }),
	narrator: one(narrators, { fields: [books.narratorId], references: [narrators.id] }),
	bookAuthors: many(bookAuthors),
	bookSeries: many(bookSeries),
	bookTags: many(bookTags),
	userBooks: many(userBooks),
	userBookTags: many(userBookTags),
	metadataSuggestions: many(metadataSuggestions),
	readingSessions: many(readingSessions)
}));

export const authorsRelations = relations(authors, ({ many }) => ({
	bookAuthors: many(bookAuthors)
}));

export const seriesRelations = relations(series, ({ one, many }) => ({
	status: one(seriesStatuses, { fields: [series.statusId], references: [seriesStatuses.id] }),
	genre: one(genres, { fields: [series.genreId], references: [genres.id] }),
	bookSeries: many(bookSeries),
	seriesTags: many(seriesTags)
}));

export const bookAuthorsRelations = relations(bookAuthors, ({ one }) => ({
	book: one(books, { fields: [bookAuthors.bookId], references: [books.id] }),
	author: one(authors, { fields: [bookAuthors.authorId], references: [authors.id] })
}));

export const bookSeriesRelations = relations(bookSeries, ({ one }) => ({
	book: one(books, { fields: [bookSeries.bookId], references: [books.id] }),
	series: one(series, { fields: [bookSeries.seriesId], references: [series.id] })
}));

export const bookTagsRelations = relations(bookTags, ({ one }) => ({
	book: one(books, { fields: [bookTags.bookId], references: [books.id] }),
	tag: one(tags, { fields: [bookTags.tagId], references: [tags.id] })
}));

export const seriesTagsRelations = relations(seriesTags, ({ one }) => ({
	series: one(series, { fields: [seriesTags.seriesId], references: [series.id] }),
	tag: one(tags, { fields: [seriesTags.tagId], references: [tags.id] })
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	bookTags: many(bookTags),
	seriesTags: many(seriesTags),
	userBookTags: many(userBookTags)
}));

export const usersRelations = relations(users, ({ many }) => ({
	userBooks: many(userBooks),
	userBookTags: many(userBookTags),
	metadataSuggestions: many(metadataSuggestions),
	readingSessions: many(readingSessions)
}));

export const readingSessionsRelations = relations(readingSessions, ({ one }) => ({
	book: one(books, { fields: [readingSessions.bookId], references: [books.id] }),
	user: one(users, { fields: [readingSessions.userId], references: [users.id] })
}));

export const userBooksRelations = relations(userBooks, ({ one }) => ({
	user: one(users, { fields: [userBooks.userId], references: [users.id] }),
	book: one(books, { fields: [userBooks.bookId], references: [books.id] }),
	status: one(statuses, { fields: [userBooks.statusId], references: [statuses.id] })
}));

export const userBookTagsRelations = relations(userBookTags, ({ one }) => ({
	user: one(users, { fields: [userBookTags.userId], references: [users.id] }),
	book: one(books, { fields: [userBookTags.bookId], references: [books.id] }),
	tag: one(tags, { fields: [userBookTags.tagId], references: [tags.id] })
}));

export const metadataSuggestionsRelations = relations(metadataSuggestions, ({ one }) => ({
	book: one(books, { fields: [metadataSuggestions.bookId], references: [books.id] }),
	user: one(users, { fields: [metadataSuggestions.userId], references: [users.id] }),
	reviewer: one(users, { fields: [metadataSuggestions.reviewedBy], references: [users.id] })
}));

// ============================================
// Type exports
// ============================================

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;
export type Status = typeof statuses.$inferSelect;
export type Format = typeof formats.$inferSelect;
export type NewFormat = typeof formats.$inferInsert;
export type Narrator = typeof narrators.$inferSelect;
export type NewNarrator = typeof narrators.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type User = typeof users.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type MagicShelf = typeof magicShelves.$inferSelect;
export type NewMagicShelf = typeof magicShelves.$inferInsert;
export type ReadingGoal = typeof readingGoals.$inferSelect;
export type NewReadingGoal = typeof readingGoals.$inferInsert;
export type BookdropQueueItem = typeof bookdropQueue.$inferSelect;
export type NewBookdropQueueItem = typeof bookdropQueue.$inferInsert;
export type BookdropSettings = typeof bookdropSettings.$inferSelect;
export type NewBookdropSettings = typeof bookdropSettings.$inferInsert;
export type UserBook = typeof userBooks.$inferSelect;
export type NewUserBook = typeof userBooks.$inferInsert;
export type UserBookTag = typeof userBookTags.$inferSelect;
export type NewUserBookTag = typeof userBookTags.$inferInsert;
export type MetadataSuggestion = typeof metadataSuggestions.$inferSelect;
export type NewMetadataSuggestion = typeof metadataSuggestions.$inferInsert;
export type ReadingSession = typeof readingSessions.$inferSelect;
export type NewReadingSession = typeof readingSessions.$inferInsert;

// Library type values
export type LibraryType = 'personal' | 'public';

// User roles
export type UserRole = 'admin' | 'librarian' | 'member' | 'viewer' | 'guest';
