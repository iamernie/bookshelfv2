import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getNarratorById, updateNarrator, deleteNarrator, getBooksByNarrator } from '$lib/server/services/narratorService';

export const GET: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(400, { message: 'Invalid narrator ID' });
	}

	const narrator = await getNarratorById(id);
	if (!narrator) {
		throw error(404, { message: 'Narrator not found' });
	}

	const books = await getBooksByNarrator(id);

	return json({ narrator, books });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(400, { message: 'Invalid narrator ID' });
	}

	const data = await request.json();

	if (!data.name?.trim()) {
		throw error(400, { message: 'Narrator name is required' });
	}

	const narrator = await updateNarrator(id, {
		name: data.name.trim(),
		bio: data.bio?.trim() || null,
		url: data.url?.trim() || null
	});

	if (!narrator) {
		throw error(404, { message: 'Narrator not found' });
	}

	return json(narrator);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(400, { message: 'Invalid narrator ID' });
	}

	try {
		const deleted = await deleteNarrator(id);
		if (!deleted) {
			throw error(404, { message: 'Narrator not found' });
		}

		return json({ success: true });
	} catch (err) {
		if (err instanceof Error && err.message.includes('Cannot delete narrator')) {
			throw error(400, { message: err.message });
		}
		throw err;
	}
};
