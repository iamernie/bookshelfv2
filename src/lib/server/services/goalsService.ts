import { db, readingGoals, books, statuses } from '$lib/server/db';
import { eq, and, gte, lt, sql, or } from 'drizzle-orm';
import type { ReadingGoal, NewReadingGoal } from '$lib/server/db/schema';

const STATUS_READ = 'READ';

export interface GoalProgress {
	goal: ReadingGoal;
	booksRead: number;
	progress: number;
	remaining: number;
	paceStatus: 'ahead' | 'behind' | 'on_track';
	paceDiff: number;
	expectedByNow: number;
	monthlyBreakdown: { month: string; count: number }[];
}

export async function getActiveGoal(year?: number, userId?: number): Promise<GoalProgress | null> {
	const targetYear = year || new Date().getFullYear();

	// Get the goal for this year
	const goals = await db
		.select()
		.from(readingGoals)
		.where(and(eq(readingGoals.year, targetYear), eq(readingGoals.isActive, true)))
		.limit(1);

	const goal = goals[0];
	if (!goal) {
		return null;
	}

	// Get READ status ID
	const readStatus = await db
		.select()
		.from(statuses)
		.where(eq(statuses.key, STATUS_READ))
		.limit(1);
	const readStatusId = readStatus[0]?.id;

	// User library condition: personal books OR books user has added from public library
	const userLibraryCondition = userId
		? or(
				eq(books.libraryType, 'personal'),
				sql`${books.id} IN (SELECT bookId FROM user_books WHERE userId = ${userId})`
		  )
		: eq(books.libraryType, 'personal');

	if (!readStatusId) {
		return {
			goal,
			booksRead: 0,
			progress: 0,
			remaining: goal.targetBooks || 0,
			paceStatus: 'behind',
			paceDiff: 0,
			expectedByNow: 0,
			monthlyBreakdown: []
		};
	}

	// Calculate books read this year (in user's library)
	const yearStart = `${targetYear}-01-01`;
	const yearEnd = `${targetYear + 1}-01-01`;

	const booksReadResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(books)
		.where(
			and(
				eq(books.statusId, readStatusId),
				gte(books.completedDate, yearStart),
				lt(books.completedDate, yearEnd),
				userLibraryCondition
			)
		);

	const booksRead = booksReadResult[0]?.count ?? 0;

	// Calculate monthly breakdown (in user's library)
	const monthlyResult = await db
		.select({
			month: sql<string>`strftime('%m', completedDate)`,
			count: sql<number>`count(*)`
		})
		.from(books)
		.where(
			and(
				eq(books.statusId, readStatusId),
				gte(books.completedDate, yearStart),
				lt(books.completedDate, yearEnd),
				userLibraryCondition
			)
		)
		.groupBy(sql`strftime('%m', completedDate)`);

	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const monthlyBreakdown = monthNames.map((name, i) => {
		const monthNum = String(i + 1).padStart(2, '0');
		const data = monthlyResult.find((m) => m.month === monthNum);
		return { month: name, count: data?.count ?? 0 };
	});

	// Calculate progress
	const targetBooks = goal.targetBooks || 12;
	const progress = targetBooks > 0 ? Math.round((booksRead / targetBooks) * 100) : 0;
	const remaining = Math.max(0, targetBooks - booksRead);

	// Calculate pace
	const now = new Date();
	const isCurrentYear = targetYear === now.getFullYear();
	let expectedByNow = 0;
	let paceStatus: 'ahead' | 'behind' | 'on_track' = 'on_track';
	let paceDiff = 0;

	if (isCurrentYear) {
		const dayOfYear = Math.floor(
			(now.getTime() - new Date(targetYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24)
		);
		const daysInYear = targetYear % 4 === 0 ? 366 : 365;
		expectedByNow = Math.floor((targetBooks * dayOfYear) / daysInYear);
		paceDiff = Math.abs(booksRead - expectedByNow);

		if (booksRead > expectedByNow) {
			paceStatus = 'ahead';
		} else if (booksRead < expectedByNow) {
			paceStatus = 'behind';
		}
	} else {
		// Past year - compare final result
		expectedByNow = targetBooks;
		paceDiff = Math.abs(booksRead - targetBooks);
		paceStatus = booksRead >= targetBooks ? 'ahead' : 'behind';
	}

	return {
		goal,
		booksRead,
		progress: Math.min(progress, 100),
		remaining,
		paceStatus,
		paceDiff,
		expectedByNow,
		monthlyBreakdown
	};
}

export async function getAllGoals(): Promise<ReadingGoal[]> {
	return db.select().from(readingGoals).orderBy(sql`year DESC`);
}

export async function getGoalById(id: number): Promise<ReadingGoal | null> {
	const goals = await db.select().from(readingGoals).where(eq(readingGoals.id, id)).limit(1);
	return goals[0] || null;
}

export async function createGoal(data: NewReadingGoal): Promise<ReadingGoal> {
	const now = new Date().toISOString();
	const result = await db.insert(readingGoals).values({
		...data,
		createdAt: now,
		updatedAt: now
	}).returning();
	return result[0];
}

export async function updateGoal(
	id: number,
	data: Partial<NewReadingGoal>
): Promise<ReadingGoal | null> {
	const now = new Date().toISOString();
	const result = await db
		.update(readingGoals)
		.set({ ...data, updatedAt: now })
		.where(eq(readingGoals.id, id))
		.returning();
	return result[0] || null;
}

export async function deleteGoal(id: number): Promise<boolean> {
	const result = await db.delete(readingGoals).where(eq(readingGoals.id, id));
	return result.changes > 0;
}

export async function getOrCreateCurrentYearGoal(): Promise<ReadingGoal> {
	const currentYear = new Date().getFullYear();

	// Check if goal exists for current year
	const existing = await db
		.select()
		.from(readingGoals)
		.where(eq(readingGoals.year, currentYear))
		.limit(1);

	if (existing[0]) {
		return existing[0];
	}

	// Create a new goal
	return createGoal({
		year: currentYear,
		targetBooks: 12,
		isActive: true
	});
}
