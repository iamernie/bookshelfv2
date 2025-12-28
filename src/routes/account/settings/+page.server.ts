import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUserPreferences } from '$lib/server/services/userPreferencesService';
import { getUserOidcLinks, getEnabledProviders } from '$lib/server/services/oidcService';
import { getLibraryShares, getSharedLibraries, getShareableUsers } from '$lib/server/services/libraryShareService';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const preferences = await getUserPreferences(locals.user.id);

	// Get user's OIDC linked accounts
	const oidcLinks = await getUserOidcLinks(locals.user.id);

	// Get available providers for linking
	const allProviders = await getEnabledProviders();

	// Filter out already-linked providers
	const linkedProviderIds = new Set(oidcLinks.map((l) => l.providerId));
	const availableProviders = allProviders.filter((p) => !linkedProviderIds.has(p.id));

	// Check for success message from linking
	const linked = url.searchParams.get('linked') === 'true';

	// Get library sharing data
	const [myShares, sharedWithMe, shareableUsers] = await Promise.all([
		getLibraryShares(locals.user.id),
		getSharedLibraries(locals.user.id),
		getShareableUsers(locals.user.id)
	]);

	return {
		preferences,
		oidcLinks: oidcLinks.map((link) => ({
			id: link.id,
			providerId: link.providerId,
			providerName: link.provider.name,
			providerSlug: link.provider.slug,
			providerColor: link.provider.buttonColor,
			providerIcon: link.provider.iconUrl,
			linkedAt: link.linkedAt,
			lastLoginAt: link.lastLoginAt,
			oidcEmail: link.oidcEmail
		})),
		availableProviders: availableProviders.map((p) => ({
			id: p.id,
			slug: p.slug,
			name: p.name,
			buttonColor: p.buttonColor,
			iconUrl: p.iconUrl
		})),
		justLinked: linked,
		librarySharing: {
			myShares,
			sharedWithMe,
			shareableUsers
		}
	};
};
