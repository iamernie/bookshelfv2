import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getBookById, getStatuses, getGenres, getFormats, getNarrators, getTags, getAllAuthors, getAllSeries } from '$lib/server/services/bookService';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(404, 'Book not found');
	}

	const book = await getBookById(id);
	if (!book) {
		throw error(404, 'Book not found');
	}

	const [statuses, genres, formats, narrators, tags, authors, series] = await Promise.all([
		getStatuses(),
		getGenres(),
		getFormats(),
		getNarrators(),
		getTags(),
		getAllAuthors(),
		getAllSeries()
	]);

	return {
		book,
		options: {
			statuses,
			genres,
			formats,
			narrators,
			tags,
			authors,
			series
		}
	};
};
