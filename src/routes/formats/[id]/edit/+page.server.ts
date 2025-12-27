import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getFormatById, getBooksInFormat } from '$lib/server/services/formatService';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(404, 'Format not found');
	}

	const format = await getFormatById(id);
	if (!format) {
		throw error(404, 'Format not found');
	}

	const books = await getBooksInFormat(id);

	return {
		format,
		books
	};
};
