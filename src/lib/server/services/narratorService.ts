import { db, narrators, books } from '$lib/server/db';
import { eq, like, asc, desc, sql, and, or } from 'drizzle-orm';

// Infer Narrator type from schema
type NarratorType = typeof narrators.$inferSelect;

export interface NarratorWithStats extends NarratorType {
	bookCount: number;
	avgRating: number | null;
}

export interface GetNarratorsOptions {
	page?: number;
	limit?: number;
	search?: string;
	sort?: 'name' | 'createdAt' | 'bookCount';
	order?: 'asc' | 'desc';
	userId?: number; // Filter stats to user's library
}

export async function getNarrators(options: GetNarratorsOptions = {}): Promise<{
	items: NarratorWithStats[];
	total: number;
	page: number;
	limit: number;
}> {
	const { page = 1, limit = 50, search, sort = 'name', order = 'asc', userId } = options;
	const offset = (page - 1) * limit;

	// User library condition: personal books OR books user has added from public library
	const userLibraryCondition = userId
		? or(
				eq(books.libraryType, 'personal'),
				sql`${books.id} IN (SELECT bookId FROM user_books WHERE userId = ${userId})`
		  )
		: eq(books.libraryType, 'personal');

	const whereClause = search ? like(narrators.name, `%${search}%`) : undefined;

	// Get total count
	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(narrators)
		.where(whereClause);
	const total = countResult[0]?.count ?? 0;

	// Get narrators
	const orderDir = order === 'asc' ? asc : desc;
	const orderColumn = sort === 'createdAt' ? narrators.createdAt : narrators.name;

	const narratorsList = await db
		.select()
		.from(narrators)
		.where(whereClause)
		.orderBy(orderDir(orderColumn))
		.limit(limit)
		.offset(offset);

	// Get book counts and avg ratings for each narrator (filtered by user's library)
	const items = await Promise.all(
		narratorsList.map(async (narrator) => {
			const statsResult = await db
				.select({
					count: sql<number>`count(*)`,
					avgRating: sql<number>`avg(CASE WHEN ${books.rating} > 0 THEN ${books.rating} ELSE NULL END)`
				})
				.from(books)
				.where(and(eq(books.narratorId, narrator.id), userLibraryCondition));

			return {
				...narrator,
				bookCount: statsResult[0]?.count ?? 0,
				avgRating: statsResult[0]?.avgRating ? parseFloat(statsResult[0].avgRating.toFixed(1)) : null
			};
		})
	);

	// If sorting by bookCount, sort after fetching
	if (sort === 'bookCount') {
		items.sort((a, b) => {
			const diff = a.bookCount - b.bookCount;
			return order === 'asc' ? diff : -diff;
		});
	}

	return { items, total, page, limit };
}

export async function getNarratorById(id: number, userId?: number): Promise<NarratorWithStats | null> {
	const narrator = await db.select().from(narrators).where(eq(narrators.id, id)).limit(1);
	if (!narrator[0]) return null;

	// User library condition
	const userLibraryCondition = userId
		? or(
				eq(books.libraryType, 'personal'),
				sql`${books.id} IN (SELECT bookId FROM user_books WHERE userId = ${userId})`
		  )
		: eq(books.libraryType, 'personal');

	const statsResult = await db
		.select({
			count: sql<number>`count(*)`,
			avgRating: sql<number>`avg(CASE WHEN ${books.rating} > 0 THEN ${books.rating} ELSE NULL END)`
		})
		.from(books)
		.where(and(eq(books.narratorId, id), userLibraryCondition));

	return {
		...narrator[0],
		bookCount: statsResult[0]?.count ?? 0,
		avgRating: statsResult[0]?.avgRating ? parseFloat(statsResult[0].avgRating.toFixed(1)) : null
	};
}

export async function getNarratorByName(name: string): Promise<NarratorType | null> {
	const narrator = await db.select().from(narrators).where(eq(narrators.name, name)).limit(1);
	return narrator[0] || null;
}

export interface CreateNarratorData {
	name: string;
	bio?: string | null;
	url?: string | null;
}

export async function createNarrator(data: CreateNarratorData): Promise<NarratorType> {
	const now = new Date().toISOString();

	const [newNarrator] = await db
		.insert(narrators)
		.values({
			name: data.name,
			bio: data.bio || null,
			url: data.url || null,
			createdAt: now,
			updatedAt: now
		})
		.returning();

	return newNarrator;
}

export async function updateNarrator(id: number, data: Partial<CreateNarratorData>): Promise<NarratorType | null> {
	const now = new Date().toISOString();

	const updateData: Record<string, unknown> = { updatedAt: now };
	if (data.name !== undefined) updateData.name = data.name;
	if (data.bio !== undefined) updateData.bio = data.bio;
	if (data.url !== undefined) updateData.url = data.url;

	const [updated] = await db
		.update(narrators)
		.set(updateData)
		.where(eq(narrators.id, id))
		.returning();

	return updated || null;
}

export async function deleteNarrator(id: number): Promise<boolean> {
	// Check if any books are using this narrator
	const bookCount = await db
		.select({ count: sql<number>`count(*)` })
		.from(books)
		.where(eq(books.narratorId, id));

	if (bookCount[0]?.count > 0) {
		throw new Error(`Cannot delete narrator: ${bookCount[0].count} book(s) assigned. Please reassign or delete books first.`);
	}

	const result = await db.delete(narrators).where(eq(narrators.id, id));
	return result.changes > 0;
}

// Get books by a narrator (filtered by user's library)
export async function getBooksByNarrator(narratorId: number, userId?: number): Promise<{ id: number; title: string; coverImageUrl: string | null; rating: number | null }[]> {
	// User library condition
	const userLibraryCondition = userId
		? or(
				eq(books.libraryType, 'personal'),
				sql`${books.id} IN (SELECT bookId FROM user_books WHERE userId = ${userId})`
		  )
		: eq(books.libraryType, 'personal');

	return db
		.select({
			id: books.id,
			title: books.title,
			coverImageUrl: books.coverImageUrl,
			rating: books.rating
		})
		.from(books)
		.where(and(eq(books.narratorId, narratorId), userLibraryCondition))
		.orderBy(asc(books.title));
}

// Get all narrators for dropdowns
export async function getAllNarrators(): Promise<{ id: number; name: string }[]> {
	return db
		.select({
			id: narrators.id,
			name: narrators.name
		})
		.from(narrators)
		.orderBy(asc(narrators.name));
}
