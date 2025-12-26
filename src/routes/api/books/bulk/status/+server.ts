import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, books } from '$lib/server/db';
import { eq, inArray } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const body = await request.json();
	const { bookIds, statusId } = body;

	if (!Array.isArray(bookIds) || bookIds.length === 0) {
		throw error(400, 'bookIds must be a non-empty array');
	}

	if (typeof statusId !== 'number') {
		throw error(400, 'statusId must be a number');
	}

	const now = new Date().toISOString();

	// Update all books in one query
	await db
		.update(books)
		.set({
			statusId,
			updatedAt: now
		})
		.where(inArray(books.id, bookIds));

	return json({
		success: true,
		updated: bookIds.length,
		message: `Status updated for ${bookIds.length} book(s)`
	});
};
