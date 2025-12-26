import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getBookById } from '$lib/server/services/bookService';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(404, 'Book not found');
	}

	const book = await getBookById(id);
	if (!book) {
		throw error(404, 'Book not found');
	}

	return { book };
};
