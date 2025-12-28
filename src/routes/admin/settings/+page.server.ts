import type { PageServerLoad } from './$types';
import { getAllSettings } from '$lib/server/services/settingsService';
import { getAISettings } from '$lib/server/services/recommendationService';
import { getEmailConfigStatus } from '$lib/server/services/emailService';

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

	// Get email configuration status
	const emailStatus = await getEmailConfigStatus();

	return {
		settings: grouped,
		aiSettings,
		emailStatus,
		isAdmin: locals.user?.role === 'admin'
	};
};
