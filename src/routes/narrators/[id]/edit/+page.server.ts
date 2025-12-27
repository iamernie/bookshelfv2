import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getNarratorById, getBooksByNarrator } from '$lib/server/services/narratorService';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(404, 'Narrator not found');
	}

	const narrator = await getNarratorById(id, locals.user?.id);
	if (!narrator) {
		throw error(404, 'Narrator not found');
	}

	const books = await getBooksByNarrator(id, locals.user?.id);

	return {
		narrator,
		books
	};
};
