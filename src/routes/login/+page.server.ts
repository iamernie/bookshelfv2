import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getSetting } from '$lib/server/services/settingsService';

export const load: PageServerLoad = async ({ locals }) => {
	// If already logged in, redirect to home
	if (locals.user) {
		throw redirect(302, '/');
	}

	// Check if signup is enabled to show the link
	const allowSignup = await getSetting('registration.allow_signup');

	return {
		signupEnabled: allowSignup === 'true'
	};
};
