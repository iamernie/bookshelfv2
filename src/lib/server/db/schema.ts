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
	targetGenres: integer('targetGenres'),
	targetAuthors: integer('targetAuthors'),
	targetFormats: integer('targetFormats'),
	targetPages: integer('targetPages'),
	targetMonthly: integer('targetMonthly'),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP'),
	updatedAt: text('updatedAt').default('CURRENT_TIMESTAMP')
});

export const sessions = sqliteTable('sessions', {
	sid: text('sid').primaryKey(),
	expires: text('expires'),
	data: text('data'),
	createdAt: text('createdAt').default('CURRENT_TIMESTAMP')
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
	displayOrder: integer('displayOrder').default(0)
});

export const bookSeries = sqliteTable('bookseries', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	bookId: integer('bookId').notNull().references(() => books.id, { onDelete: 'cascade' }),
	seriesId: integer('seriesId').notNull().references(() => series.id, { onDelete: 'cascade' }),
	bookNum: real('bookNum'), // Support decimals like 2.5
	bookNumEnd: integer('bookNumEnd'),
	isPrimary: integer('isPrimary', { mode: 'boolean' }).default(false),
	displayOrder: integer('displayOrder').default(0)
});

export const bookTags = sqliteTable('booktags', {
	bookId: integer('bookId').notNull().references(() => books.id, { onDelete: 'cascade' }),
	tagId: integer('tagId').notNull().references(() => tags.id, { onDelete: 'cascade' })
}, (table) => ({
	pk: primaryKey({ columns: [table.bookId, table.tagId] })
}));

export const seriesTags = sqliteTable('seriestags', {
	seriesId: integer('seriesId').notNull().references(() => series.id, { onDelete: 'cascade' }),
	tagId: integer('tagId').notNull().references(() => tags.id, { onDelete: 'cascade' })
}, (table) => ({
	pk: primaryKey({ columns: [table.seriesId, table.tagId] })
}));

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
	bookTags: many(bookTags)
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
	seriesTags: many(seriesTags)
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
export type Status = typeof statuses.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type User = typeof users.$inferSelect;
export type Setting = typeof settings.$inferSelect;
