import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getBookById } from '$lib/server/services/bookService';
import { canManagePublicLibrary } from '$lib/server/services/permissionService';
import { getSimilarBooks } from '$lib/server/services/recommendationService';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(404, 'Book not found');
	}

	const book = await getBookById(id);
	if (!book) {
		throw error(404, 'Book not found');
	}

	// Get similar books for the Similar Books tab
	const similarBooks = await getSimilarBooks(id, 8);

	return {
		book,
		similarBooks,
		canManagePublicLibrary: canManagePublicLibrary(locals.user)
	};
};
