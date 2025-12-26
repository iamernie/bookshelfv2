import type { PageServerLoad } from './$types';
import { db, books, authors, series, statuses } from '$lib/server/db';
import { eq, desc, count, and, sql, or } from 'drizzle-orm';
import { getBooksCardData } from '$lib/server/services/bookService';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	// Build user library condition
	const userLibraryCondition = userId
		? or(
				eq(books.libraryType, 'personal'),
				sql`${books.id} IN (SELECT bookId FROM user_books WHERE userId = ${userId})`
		  )
		: eq(books.libraryType, 'personal');

	// Get stats (filtered by user's library)
	const [totalBooksResult] = await db
		.select({ count: count() })
		.from(books)
		.where(userLibraryCondition);
	const [totalAuthorsResult] = await db.select({ count: count() }).from(authors);
	const [totalSeriesResult] = await db.select({ count: count() }).from(series);

	// Get current year read count (filtered by user's library)
	const currentYear = new Date().getFullYear();
	const [readThisYearResult] = await db
		.select({ count: count() })
		.from(books)
		.innerJoin(statuses, eq(books.statusId, statuses.id))
		.where(
			and(
				eq(statuses.key, 'READ'),
				sql`strftime('%Y', ${books.completedDate}) = ${currentYear.toString()}`,
				userLibraryCondition
			)
		);

	// Get currently reading book IDs (filtered by user's library)
	const currentlyReadingIds = await db
		.select({ id: books.id })
		.from(books)
		.innerJoin(statuses, eq(books.statusId, statuses.id))
		.where(and(eq(statuses.key, 'CURRENT'), userLibraryCondition))
		.limit(6);

	// Get recently added book IDs (filtered by user's library)
	const recentlyAddedIds = await db
		.select({ id: books.id })
		.from(books)
		.where(userLibraryCondition)
		.orderBy(desc(books.createdAt))
		.limit(6);

	// Fetch full BookCardData for both lists
	const [currentlyReading, recentlyAdded] = await Promise.all([
		getBooksCardData(currentlyReadingIds.map((b) => b.id)),
		getBooksCardData(recentlyAddedIds.map((b) => b.id))
	]);

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
