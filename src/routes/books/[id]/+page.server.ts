import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getBookById } from '$lib/server/services/bookService';
import { canManagePublicLibrary } from '$lib/server/services/permissionService';
import { getSimilarBooks } from '$lib/server/services/recommendationService';
import { getAudiobooksByBookId, getOrCreateProgress, getBookmarks } from '$lib/server/services/audiobookService';

export const load: PageServerLoad = async ({ params, locals, url }) => {
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

	// Get linked audiobooks with full file info
	const linkedAudiobooks = locals.user
		? await getAudiobooksByBookId(id, locals.user.id)
		: [];

	// Get progress and bookmarks for each audiobook (for embedded player)
	const audiobookData: {
		audiobook: typeof linkedAudiobooks[0];
		progress: Awaited<ReturnType<typeof getOrCreateProgress>> | null;
		bookmarks: Awaited<ReturnType<typeof getBookmarks>>;
	}[] = [];

	if (locals.user && linkedAudiobooks.length > 0) {
		for (const audiobook of linkedAudiobooks) {
			const progress = await getOrCreateProgress(audiobook.id, locals.user.id);
			const bookmarks = await getBookmarks(audiobook.id, locals.user.id);
			audiobookData.push({ audiobook, progress, bookmarks });
		}
	}

	// Check if we should auto-open the listen tab
	const autoPlayAudiobook = url.searchParams.get('listen') === 'true';

	return {
		book,
		similarBooks,
		linkedAudiobooks,
		audiobookData,
		autoPlayAudiobook,
		canManagePublicLibrary: canManagePublicLibrary(locals.user)
	};
};
