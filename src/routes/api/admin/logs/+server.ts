import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLogs, clearLogs, getLogStats } from '$lib/server/services/loggerService';

// GET /api/admin/logs - Fetch logs with optional filtering
export const GET: RequestHandler = async ({ url, locals }) => {
	// Require admin access
	if (locals.user?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	const level = url.searchParams.get('level') || undefined;
	const context = url.searchParams.get('context') || undefined;
	const limit = parseInt(url.searchParams.get('limit') || '100', 10);
	const since = url.searchParams.get('since') || undefined;

	const logs = getLogs({ level, context, limit, since });
	const stats = getLogStats();

	return json({
		logs,
		stats,
		filters: { level, context, limit, since }
	});
};

// DELETE /api/admin/logs - Clear all logs
export const DELETE: RequestHandler = async ({ locals }) => {
	// Require admin access
	if (locals.user?.role !== 'admin') {
		throw error(403, 'Admin access required');
	}

	clearLogs();

	return json({ success: true, message: 'Logs cleared' });
};
