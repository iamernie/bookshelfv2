import type { PageServerLoad } from './$types';
import { getAllSettings } from '$lib/server/services/settingsService';

export const load: PageServerLoad = async ({ locals }) => {
	const settings = await getAllSettings();

	// Group settings by category
	const grouped: Record<string, typeof settings> = {};
	for (const setting of settings) {
		if (!grouped[setting.category]) {
			grouped[setting.category] = [];
		}
		grouped[setting.category].push(setting);
	}

	return {
		settings: grouped,
		isAdmin: locals.user?.role === 'admin'
	};
};
