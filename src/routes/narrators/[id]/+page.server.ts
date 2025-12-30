import type { PageServerLoad } from './$types';
import { getNarratorById, getAudiobooksByNarrator, getNarratorTags } from '$lib/server/services/narratorService';
import { getAllTags } from '$lib/server/services/tagService';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		throw error(400, 'Invalid narrator ID');
	}

	const userId = locals.user?.id;

	const [narrator, audiobooks, narratorTags, tags] = await Promise.all([
		getNarratorById(id, userId),
		getAudiobooksByNarrator(id),
		getNarratorTags(id),
		getAllTags()
	]);

	if (!narrator) {
		throw error(404, 'Narrator not found');
	}

	return {
		narrator,
		audiobooks,
		narratorTags,
		options: {
			tags
		}
	};
};
