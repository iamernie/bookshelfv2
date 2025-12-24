import type { PageServerLoad } from './$types';
import { db, books, authors, series, statuses } from '$lib/server/db';
import { eq, desc, count, and, sql } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Get stats
	const [totalBooksResult] = await db.select({ count: count() }).from(books);
	const [totalAuthorsResult] = await db.select({ count: count() }).from(authors);
	const [totalSeriesResult] = await db.select({ count: count() }).from(series);

	// Get current year read count
	const currentYear = new Date().getFullYear();
	const [readThisYearResult] = await db
		.select({ count: count() })
		.from(books)
		.innerJoin(statuses, eq(books.statusId, statuses.id))
		.where(
			and(
				eq(statuses.key, 'READ'),
				sql`strftime('%Y', ${books.completedDate}) = ${currentYear.toString()}`
			)
		);

	// Get currently reading books
	const currentlyReading = await db
		.select({
			id: books.id,
			title: books.title,
			coverImageUrl: books.coverImageUrl
		})
		.from(books)
		.innerJoin(statuses, eq(books.statusId, statuses.id))
		.where(eq(statuses.key, 'CURRENT'))
		.limit(6);

	// Get recently added books
	const recentlyAdded = await db
		.select({
			id: books.id,
			title: books.title,
			coverImageUrl: books.coverImageUrl
		})
		.from(books)
		.orderBy(desc(books.createdAt))
		.limit(6);

	return {
		stats: {
			totalBooks: totalBooksResult?.count ?? 0,
			totalAuthors: totalAuthorsResult?.count ?? 0,
			totalSeries: totalSeriesResult?.count ?? 0,
			readThisYear: readThisYearResult?.count ?? 0
		},
		currentlyReading,
		recentlyAdded
	};
};
