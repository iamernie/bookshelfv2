/**
 * User Preferences Service
 * Manages user-specific settings and preferences
 */

import { db, userPreferences } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { UserPreference, NewUserPreference } from '$lib/server/db/schema';

export interface UserPreferencesData {
	// Display
	theme: 'light' | 'dark' | 'system';
	accentColor: string;
	// Dashboard
	dashboardWidgets: DashboardWidgetConfig[] | null;
	// Books view
	defaultBooksView: 'grid' | 'list' | 'table';
	defaultBooksSort: string;
	defaultBooksSortOrder: 'asc' | 'desc';
	booksPerPage: number;
	// Reader
	readerFontFamily: string;
	readerFontSize: number;
	readerLineHeight: number;
	readerTheme: 'auto' | 'light' | 'dark' | 'sepia';
	// Notifications
	emailNotifications: boolean;
	goalReminders: boolean;
	// UI state
	sidebarCollapsed: boolean;
}

export interface DashboardWidgetConfig {
	id: string;
	enabled: boolean;
	order: number;
}

const DEFAULT_PREFERENCES: UserPreferencesData = {
	theme: 'system',
	accentColor: '#3b82f6',
	dashboardWidgets: null,
	defaultBooksView: 'grid',
	defaultBooksSort: 'title',
	defaultBooksSortOrder: 'asc',
	booksPerPage: 24,
	readerFontFamily: 'system',
	readerFontSize: 16,
	readerLineHeight: 1.6,
	readerTheme: 'auto',
	emailNotifications: false,
	goalReminders: true,
	sidebarCollapsed: false
};

/**
 * Get user preferences (creates defaults if not exists)
 */
export async function getUserPreferences(userId: number): Promise<UserPreferencesData> {
	const result = await db
		.select()
		.from(userPreferences)
		.where(eq(userPreferences.userId, userId))
		.limit(1);

	if (result.length === 0) {
		// Create default preferences
		await createDefaultPreferences(userId);
		return { ...DEFAULT_PREFERENCES };
	}

	const prefs = result[0];
	return {
		theme: (prefs.theme as 'light' | 'dark' | 'system') || 'system',
		accentColor: prefs.accentColor || '#3b82f6',
		dashboardWidgets: prefs.dashboardWidgets ? JSON.parse(prefs.dashboardWidgets) : null,
		defaultBooksView: (prefs.defaultBooksView as 'grid' | 'list' | 'table') || 'grid',
		defaultBooksSort: prefs.defaultBooksSort || 'title',
		defaultBooksSortOrder: (prefs.defaultBooksSortOrder as 'asc' | 'desc') || 'asc',
		booksPerPage: prefs.booksPerPage || 24,
		readerFontFamily: prefs.readerFontFamily || 'system',
		readerFontSize: prefs.readerFontSize || 16,
		readerLineHeight: prefs.readerLineHeight || 1.6,
		readerTheme: (prefs.readerTheme as 'auto' | 'light' | 'dark' | 'sepia') || 'auto',
		emailNotifications: prefs.emailNotifications || false,
		goalReminders: prefs.goalReminders ?? true,
		sidebarCollapsed: prefs.sidebarCollapsed || false
	};
}

/**
 * Create default preferences for a user
 */
async function createDefaultPreferences(userId: number): Promise<void> {
	const now = new Date().toISOString();
	await db.insert(userPreferences).values({
		userId,
		theme: 'system',
		accentColor: '#3b82f6',
		defaultBooksView: 'grid',
		defaultBooksSort: 'title',
		defaultBooksSortOrder: 'asc',
		booksPerPage: 24,
		readerFontFamily: 'system',
		readerFontSize: 16,
		readerLineHeight: 1.6,
		readerTheme: 'auto',
		emailNotifications: false,
		goalReminders: true,
		sidebarCollapsed: false,
		createdAt: now,
		updatedAt: now
	}).onConflictDoNothing();
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
	userId: number,
	updates: Partial<UserPreferencesData>
): Promise<UserPreferencesData> {
	// Ensure preferences row exists
	const existing = await db
		.select({ id: userPreferences.id })
		.from(userPreferences)
		.where(eq(userPreferences.userId, userId))
		.limit(1);

	const now = new Date().toISOString();

	// Build update object
	const updateData: Partial<NewUserPreference> = {
		updatedAt: now
	};

	if (updates.theme !== undefined) updateData.theme = updates.theme;
	if (updates.accentColor !== undefined) updateData.accentColor = updates.accentColor;
	if (updates.dashboardWidgets !== undefined) {
		updateData.dashboardWidgets = updates.dashboardWidgets ? JSON.stringify(updates.dashboardWidgets) : null;
	}
	if (updates.defaultBooksView !== undefined) updateData.defaultBooksView = updates.defaultBooksView;
	if (updates.defaultBooksSort !== undefined) updateData.defaultBooksSort = updates.defaultBooksSort;
	if (updates.defaultBooksSortOrder !== undefined) updateData.defaultBooksSortOrder = updates.defaultBooksSortOrder;
	if (updates.booksPerPage !== undefined) updateData.booksPerPage = updates.booksPerPage;
	if (updates.readerFontFamily !== undefined) updateData.readerFontFamily = updates.readerFontFamily;
	if (updates.readerFontSize !== undefined) updateData.readerFontSize = updates.readerFontSize;
	if (updates.readerLineHeight !== undefined) updateData.readerLineHeight = updates.readerLineHeight;
	if (updates.readerTheme !== undefined) updateData.readerTheme = updates.readerTheme;
	if (updates.emailNotifications !== undefined) updateData.emailNotifications = updates.emailNotifications;
	if (updates.goalReminders !== undefined) updateData.goalReminders = updates.goalReminders;
	if (updates.sidebarCollapsed !== undefined) updateData.sidebarCollapsed = updates.sidebarCollapsed;

	if (existing.length === 0) {
		// Insert
		await db.insert(userPreferences).values({
			userId,
			...DEFAULT_PREFERENCES,
			...updateData,
			dashboardWidgets: updateData.dashboardWidgets || null,
			createdAt: now
		});
	} else {
		// Update
		await db.update(userPreferences)
			.set(updateData)
			.where(eq(userPreferences.userId, userId));
	}

	return getUserPreferences(userId);
}

/**
 * Get a single preference value
 */
export async function getPreference<K extends keyof UserPreferencesData>(
	userId: number,
	key: K
): Promise<UserPreferencesData[K]> {
	const prefs = await getUserPreferences(userId);
	return prefs[key];
}

/**
 * Set a single preference value
 */
export async function setPreference<K extends keyof UserPreferencesData>(
	userId: number,
	key: K,
	value: UserPreferencesData[K]
): Promise<void> {
	await updateUserPreferences(userId, { [key]: value } as Partial<UserPreferencesData>);
}

/**
 * Reset preferences to defaults
 */
export async function resetPreferences(userId: number): Promise<UserPreferencesData> {
	await db.delete(userPreferences).where(eq(userPreferences.userId, userId));
	await createDefaultPreferences(userId);
	return { ...DEFAULT_PREFERENCES };
}

/**
 * Get theme for a user (for SSR)
 */
export async function getUserTheme(userId: number): Promise<'light' | 'dark' | 'system'> {
	const result = await db
		.select({ theme: userPreferences.theme })
		.from(userPreferences)
		.where(eq(userPreferences.userId, userId))
		.limit(1);

	return (result[0]?.theme as 'light' | 'dark' | 'system') || 'system';
}

/**
 * Get sidebar collapsed state
 */
export async function getSidebarState(userId: number): Promise<boolean> {
	const result = await db
		.select({ collapsed: userPreferences.sidebarCollapsed })
		.from(userPreferences)
		.where(eq(userPreferences.userId, userId))
		.limit(1);

	return result[0]?.collapsed || false;
}

/**
 * Set sidebar collapsed state
 */
export async function setSidebarState(userId: number, collapsed: boolean): Promise<void> {
	await updateUserPreferences(userId, { sidebarCollapsed: collapsed });
}
