import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, books, authors, bookAuthors, bookSeries, series } from '$lib/server/db';
import { eq, like, desc, asc, sql, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '24');
	const search = url.searchParams.get('q') || '';
	const sort = url.searchParams.get('sort') || 'title';
	const order = url.searchParams.get('order') || 'asc';
	const offset = (page - 1) * limit;

	// Build WHERE conditions
	const conditions = [];
	if (search) {
		conditions.push(like(books.title, `%${search}%`));
	}

	// Apply sorting
	const sortColumn = sort === 'title' ? books.title :
		sort === 'rating' ? books.rating :
		sort === 'createdAt' ? books.createdAt :
		books.title;

	const items = await db
		.select({
			id: books.id,
			title: books.title,
			coverImageUrl: books.coverImageUrl,
			rating: books.rating,
			bookNum: books.bookNum,
			ebookPath: books.ebookPath,
			authorName: authors.name,
			seriesName: series.title
		})
		.from(books)
		.leftJoin(bookAuthors, eq(books.id, bookAuthors.bookId))
		.leftJoin(authors, eq(bookAuthors.authorId, authors.id))
		.leftJoin(bookSeries, eq(books.id, bookSeries.bookId))
		.leftJoin(series, eq(bookSeries.seriesId, series.id))
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.orderBy(order === 'desc' ? desc(sortColumn) : asc(sortColumn))
		.limit(limit)
		.offset(offset);

	// Get total count
	const [{ count: total }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(books);

	return json({
		items,
		page,
		limit,
		total,
		totalPages: Math.ceil(total / limit)
	});
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	// Validate required fields
	if (!data.title?.trim()) {
		throw error(400, { message: 'Title is required' });
	}

	// Insert book
	const [newBook] = await db.insert(books).values({
		title: data.title.trim(),
		summary: data.summary || null,
		rating: data.rating || null,
		coverImageUrl: data.coverImageUrl || null,
		statusId: data.statusId || null,
		genreId: data.genreId || null,
		formatId: data.formatId || null,
		narratorId: data.narratorId || null,
		releaseDate: data.releaseDate || null,
		isbn10: data.isbn10 || null,
		isbn13: data.isbn13 || null,
		asin: data.asin || null,
		pageCount: data.pageCount || null,
		publisher: data.publisher || null,
		publishYear: data.publishYear || null
	}).returning();

	// Add authors if provided
	if (data.authors?.length) {
		await db.insert(bookAuthors).values(
			data.authors.map((author: { id: number; role?: string; isPrimary?: boolean }, index: number) => ({
				bookId: newBook.id,
				authorId: author.id,
				role: author.role || 'Author',
				isPrimary: author.isPrimary || index === 0,
				displayOrder: index
			}))
		);
	}

	// Add series if provided
	if (data.series?.length) {
		await db.insert(bookSeries).values(
			data.series.map((s: { id: number; bookNum?: number; isPrimary?: boolean }, index: number) => ({
				bookId: newBook.id,
				seriesId: s.id,
				bookNum: s.bookNum || null,
				isPrimary: s.isPrimary || index === 0,
				displayOrder: index
			}))
		);
	}

	return json(newBook, { status: 201 });
};
