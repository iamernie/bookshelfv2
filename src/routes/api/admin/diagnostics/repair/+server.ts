import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	runAllRepairs,
	repairOrphanedRelationships,
	cleanExpiredSessions,
	fixInvalidBookReferences,
	removeOrphanedAuthors,
	removeOrphanedSeries,
	removeOrphanedTags
} from '$lib/server/services/diagnosticService';

export const POST: RequestHandler = async ({ locals, request }) => {
	// Admin-only access
	if (!locals.user?.isAdmin) {
		throw error(403, 'Admin access required');
	}

	try {
		const { type } = await request.json();

		switch (type) {
			case 'all': {
				const result = await runAllRepairs();
				return json({
					success: true,
					totalRepaired: result.totalRepaired,
					results: result.results
				});
			}

			case 'orphaned':
			case 'book_authors':
			case 'book_series':
			case 'book_tags': {
				const result = await repairOrphanedRelationships();
				return json(result);
			}

			case 'sessions': {
				const result = await cleanExpiredSessions();
				return json(result);
			}

			case 'references':
			case 'books': {
				const result = await fixInvalidBookReferences();
				return json(result);
			}

			case 'authors': {
				const result = await removeOrphanedAuthors();
				return json(result);
			}

			case 'series': {
				const result = await removeOrphanedSeries();
				return json(result);
			}

			case 'tags': {
				const result = await removeOrphanedTags();
				return json(result);
			}

			default:
				throw error(400, `Unknown repair type: ${type}`);
		}
	} catch (err) {
		if (err instanceof Response) throw err;
		console.error('Error running repair:', err);
		throw error(500, 'Failed to run repair');
	}
};
