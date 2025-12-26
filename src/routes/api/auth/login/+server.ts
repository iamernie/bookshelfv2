import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { login } from '$lib/server/services/authService';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const data = await request.json();

	if (!data.email?.trim() || !data.password) {
		throw error(400, { message: 'Email and password are required' });
	}

	const result = await login(data.email.trim().toLowerCase(), data.password);

	if (!result.success) {
		throw error(401, { message: result.error || 'Login failed' });
	}

	// Set session cookie
	cookies.set('session', result.sessionId!, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false, // Set to true in production with HTTPS
		maxAge: 60 * 60 * 24 * 7 // 7 days
	});

	return json({ user: result.user });
};
