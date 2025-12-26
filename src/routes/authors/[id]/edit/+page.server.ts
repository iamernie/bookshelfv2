import type { PageServerLoad } from './$types';
import { getAuthorWithBooks } from '$lib/server/services/authorService';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(400, 'Invalid author ID');
	}

	const result = await getAuthorWithBooks(id);
	if (!result) {
		throw error(404, 'Author not found');
	}

	return {
		author: result.author,
		books: result.books,
		series: result.series
	};
};
