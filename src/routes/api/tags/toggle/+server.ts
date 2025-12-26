import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleBookTag, toggleSeriesTag } from '$lib/server/services/tagService';

// Toggle a tag on a book or series
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const data = await request.json();

	if (!data.tagId) {
		throw error(400, { message: 'Tag ID is required' });
	}

	if (!data.bookId && !data.seriesId) {
		throw error(400, { message: 'Either bookId or seriesId is required' });
	}

	if (data.bookId && data.seriesId) {
		throw error(400, { message: 'Cannot specify both bookId and seriesId' });
	}

	const tagId = parseInt(data.tagId);
	if (isNaN(tagId)) {
		throw error(400, { message: 'Invalid tag ID' });
	}

	if (data.bookId) {
		const bookId = parseInt(data.bookId);
		if (isNaN(bookId)) {
			throw error(400, { message: 'Invalid book ID' });
		}
		const result = await toggleBookTag(bookId, tagId);
		return json({ success: true, ...result });
	}

	if (data.seriesId) {
		const seriesId = parseInt(data.seriesId);
		if (isNaN(seriesId)) {
			throw error(400, { message: 'Invalid series ID' });
		}
		const result = await toggleSeriesTag(seriesId, tagId);
		return json({ success: true, ...result });
	}

	throw error(400, { message: 'Invalid request' });
};
