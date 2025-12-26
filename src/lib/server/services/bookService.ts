import { db, books, bookAuthors, bookSeries, bookTags, authors, series, statuses, genres, formats, narrators, tags } from '$lib/server/db';
import { eq, like, sql, desc, asc, and, or, inArray } from 'drizzle-orm';
import type { Book, NewBook } from '$lib/server/db/schema';

export interface BookWithRelations extends Book {
	authors: { id: number; name: string; role: string | null; isPrimary: boolean | null }[];
	series: { id: number; title: string; bookNum: number | null; bookNumEnd: number | null }[];
	tags: { id: number; name: string; color: string | null; icon: string | null }[];
	status: { id: number; name: string; color: string | null; icon: string | null } | null;
	genre: { id: number; name: string } | null;
	format: { id: number; name: string } | null;
	narrator: { id: number; name: string } | null;
}

export interface GetBooksOptions {
	page?: number;
	limit?: number;
	search?: string;
	statusId?: number;
	genreId?: number;
	formatId?: number;
	tagId?: number;
	authorId?: number;
	seriesId?: number;
	sort?: 'title' | 'createdAt' | 'rating' | 'completedDate' | 'series' | 'status' | 'format' | 'genre';
	order?: 'asc' | 'desc';
	libraryType?: 'personal' | 'public' | 'all';
	userId?: number; // When provided with libraryType='personal', includes books user added from public library
}

export async function getBooks(options: GetBooksOptions = {}): Promise<{
	items: BookWithRelations[];
	total: number;
	page: number;
	limit: number;
}> {
	const { page = 1, limit = 24, search, statusId, genreId, formatId, tagId, authorId, seriesId, sort = 'createdAt', order = 'desc', libraryType = 'personal', userId } = options;
	const offset = (page - 1) * limit;

	// Build where conditions
	const conditions = [];

	// Filter by library type
	// When libraryType='personal' and userId is provided, show:
	//   - Books with libraryType='personal'
	//   - OR books that are in the user's library (user_books table)
	if (libraryType === 'personal' && userId) {
		conditions.push(
			or(
				eq(books.libraryType, 'personal'),
				sql`${books.id} IN (SELECT bookId FROM user_books WHERE userId = ${userId})`
			)
		);
	} else if (libraryType !== 'all') {
		conditions.push(eq(books.libraryType, libraryType));
	}

	if (search) {
		conditions.push(like(books.title, `%${search}%`));
	}
	if (statusId) {
		conditions.push(eq(books.statusId, statusId));
	}
	if (genreId) {
		conditions.push(eq(books.genreId, genreId));
	}
	if (formatId) {
		conditions.push(eq(books.formatId, formatId));
	}
	if (tagId) {
		const bookIds = await db
			.select({ bookId: bookTags.bookId })
			.from(bookTags)
			.where(eq(bookTags.tagId, tagId));
		if (bookIds.length > 0) {
			conditions.push(inArray(books.id, bookIds.map(b => b.bookId)));
		} else {
			return { items: [], total: 0, page, limit };
		}
	}
	if (authorId) {
		const bookIds = await db
			.select({ bookId: bookAuthors.bookId })
			.from(bookAuthors)
			.where(eq(bookAuthors.authorId, authorId));
		if (bookIds.length > 0) {
			conditions.push(inArray(books.id, bookIds.map(b => b.bookId)));
		} else {
			return { items: [], total: 0, page, limit };
		}
	}
	if (seriesId) {
		const bookIds = await db
			.select({ bookId: bookSeries.bookId })
			.from(bookSeries)
			.where(eq(bookSeries.seriesId, seriesId));
		if (bookIds.length > 0) {
			conditions.push(inArray(books.id, bookIds.map(b => b.bookId)));
		} else {
			return { items: [], total: 0, page, limit };
		}
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// Get total count
	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(books)
		.where(whereClause);
	const total = countResult[0]?.count ?? 0;

	// Get books with sorting
	const orderDir = order === 'asc' ? asc : desc;

	// For related field sorting, we need subqueries
	let orderExpression;
	switch (sort) {
		case 'title':
			orderExpression = orderDir(books.title);
			break;
		case 'rating':
			orderExpression = orderDir(books.rating);
			break;
		case 'completedDate':
			orderExpression = orderDir(books.completedDate);
			break;
		case 'series':
			// Sort by primary series title (via subquery)
			orderExpression = orderDir(sql`(
				SELECT s.title FROM bookseries bs
				JOIN series s ON bs.seriesId = s.id
				WHERE bs.bookId = books.id AND bs.isPrimary = 1
				LIMIT 1
			)`);
			break;
		case 'status':
			// Sort by status name (via subquery)
			orderExpression = orderDir(sql`(
				SELECT st.name FROM statuses st
				WHERE st.id = books.statusId
			)`);
			break;
		case 'format':
			// Sort by format name (via subquery)
			orderExpression = orderDir(sql`(
				SELECT f.name FROM formats f
				WHERE f.id = books.formatId
			)`);
			break;
		case 'genre':
			// Sort by genre name (via subquery)
			orderExpression = orderDir(sql`(
				SELECT g.name FROM genres g
				WHERE g.id = books.genreId
			)`);
			break;
		default:
			orderExpression = orderDir(books.createdAt);
	}

	const booksList = await db
		.select()
		.from(books)
		.where(whereClause)
		.orderBy(orderExpression)
		.limit(limit)
		.offset(offset);

	// Fetch relations for each book
	const items = await Promise.all(booksList.map(async (book) => {
		const [bookAuthorsData, bookSeriesData, bookTagsData, statusData, genreData, formatData, narratorData] = await Promise.all([
			db.select({
				id: authors.id,
				name: authors.name,
				role: bookAuthors.role,
				isPrimary: bookAuthors.isPrimary
			}).from(bookAuthors)
				.innerJoin(authors, eq(bookAuthors.authorId, authors.id))
				.where(eq(bookAuthors.bookId, book.id)),
			db.select({
				id: series.id,
				title: series.title,
				bookNum: bookSeries.bookNum,
				bookNumEnd: bookSeries.bookNumEnd
			}).from(bookSeries)
				.innerJoin(series, eq(bookSeries.seriesId, series.id))
				.where(eq(bookSeries.bookId, book.id)),
			db.select({
				id: tags.id,
				name: tags.name,
				color: tags.color,
				icon: tags.icon
			}).from(bookTags)
				.innerJoin(tags, eq(bookTags.tagId, tags.id))
				.where(eq(bookTags.bookId, book.id)),
			book.statusId ? db.select().from(statuses).where(eq(statuses.id, book.statusId)).limit(1) : Promise.resolve([]),
			book.genreId ? db.select().from(genres).where(eq(genres.id, book.genreId)).limit(1) : Promise.resolve([]),
			book.formatId ? db.select().from(formats).where(eq(formats.id, book.formatId)).limit(1) : Promise.resolve([]),
			book.narratorId ? db.select().from(narrators).where(eq(narrators.id, book.narratorId)).limit(1) : Promise.resolve([])
		]);

		return {
			...book,
			authors: bookAuthorsData,
			series: bookSeriesData,
			tags: bookTagsData,
			status: statusData[0] ? { id: statusData[0].id, name: statusData[0].name, color: statusData[0].color, icon: statusData[0].icon } : null,
			genre: genreData[0] ? { id: genreData[0].id, name: genreData[0].name } : null,
			format: formatData[0] ? { id: formatData[0].id, name: formatData[0].name } : null,
			narrator: narratorData[0] ? { id: narratorData[0].id, name: narratorData[0].name } : null
		};
	}));

	return { items, total, page, limit };
}

export async function getBookById(id: number): Promise<BookWithRelations | null> {
	const book = await db.select().from(books).where(eq(books.id, id)).limit(1);
	if (!book[0]) return null;

	const [bookAuthorsData, bookSeriesData, bookTagsData, statusData, genreData, formatData, narratorData] = await Promise.all([
		db.select({
			id: authors.id,
			name: authors.name,
			role: bookAuthors.role,
			isPrimary: bookAuthors.isPrimary
		}).from(bookAuthors)
			.innerJoin(authors, eq(bookAuthors.authorId, authors.id))
			.where(eq(bookAuthors.bookId, id)),
		db.select({
			id: series.id,
			title: series.title,
			bookNum: bookSeries.bookNum,
			bookNumEnd: bookSeries.bookNumEnd
		}).from(bookSeries)
			.innerJoin(series, eq(bookSeries.seriesId, series.id))
			.where(eq(bookSeries.bookId, id)),
		db.select({
			id: tags.id,
			name: tags.name,
			color: tags.color,
			icon: tags.icon
		}).from(bookTags)
			.innerJoin(tags, eq(bookTags.tagId, tags.id))
			.where(eq(bookTags.bookId, id)),
		book[0].statusId ? db.select().from(statuses).where(eq(statuses.id, book[0].statusId)).limit(1) : Promise.resolve([]),
		book[0].genreId ? db.select().from(genres).where(eq(genres.id, book[0].genreId)).limit(1) : Promise.resolve([]),
		book[0].formatId ? db.select().from(formats).where(eq(formats.id, book[0].formatId)).limit(1) : Promise.resolve([]),
		book[0].narratorId ? db.select().from(narrators).where(eq(narrators.id, book[0].narratorId)).limit(1) : Promise.resolve([])
	]);

	return {
		...book[0],
		authors: bookAuthorsData,
		series: bookSeriesData,
		tags: bookTagsData,
		status: statusData[0] ? { id: statusData[0].id, name: statusData[0].name, color: statusData[0].color, icon: statusData[0].icon } : null,
		genre: genreData[0] ? { id: genreData[0].id, name: genreData[0].name } : null,
		format: formatData[0] ? { id: formatData[0].id, name: formatData[0].name } : null,
		narrator: narratorData[0] ? { id: narratorData[0].id, name: narratorData[0].name } : null
	};
}

export interface CreateBookData extends Omit<NewBook, 'createdAt' | 'updatedAt'> {
	authors?: { id: number; role?: string; isPrimary?: boolean }[];
	series?: { id: number; bookNum?: number; bookNumEnd?: number }[];
	tagIds?: number[];
}

export async function createBook(data: CreateBookData): Promise<Book> {
	const now = new Date().toISOString();
	const { authors: bookAuthorsList, series: bookSeriesList, tagIds, ...bookData } = data;

	const [newBook] = await db
		.insert(books)
		.values({
			...bookData,
			createdAt: now,
			updatedAt: now
		})
		.returning();

	// Insert author relations
	if (bookAuthorsList && bookAuthorsList.length > 0) {
		await db.insert(bookAuthors).values(
			bookAuthorsList.map((a, index) => ({
				bookId: newBook.id,
				authorId: a.id,
				role: a.role || 'Author',
				isPrimary: a.isPrimary ?? index === 0,
				displayOrder: index,
				createdAt: now,
				updatedAt: now
			}))
		);
	}

	// Insert series relations
	if (bookSeriesList && bookSeriesList.length > 0) {
		await db.insert(bookSeries).values(
			bookSeriesList.map((s, index) => ({
				bookId: newBook.id,
				seriesId: s.id,
				bookNum: s.bookNum ?? null,
				bookNumEnd: s.bookNumEnd ?? null,
				isPrimary: index === 0,
				displayOrder: index,
				createdAt: now,
				updatedAt: now
			}))
		);
	}

	// Insert tag relations
	if (tagIds && tagIds.length > 0) {
		await db.insert(bookTags).values(
			tagIds.map(tagId => ({
				bookId: newBook.id,
				tagId,
				createdAt: now,
				updatedAt: now
			}))
		);
	}

	return newBook;
}

export async function updateBook(id: number, data: Partial<CreateBookData>): Promise<Book | null> {
	const now = new Date().toISOString();
	const { authors: bookAuthorsList, series: bookSeriesList, tagIds, ...bookData } = data;

	const [updated] = await db
		.update(books)
		.set({
			...bookData,
			updatedAt: now
		})
		.where(eq(books.id, id))
		.returning();

	if (!updated) return null;

	// Update author relations if provided
	if (bookAuthorsList !== undefined) {
		await db.delete(bookAuthors).where(eq(bookAuthors.bookId, id));
		if (bookAuthorsList.length > 0) {
			await db.insert(bookAuthors).values(
				bookAuthorsList.map((a, index) => ({
					bookId: id,
					authorId: a.id,
					role: a.role || 'Author',
					isPrimary: a.isPrimary ?? index === 0,
					displayOrder: index,
					createdAt: now,
					updatedAt: now
				}))
			);
		}
	}

	// Update series relations if provided
	if (bookSeriesList !== undefined) {
		await db.delete(bookSeries).where(eq(bookSeries.bookId, id));
		if (bookSeriesList.length > 0) {
			await db.insert(bookSeries).values(
				bookSeriesList.map((s, index) => ({
					bookId: id,
					seriesId: s.id,
					bookNum: s.bookNum ?? null,
					bookNumEnd: s.bookNumEnd ?? null,
					isPrimary: index === 0,
					displayOrder: index,
					createdAt: now,
					updatedAt: now
				}))
			);
		}
	}

	// Update tag relations if provided
	if (tagIds !== undefined) {
		await db.delete(bookTags).where(eq(bookTags.bookId, id));
		if (tagIds.length > 0) {
			await db.insert(bookTags).values(
				tagIds.map(tagId => ({
					bookId: id,
					tagId,
					createdAt: now,
					updatedAt: now
				}))
			);
		}
	}

	return updated;
}

export async function deleteBook(id: number): Promise<boolean> {
	const result = await db.delete(books).where(eq(books.id, id));
	return result.changes > 0;
}

// Helper functions to get dropdown options
export async function getStatuses() {
	return db.select().from(statuses).orderBy(asc(statuses.sortOrder));
}

export async function getGenres() {
	return db.select().from(genres).orderBy(asc(genres.name));
}

export async function getFormats() {
	return db.select().from(formats).orderBy(asc(formats.name));
}

export async function getNarrators() {
	return db.select().from(narrators).orderBy(asc(narrators.name));
}

export async function getTags() {
	return db.select().from(tags).orderBy(asc(tags.name));
}

export async function getAllAuthors() {
	return db.select({ id: authors.id, name: authors.name }).from(authors).orderBy(asc(authors.name));
}

export async function getAllSeries() {
	return db.select({ id: series.id, title: series.title }).from(series).orderBy(asc(series.title));
}

/**
 * Fetch full BookCardData for a list of book IDs.
 * Used by entity detail pages (authors, series, shelves) to display rich book information.
 */
export async function getBooksCardData(bookIds: number[]): Promise<{
	id: number;
	title: string;
	coverImageUrl: string | null;
	rating: number | null;
	bookNum: number | null;
	ebookPath: string | null;
	authorName: string | null;
	seriesName: string | null;
	summary: string | null;
	completedDate: string | null;
	status: { id: number; name: string; color: string | null; icon: string | null } | null;
	genre: { id: number; name: string } | null;
	format: { id: number; name: string } | null;
	tags: { id: number; name: string; color: string | null; icon: string | null }[];
}[]> {
	if (bookIds.length === 0) return [];

	// Get base book data
	const booksList = await db
		.select()
		.from(books)
		.where(inArray(books.id, bookIds));

	// Fetch relations for each book in parallel
	const results = await Promise.all(booksList.map(async (book) => {
		const [bookAuthorsData, bookSeriesData, bookTagsData, statusData, genreData, formatData] = await Promise.all([
			db.select({
				id: authors.id,
				name: authors.name,
				isPrimary: bookAuthors.isPrimary
			}).from(bookAuthors)
				.innerJoin(authors, eq(bookAuthors.authorId, authors.id))
				.where(eq(bookAuthors.bookId, book.id))
				.orderBy(desc(bookAuthors.isPrimary), asc(bookAuthors.displayOrder)),
			db.select({
				id: series.id,
				title: series.title,
				bookNum: bookSeries.bookNum,
				isPrimary: bookSeries.isPrimary
			}).from(bookSeries)
				.innerJoin(series, eq(bookSeries.seriesId, series.id))
				.where(eq(bookSeries.bookId, book.id))
				.orderBy(desc(bookSeries.isPrimary), asc(bookSeries.displayOrder)),
			db.select({
				id: tags.id,
				name: tags.name,
				color: tags.color,
				icon: tags.icon
			}).from(bookTags)
				.innerJoin(tags, eq(bookTags.tagId, tags.id))
				.where(eq(bookTags.bookId, book.id)),
			book.statusId ? db.select().from(statuses).where(eq(statuses.id, book.statusId)).limit(1) : Promise.resolve([]),
			book.genreId ? db.select().from(genres).where(eq(genres.id, book.genreId)).limit(1) : Promise.resolve([]),
			book.formatId ? db.select().from(formats).where(eq(formats.id, book.formatId)).limit(1) : Promise.resolve([])
		]);

		// Get primary author and series
		const primaryAuthor = bookAuthorsData.find(a => a.isPrimary) || bookAuthorsData[0];
		const primarySeries = bookSeriesData.find(s => s.isPrimary) || bookSeriesData[0];

		return {
			id: book.id,
			title: book.title,
			coverImageUrl: book.coverImageUrl,
			rating: book.rating,
			bookNum: primarySeries?.bookNum ?? null,
			ebookPath: book.ebookPath,
			authorName: primaryAuthor?.name ?? null,
			seriesName: primarySeries?.title ?? null,
			summary: book.summary,
			completedDate: book.completedDate,
			status: statusData[0] ? { id: statusData[0].id, name: statusData[0].name, color: statusData[0].color, icon: statusData[0].icon } : null,
			genre: genreData[0] ? { id: genreData[0].id, name: genreData[0].name } : null,
			format: formatData[0] ? { id: formatData[0].id, name: formatData[0].name } : null,
			tags: bookTagsData
		};
	}));

	// Maintain original order from bookIds
	const bookMap = new Map(results.map(b => [b.id, b]));
	return bookIds.map(id => bookMap.get(id)!).filter(Boolean);
}
