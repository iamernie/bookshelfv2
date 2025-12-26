import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { genres, statuses, books, magicShelves } from '$lib/server/db/schema';
import { sql, eq, count, asc, or, and, ne } from 'drizzle-orm';
import { getAllShelves, getShelfBookCounts } from '$lib/server/services/magicShelfService';

export const load: LayoutServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	// Condition for user's library: personal books OR books user has added from public library
	// This matches what the My Books page shows
	const userLibraryCondition = userId
		? or(
				eq(books.libraryType, 'personal'),
				sql`${books.id} IN (SELECT bookId FROM user_books WHERE userId = ${userId})`
		  )
		: eq(books.libraryType, 'personal');

	// Get genres with book counts (user's library)
	const genresWithCounts = await db
		.select({
			id: genres.id,
			name: genres.name,
			color: genres.color,
			icon: genres.icon,
			bookCount: count(books.id)
		})
		.from(genres)
		.leftJoin(books, and(eq(books.genreId, genres.id), userLibraryCondition))
		.groupBy(genres.id)
		.orderBy(sql`count(${books.id}) DESC`);

	// Get statuses with book counts (user's library)
	const statusesWithCounts = await db
		.select({
			id: statuses.id,
			name: statuses.name,
			key: statuses.key,
			color: statuses.color,
			bookCount: count(books.id)
		})
		.from(statuses)
		.leftJoin(books, and(eq(books.statusId, statuses.id), userLibraryCondition))
		.groupBy(statuses.id)
		.orderBy(statuses.sortOrder);

	// Get total book count (user's library)
	const [{ total }] = await db
		.select({ total: count() })
		.from(books)
		.where(userLibraryCondition);

	// Get magic shelves for the current user
	let magicShelvesData: { id: number; name: string; iconColor: string | null; bookCount: number }[] = [];
	if (locals.user) {
		const shelves = await getAllShelves(locals.user.id);
		if (shelves.length > 0) {
			const counts = await getShelfBookCounts(shelves.map(s => s.id));
			magicShelvesData = shelves.map(shelf => ({
				id: shelf.id,
				name: shelf.name,
				iconColor: shelf.iconColor,
				bookCount: counts.get(shelf.id) || 0
			}));
		}
	}

	return {
		user: locals.user,
		sidebar: {
			genres: genresWithCounts,
			statuses: statusesWithCounts,
			magicShelves: magicShelvesData,
			totalBooks: total,
			isAdmin: locals.user?.role === 'admin'
		}
	};
};
