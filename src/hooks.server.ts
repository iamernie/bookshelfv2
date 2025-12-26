import type { Handle, HandleServerError } from '@sveltejs/kit';
import { redirect, error } from '@sveltejs/kit';
import { getSession, validateCredentials } from '$lib/server/services/authService';
import { createLogger, logRequest, logError } from '$lib/server/services/loggerService';

const log = createLogger('hooks');
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/docs', '/docs'];

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
