import type { PageServerLoad } from './$types';
import { getAuthorWithBooks } from '$lib/server/services/authorService';
import { getAllTags } from '$lib/server/services/tagService';
import { getAllStatuses } from '$lib/server/services/statusService';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(400, 'Invalid author ID');
	}

	const userId = locals.user?.id;

	const [result, tags, statuses] = await Promise.all([
		getAuthorWithBooks(id, userId),
		getAllTags(),
		getAllStatuses()
	]);

	if (!result) {
		throw error(404, 'Author not found');
	}

	return {
		author: result.author,
		books: result.books,
		series: result.series,
		options: {
			tags,
			statuses
		}
	};
};
