import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(302, '/login');
	}

	// Check if we're linking to a book - redirect to book edit page
	const bookIdParam = url.searchParams.get('bookId');
	if (bookIdParam) {
		const bookId = parseInt(bookIdParam);
		if (!isNaN(bookId)) {
			// Redirect to the book's edit page Media tab
			throw redirect(302, `/books/${bookId}/edit?tab=media`);
		}
	}

	// No bookId - show the info page that guides users to create/find a book
	return {};
};
