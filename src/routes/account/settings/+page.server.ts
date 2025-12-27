import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUserPreferences } from '$lib/server/services/userPreferencesService';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const preferences = await getUserPreferences(locals.user.id);

	return {
		preferences
	};
};
