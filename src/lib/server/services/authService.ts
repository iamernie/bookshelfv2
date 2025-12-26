import { db, users, sessions } from '$lib/server/db';
import { eq, and, gt, lt } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 12;
const SESSION_EXPIRY_DAYS = 7;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export interface AuthUser {
	id: number;
	username: string;
	email: string;
	role: string;
	firstName: string | null;
	lastName: string | null;
	isAdmin: boolean;
}

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export function generateSessionId(): string {
	return crypto.randomBytes(32).toString('hex');
}

export async function getUserByEmail(email: string) {
	const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
	return result[0] || null;
}

export async function getUserById(id: number) {
	const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
	return result[0] || null;
}

export async function login(
	email: string,
	password: string
): Promise<{ success: boolean; user?: AuthUser; sessionId?: string; error?: string }> {
	const user = await getUserByEmail(email);

	if (!user) {
		return { success: false, error: 'Invalid email or password' };
	}

	// Check if locked out
	if (user.lockoutUntil) {
		const lockoutTime = new Date(user.lockoutUntil);
		if (lockoutTime > new Date()) {
			const minutesLeft = Math.ceil((lockoutTime.getTime() - Date.now()) / 60000);
			return {
				success: false,
				error: `Account locked. Try again in ${minutesLeft} minute(s)`
			};
		}
		// Lockout expired, reset attempts
		await db
			.update(users)
			.set({ failedLoginAttempts: 0, lockoutUntil: null })
			.where(eq(users.id, user.id));
	}

	const passwordValid = await verifyPassword(password, user.password);

	if (!passwordValid) {
		const attempts = (user.failedLoginAttempts || 0) + 1;

		if (attempts >= MAX_LOGIN_ATTEMPTS) {
			const lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString();
			await db
				.update(users)
				.set({ failedLoginAttempts: attempts, lockoutUntil })
				.where(eq(users.id, user.id));
			return {
				success: false,
				error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes`
			};
		}

		await db.update(users).set({ failedLoginAttempts: attempts }).where(eq(users.id, user.id));
		return { success: false, error: 'Invalid email or password' };
	}

	// Reset failed attempts on successful login
	await db
		.update(users)
		.set({ failedLoginAttempts: 0, lockoutUntil: null })
		.where(eq(users.id, user.id));

	// Create session
	const sessionId = generateSessionId();
	const expires = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
	const sessionData = JSON.stringify({ userId: user.id });

	const now = new Date().toISOString();
	await db.insert(sessions).values({
		sid: sessionId,
		expires,
		data: sessionData,
		createdAt: now,
		updatedAt: now
	});

	const role = user.role || 'user';
	return {
		success: true,
		sessionId,
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			role,
			firstName: user.firstName,
			lastName: user.lastName,
			isAdmin: role === 'admin'
		}
	};
}

export async function logout(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.sid, sessionId));
}

export async function getSession(
	sessionId: string
): Promise<{ user: AuthUser; expires: string } | null> {
	const result = await db
		.select()
		.from(sessions)
		.where(and(eq(sessions.sid, sessionId), gt(sessions.expires, new Date().toISOString())))
		.limit(1);

	const session = result[0];
	if (!session || !session.data) {
		return null;
	}

	const data = JSON.parse(session.data);
	const user = await getUserById(data.userId);

	if (!user) {
		// User was deleted, clean up session
		await logout(sessionId);
		return null;
	}

	const role = user.role || 'user';
	return {
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			role,
			firstName: user.firstName,
			lastName: user.lastName,
			isAdmin: role === 'admin'
		},
		expires: session.expires || ''
	};
}

export async function cleanExpiredSessions(): Promise<number> {
	const now = new Date().toISOString();
	const result = await db.delete(sessions).where(lt(sessions.expires, now));
	return result.changes;
}

// Validate credentials without creating a session (for Basic Auth)
export async function validateCredentials(email: string, password: string): Promise<AuthUser | null> {
	const user = await getUserByEmail(email);

	if (!user) {
		return null;
	}

	// Check if locked out
	if (user.lockoutUntil) {
		const lockoutTime = new Date(user.lockoutUntil);
		if (lockoutTime > new Date()) {
			return null;
		}
	}

	const passwordValid = await verifyPassword(password, user.password);

	if (!passwordValid) {
		return null;
	}

	const role = user.role || 'user';
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		role,
		firstName: user.firstName,
		lastName: user.lastName,
		isAdmin: role === 'admin'
	};
}
