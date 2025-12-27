import { db } from '$lib/server/db';
import { settings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Default settings with their metadata
export const DEFAULT_SETTINGS = {
	// Storage paths
	'storage.covers_path': {
		value: './static/covers',
		type: 'string',
		category: 'storage',
		label: 'Cover Images Path',
		description: 'Directory where book cover images are stored'
	},
	'storage.ebooks_path': {
		value: './static/ebooks',
		type: 'string',
		category: 'storage',
		label: 'Ebooks Path',
		description: 'Directory where ebook files are stored'
	},
	'storage.temp_path': {
		value: '/tmp/bookshelf-uploads',
		type: 'string',
		category: 'storage',
		label: 'Temporary Upload Path',
		description: 'Directory for temporary file uploads during import'
	},
	'storage.ebook_path_pattern': {
		value: '{filename}',
		type: 'string',
		category: 'storage',
		label: 'Ebook Path Pattern',
		description: 'Pattern for organizing ebooks. Use: {author}, {series}, {title}, {format}, {filename}'
	},
	'storage.cover_path_pattern': {
		value: '{filename}',
		type: 'string',
		category: 'storage',
		label: 'Cover Path Pattern',
		description: 'Pattern for organizing covers. Use: {author}, {series}, {title}, {filename}'
	},
	// Library settings
	'library.name': {
		value: 'BookShelf',
		type: 'string',
		category: 'library',
		label: 'Library Name',
		description: 'Name displayed in the header and OPDS feed'
	},
	'library.default_status': {
		value: '',
		type: 'string',
		category: 'library',
		label: 'Default Status',
		description: 'Default reading status for new books'
	},
	// Display settings
	'display.books_per_page': {
		value: '24',
		type: 'number',
		category: 'display',
		label: 'Books Per Page',
		description: 'Number of books to show per page in library view'
	},
	'display.default_sort': {
		value: 'title',
		type: 'string',
		category: 'display',
		label: 'Default Sort',
		description: 'Default sorting for book lists (title, author, rating, date)'
	},
	'display.default_view': {
		value: 'grid',
		type: 'string',
		category: 'display',
		label: 'Default View',
		description: 'Default view mode (grid, list, compact)'
	},
	// OPDS settings
	'opds.enabled': {
		value: 'true',
		type: 'boolean',
		category: 'opds',
		label: 'Enable OPDS',
		description: 'Enable OPDS catalog for e-reader access'
	},
	'opds.items_per_page': {
		value: '50',
		type: 'number',
		category: 'opds',
		label: 'OPDS Items Per Page',
		description: 'Number of items per page in OPDS feeds'
	},
	// Import settings
	'import.auto_detect_series': {
		value: 'true',
		type: 'boolean',
		category: 'import',
		label: 'Auto-detect Series',
		description: 'Attempt to detect series from book titles during import'
	},
	'import.download_covers': {
		value: 'true',
		type: 'boolean',
		category: 'import',
		label: 'Download Covers',
		description: 'Automatically download cover images during import'
	},
	// Metadata provider settings
	'metadata.googlebooks_enabled': {
		value: 'true',
		type: 'boolean',
		category: 'metadata',
		label: 'Google Books',
		description: 'Enable Google Books API for metadata lookups'
	},
	'metadata.openlibrary_enabled': {
		value: 'true',
		type: 'boolean',
		category: 'metadata',
		label: 'Open Library',
		description: 'Enable Open Library API for metadata lookups'
	},
	'metadata.goodreads_enabled': {
		value: 'true',
		type: 'boolean',
		category: 'metadata',
		label: 'Goodreads',
		description: 'Enable Goodreads scraping for metadata (ratings, reviews, series)'
	},
	'metadata.hardcover_enabled': {
		value: 'false',
		type: 'boolean',
		category: 'metadata',
		label: 'Hardcover',
		description: 'Enable Hardcover API for metadata (requires API key)'
	},
	'metadata.hardcover_api_key': {
		value: '',
		type: 'string',
		category: 'metadata',
		label: 'Hardcover API Key',
		description: 'API key from hardcover.app/account/api (required for Hardcover)'
	}
} as const;

export type SettingKey = keyof typeof DEFAULT_SETTINGS;

// Get a single setting value
export async function getSetting(key: SettingKey): Promise<string> {
	const result = await db.select().from(settings).where(eq(settings.key, key)).get();

	if (result?.value !== null && result?.value !== undefined) {
		return result.value;
	}

	return DEFAULT_SETTINGS[key].value;
}

// Get a setting as a specific type
export async function getSettingAs<T extends string | number | boolean>(
	key: SettingKey,
	type: 'string' | 'number' | 'boolean'
): Promise<T> {
	const value = await getSetting(key);

	switch (type) {
		case 'number':
			return parseInt(value, 10) as T;
		case 'boolean':
			return (value === 'true' || value === '1') as T;
		default:
			return value as T;
	}
}

// Get all settings in a category
export async function getSettingsByCategory(category: string): Promise<Record<string, string>> {
	const result: Record<string, string> = {};

	// Get defaults for this category
	for (const [key, meta] of Object.entries(DEFAULT_SETTINGS)) {
		if (meta.category === category) {
			result[key] = meta.value;
		}
	}

	// Override with stored values
	const stored = await db.select().from(settings).all();
	for (const setting of stored) {
		if (setting.category === category && setting.value !== null) {
			result[setting.key] = setting.value;
		}
	}

	return result;
}

// Get all settings with metadata
export async function getAllSettings(): Promise<Array<{
	key: string;
	value: string;
	type: string;
	category: string;
	label: string;
	description: string;
}>> {
	const stored = await db.select().from(settings).all();
	const storedMap = new Map(stored.map(s => [s.key, s.value]));

	return Object.entries(DEFAULT_SETTINGS).map(([key, meta]) => ({
		key,
		value: storedMap.get(key) ?? meta.value,
		type: meta.type,
		category: meta.category,
		label: meta.label,
		description: meta.description
	}));
}

// Set a single setting
export async function setSetting(key: SettingKey, value: string): Promise<void> {
	const meta = DEFAULT_SETTINGS[key];

	await db.insert(settings)
		.values({
			key,
			value,
			type: meta.type,
			category: meta.category,
			label: meta.label,
			description: meta.description,
			updatedAt: new Date().toISOString()
		})
		.onConflictDoUpdate({
			target: settings.key,
			set: {
				value,
				updatedAt: new Date().toISOString()
			}
		});
}

// Set multiple settings at once
export async function setSettings(values: Partial<Record<SettingKey, string>>): Promise<void> {
	for (const [key, value] of Object.entries(values)) {
		if (key in DEFAULT_SETTINGS && value !== undefined) {
			await setSetting(key as SettingKey, value);
		}
	}
}

// Initialize default settings in database
export async function initializeSettings(): Promise<void> {
	for (const [key, meta] of Object.entries(DEFAULT_SETTINGS)) {
		const existing = await db.select().from(settings).where(eq(settings.key, key)).get();

		if (!existing) {
			await db.insert(settings).values({
				key,
				value: meta.value,
				type: meta.type,
				category: meta.category,
				label: meta.label,
				description: meta.description,
				isSystem: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});
		}
	}
}

// Get metadata provider settings
export async function getMetadataProviderSettings(): Promise<{
	googlebooks: { enabled: boolean };
	openlibrary: { enabled: boolean };
	goodreads: { enabled: boolean };
	hardcover: { enabled: boolean; apiKey: string };
}> {
	const [googleEnabled, openLibraryEnabled, goodreadsEnabled, hardcoverEnabled, hardcoverApiKey] =
		await Promise.all([
			getSettingAs<boolean>('metadata.googlebooks_enabled', 'boolean'),
			getSettingAs<boolean>('metadata.openlibrary_enabled', 'boolean'),
			getSettingAs<boolean>('metadata.goodreads_enabled', 'boolean'),
			getSettingAs<boolean>('metadata.hardcover_enabled', 'boolean'),
			getSetting('metadata.hardcover_api_key')
		]);

	return {
		googlebooks: { enabled: googleEnabled as boolean },
		openlibrary: { enabled: openLibraryEnabled as boolean },
		goodreads: { enabled: goodreadsEnabled as boolean },
		hardcover: { enabled: hardcoverEnabled as boolean, apiKey: hardcoverApiKey }
	};
}

// Get storage paths helper
export async function getStoragePaths(): Promise<{
	coversPath: string;
	ebooksPath: string;
	tempPath: string;
	ebookPathPattern: string;
	coverPathPattern: string;
}> {
	const [coversPath, ebooksPath, tempPath, ebookPathPattern, coverPathPattern] = await Promise.all([
		getSetting('storage.covers_path'),
		getSetting('storage.ebooks_path'),
		getSetting('storage.temp_path'),
		getSetting('storage.ebook_path_pattern'),
		getSetting('storage.cover_path_pattern')
	]);

	return { coversPath, ebooksPath, tempPath, ebookPathPattern, coverPathPattern };
}

// File path pattern context for resolving patterns
export interface PathPatternContext {
	author?: string;
	series?: string;
	title?: string;
	format?: string;
	filename?: string;
}

// Sanitize a string for use in file paths
function sanitizePathComponent(str: string): string {
	return str
		.toLowerCase()
		.replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
		.replace(/\s+/g, '_')         // Replace spaces with underscores
		.replace(/_{2,}/g, '_')       // Collapse multiple underscores
		.replace(/^_|_$/g, '')        // Remove leading/trailing underscores
		.substring(0, 100);           // Limit length
}

// Resolve a path pattern with context values
export function resolvePathPattern(pattern: string, context: PathPatternContext): string {
	let result = pattern;

	// Replace each placeholder with its sanitized value or empty string
	const replacements: Record<string, string | undefined> = {
		'{author}': context.author,
		'{series}': context.series,
		'{title}': context.title,
		'{format}': context.format,
		'{filename}': context.filename
	};

	for (const [placeholder, value] of Object.entries(replacements)) {
		if (result.includes(placeholder)) {
			const sanitized = value ? sanitizePathComponent(value) : '';
			result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), sanitized);
		}
	}

	// Clean up any empty path segments (e.g., "author//title" becomes "author/title")
	result = result
		.replace(/\/+/g, '/')
		.replace(/^\/|\/$/g, '');

	// If the pattern resulted in an empty string, use filename as fallback
	if (!result && context.filename) {
		result = sanitizePathComponent(context.filename);
	}

	return result;
}
