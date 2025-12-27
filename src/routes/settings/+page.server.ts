import type { PageServerLoad } from './$types';
import { getAllSettings } from '$lib/server/services/settingsService';
import { getAISettings } from '$lib/server/services/recommendationService';

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

	// Get AI settings separately (they use a different storage pattern)
	const aiSettings = await getAISettings();

	return {
		settings: grouped,
		aiSettings,
		isAdmin: locals.user?.role === 'admin'
	};
};
