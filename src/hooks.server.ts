import type { Handle, HandleServerError } from '@sveltejs/kit';
import { redirect, error } from '@sveltejs/kit';
import { getSession, validateCredentials } from '$lib/server/services/authService';
import { createLogger, logRequest, logError } from '$lib/server/services/loggerService';
import { checkSetupNeeded } from '$lib/server/services/setupService';
import { migrationStatus } from '$lib/server/db';

const log = createLogger('hooks');

// Log BODY_SIZE_LIMIT on startup for debugging
console.log('[hooks] BODY_SIZE_LIMIT env:', process.env.BODY_SIZE_LIMIT || 'NOT SET (default 512kb)');
const PUBLIC_PATHS = [
	'/login',
	'/reset-password',
	'/api/auth/login',
	'/api/auth/forgot-password',
	'/api/auth/reset-password',
	'/api/auth/oidc/providers',
	'/auth/oidc', // OIDC initiate and callback routes
	'/api/docs',
	'/docs',
	'/setup',
	'/api/setup',
	'/health',
	'/widgets',
	'/signup',
	'/api/auth/signup',
	'/upgrade',
	'/api/system/migration-status'
];

// Handle Basic Auth for OPDS routes
async function handleOPDSAuth(event: Parameters<Handle>[0]['event']): Promise<boolean> {
	const authHeader = event.request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Basic ')) {
		return false;
	}

	try {
		const base64Credentials = authHeader.slice(6);
		const credentials = atob(base64Credentials);
		const [email, password] = credentials.split(':');

		if (!email || !password) {
			return false;
		}

		const user = await validateCredentials(email, password);
		if (user) {
			event.locals.user = user;
			return true;
		}
	} catch {
		return false;
	}

	return false;
}

export const handle: Handle = async ({ event, resolve }) => {
	// Debug logging for upload requests
	if (event.url.pathname.includes('/api/metadata/extract') || event.url.pathname.includes('/api/audiobooks')) {
		console.log('[hooks] === INCOMING REQUEST ===');
		console.log('[hooks] Method:', event.request.method);
		console.log('[hooks] URL:', event.url.pathname);
		console.log('[hooks] Content-Type:', event.request.headers.get('content-type'));
		console.log('[hooks] Content-Length:', event.request.headers.get('content-length'));
	}

	// Check if database migration is in progress
	const isUpgradePath = event.url.pathname.startsWith('/upgrade') ||
		event.url.pathname.startsWith('/api/system/migration-status');

	if (migrationStatus.inProgress && !isUpgradePath) {
		throw redirect(303, '/upgrade');
	}

	const isOPDSRoute = event.url.pathname.startsWith('/opds');

	// Handle OPDS routes with Basic Auth
	if (isOPDSRoute) {
		const isAuthenticated = await handleOPDSAuth(event);

		if (!isAuthenticated) {
			return new Response('Unauthorized', {
				status: 401,
				headers: {
					'WWW-Authenticate': 'Basic realm="BookShelf OPDS"',
					'Content-Type': 'text/plain'
				}
			});
		}

		return resolve(event);
	}

	const sessionId = event.cookies.get('session');

	if (sessionId) {
		const session = await getSession(sessionId);
		if (session) {
			event.locals.user = session.user;
		} else {
			// Invalid/expired session, clear cookie
			event.cookies.delete('session', { path: '/' });
		}
	}

	// Check if route requires authentication
	const isPublicPath = PUBLIC_PATHS.some((path) => event.url.pathname.startsWith(path));
	const isSetupPath = event.url.pathname.startsWith('/setup') || event.url.pathname.startsWith('/api/setup');

	// Check if setup is needed (only for non-setup paths)
	if (!isSetupPath) {
		try {
			const setupStatus = await checkSetupNeeded();
			if (setupStatus.needsSetup) {
				throw redirect(303, '/setup');
			}
		} catch (e) {
			// If it's a redirect, rethrow it
			if (e instanceof Response || (e && typeof e === 'object' && 'status' in e)) {
				throw e;
			}
			// Otherwise log and continue (database might not be ready)
			log.warn('Setup check failed:', e as Record<string, unknown>);
		}
	}

	if (!event.locals.user && !isPublicPath) {
		throw redirect(303, '/login');
	}

	// Redirect logged-in users away from login page
	if (event.locals.user && event.url.pathname === '/login') {
		throw redirect(303, '/');
	}

	// Log request with timing
	const start = Date.now();
	const response = await resolve(event);
	const duration = Date.now() - start;

	logRequest(event.request.method, event.url.pathname, response.status, duration);

	return response;
};

// Global error handler
export const handleError: HandleServerError = async ({ error: err, event, status, message }) => {
	const errorObj = err instanceof Error ? err : new Error(String(err));

	logError(errorObj, `${event.request.method} ${event.url.pathname}`);

	// Log additional details for debugging
	log.debug('Error details', {
		status,
		message,
		url: event.url.href,
		method: event.request.method,
		userAgent: event.request.headers.get('user-agent')
	});

	return {
		message: status === 500 ? 'Internal Server Error' : message
	};
};
