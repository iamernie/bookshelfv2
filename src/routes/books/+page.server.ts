import type { PageServerLoad } from './$types';
import { db, books, authors, series, bookAuthors, bookSeries } from '$lib/server/db';
import { eq, desc, sql, asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '24');
	const offset = (page - 1) * limit;

	// Get books with author names
	const booksWithAuthors = await db
		.select({
			id: books.id,
			title: books.title,
			coverImageUrl: books.coverImageUrl,
			rating: books.rating,
			bookNum: books.bookNum,
			ebookPath: books.ebookPath,
			summary: books.summary,
			authorName: authors.name,
			seriesName: series.title
		})
		.from(books)
		.leftJoin(bookAuthors, eq(books.id, bookAuthors.bookId))
		.leftJoin(authors, eq(bookAuthors.authorId, authors.id))
		.leftJoin(bookSeries, eq(books.id, bookSeries.bookId))
		.leftJoin(series, eq(bookSeries.seriesId, series.id))
		.orderBy(asc(books.title))
		.limit(limit)
		.offset(offset);

	// Get total count
	const [{ count: totalBooks }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(books);

	return {
		books: booksWithAuthors,
		currentPage: page,
		totalPages: Math.ceil(totalBooks / limit),
		totalBooks
	};
};
