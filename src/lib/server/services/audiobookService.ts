import { db } from '$lib/server/db';
import {
	audiobooks,
	audiobookFiles,
	audiobookProgress,
	audiobookChapters,
	audiobookBookmarks,
	type Audiobook,
	type NewAudiobook,
	type AudiobookFile,
	type NewAudiobookFile,
	type AudiobookProgress,
	type NewAudiobookProgress,
	type AudiobookChapter,
	type NewAudiobookChapter,
	type AudiobookBookmark,
	type NewAudiobookBookmark
} from '$lib/server/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { parseFile } from 'music-metadata';
import { existsSync, mkdirSync, unlinkSync, statSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { env } from '$env/dynamic/private';

// ============================================================================
// Types
// ============================================================================

export interface AudiobookWithFiles extends Audiobook {
	files: AudiobookFile[];
	chapters?: AudiobookChapter[];
	userProgress?: AudiobookProgress | null;
}

export interface AudiobookListOptions {
	userId: number;
	limit?: number;
	offset?: number;
	search?: string;
	sortBy?: 'title' | 'author' | 'createdAt' | 'duration' | 'lastPlayed';
	sortOrder?: 'asc' | 'desc';
	filter?: 'all' | 'in_progress' | 'completed' | 'not_started';
}

export interface AudiobookListResult {
	items: AudiobookWithFiles[];
	total: number;
	limit: number;
	offset: number;
}

// ============================================================================
// File Storage Configuration
// ============================================================================

function getAudiobooksBasePath(): string {
	const dataPath = env.DATA_PATH || './data';
	return join(dataPath, 'audiobooks');
}

function getAudiobookPath(userId: number, audiobookId: number): string {
	return join(getAudiobooksBasePath(), String(userId), String(audiobookId));
}

function ensureAudiobookDir(userId: number, audiobookId: number): string {
	const dir = getAudiobookPath(userId, audiobookId);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	return dir;
}

// ============================================================================
// MIME Type Helpers
// ============================================================================

const SUPPORTED_AUDIO_TYPES: Record<string, string> = {
	'.mp3': 'audio/mpeg',
	'.m4a': 'audio/mp4',
	'.m4b': 'audio/mp4',
	'.aac': 'audio/aac',
	'.ogg': 'audio/ogg',
	'.opus': 'audio/opus',
	'.flac': 'audio/flac',
	'.wav': 'audio/wav'
};

export function getMimeType(filename: string): string {
	const ext = extname(filename).toLowerCase();
	return SUPPORTED_AUDIO_TYPES[ext] || 'audio/mpeg';
}

export function isSupportedAudioFormat(filename: string): boolean {
	const ext = extname(filename).toLowerCase();
	return ext in SUPPORTED_AUDIO_TYPES;
}

// Browser-playable formats (no transcoding needed)
const BROWSER_PLAYABLE = ['.mp3', '.m4a', '.m4b', '.aac', '.ogg', '.opus', '.wav'];

export function isBrowserPlayable(filename: string): boolean {
	const ext = extname(filename).toLowerCase();
	return BROWSER_PLAYABLE.includes(ext);
}

// ============================================================================
// Audio Metadata Extraction
// ============================================================================

export interface AudioMetadata {
	duration: number; // seconds
	title?: string;
	artist?: string;
	album?: string;
	track?: number;
	chapters?: { title: string; startTime: number; endTime?: number }[];
}

export async function extractAudioMetadata(filePath: string): Promise<AudioMetadata> {
	try {
		const metadata = await parseFile(filePath);

		// Extract chapters if available (common in M4B files)
		const chapters = metadata.native?.iTunes?.filter(
			tag => tag.id === 'chpl' || tag.id === '©chp'
		) || [];

		const parsedChapters: AudioMetadata['chapters'] = [];

		// Try to extract chapter info from the metadata
		if (metadata.native) {
			for (const format of Object.values(metadata.native)) {
				for (const tag of format) {
					if (tag.id === 'CHAP' || tag.id === 'chapter') {
						// ID3v2 chapter format
						const chapterData = tag.value as { startTime?: number; endTime?: number; tags?: { title?: string } };
						if (chapterData && typeof chapterData.startTime === 'number') {
							parsedChapters.push({
								title: chapterData.tags?.title || `Chapter ${parsedChapters.length + 1}`,
								startTime: chapterData.startTime / 1000, // Convert to seconds
								endTime: chapterData.endTime ? chapterData.endTime / 1000 : undefined
							});
						}
					}
				}
			}
		}

		return {
			duration: metadata.format.duration || 0,
			title: metadata.common.title,
			artist: metadata.common.artist || metadata.common.albumartist,
			album: metadata.common.album,
			track: metadata.common.track?.no ?? undefined,
			chapters: parsedChapters.length > 0 ? parsedChapters : undefined
		};
	} catch (error) {
		console.error('[audiobookService] Failed to extract metadata:', error);
		return { duration: 0 };
	}
}

// ============================================================================
// Audiobook CRUD
// ============================================================================

export async function createAudiobook(data: NewAudiobook): Promise<Audiobook> {
	const now = new Date().toISOString();
	const [audiobook] = await db.insert(audiobooks).values({
		...data,
		createdAt: now,
		updatedAt: now
	}).returning();

	return audiobook;
}

export async function getAudiobookById(id: number, userId?: number): Promise<AudiobookWithFiles | null> {
	const results = await db.query.audiobooks.findFirst({
		where: eq(audiobooks.id, id),
		with: {
			files: {
				orderBy: [asc(audiobookFiles.trackNumber)]
			},
			chapters: {
				orderBy: [asc(audiobookChapters.chapterNumber)]
			}
		}
	});

	if (!results) return null;

	// Get user progress if userId provided
	let userProgress: AudiobookProgress | null = null;
	if (userId) {
		const progress = await db.query.audiobookProgress.findFirst({
			where: and(
				eq(audiobookProgress.audiobookId, id),
				eq(audiobookProgress.userId, userId)
			)
		});
		userProgress = progress || null;
	}

	return {
		...results,
		userProgress
	};
}

export async function getAudiobooks(options: AudiobookListOptions): Promise<AudiobookListResult> {
	const {
		userId,
		limit = 24,
		offset = 0,
		search,
		sortBy = 'createdAt',
		sortOrder = 'desc',
		filter = 'all'
	} = options;

	// Build conditions
	const conditions = [eq(audiobooks.userId, userId)];

	// Get all audiobooks for the user
	let query = db.query.audiobooks.findMany({
		where: and(...conditions),
		with: {
			files: {
				orderBy: [asc(audiobookFiles.trackNumber)]
			}
		},
		orderBy: sortBy === 'title'
			? (sortOrder === 'asc' ? [asc(audiobooks.title)] : [desc(audiobooks.title)])
			: sortBy === 'author'
			? (sortOrder === 'asc' ? [asc(audiobooks.author)] : [desc(audiobooks.author)])
			: sortBy === 'duration'
			? (sortOrder === 'asc' ? [asc(audiobooks.duration)] : [desc(audiobooks.duration)])
			: (sortOrder === 'asc' ? [asc(audiobooks.createdAt)] : [desc(audiobooks.createdAt)]),
		limit,
		offset
	});

	const items = await query;

	// Get progress for each audiobook
	const progressMap = new Map<number, AudiobookProgress>();
	if (items.length > 0) {
		const progressRecords = await db.query.audiobookProgress.findMany({
			where: and(
				eq(audiobookProgress.userId, userId),
				sql`${audiobookProgress.audiobookId} IN (${sql.join(items.map(a => sql`${a.id}`), sql`, `)})`
			)
		});

		for (const p of progressRecords) {
			progressMap.set(p.audiobookId, p);
		}
	}

	// Apply progress to items and filter
	let enrichedItems: AudiobookWithFiles[] = items.map(item => ({
		...item,
		userProgress: progressMap.get(item.id) || null
	}));

	// Apply filter
	if (filter === 'in_progress') {
		enrichedItems = enrichedItems.filter(item =>
			item.userProgress &&
			(item.userProgress.progress ?? 0) > 0 &&
			!item.userProgress.isFinished
		);
	} else if (filter === 'completed') {
		enrichedItems = enrichedItems.filter(item =>
			item.userProgress?.isFinished
		);
	} else if (filter === 'not_started') {
		enrichedItems = enrichedItems.filter(item =>
			!item.userProgress || (item.userProgress.progress ?? 0) === 0
		);
	}

	// Apply search filter (client-side for now)
	if (search) {
		const searchLower = search.toLowerCase();
		enrichedItems = enrichedItems.filter(item =>
			item.title.toLowerCase().includes(searchLower) ||
			item.author?.toLowerCase().includes(searchLower) ||
			item.narratorName?.toLowerCase().includes(searchLower)
		);
	}

	// Get total count
	const totalResult = await db.select({ count: sql<number>`count(*)` })
		.from(audiobooks)
		.where(eq(audiobooks.userId, userId));
	const total = totalResult[0]?.count || 0;

	return {
		items: enrichedItems,
		total,
		limit,
		offset
	};
}

export async function updateAudiobook(id: number, data: Partial<Audiobook>): Promise<Audiobook | null> {
	const now = new Date().toISOString();
	const [updated] = await db.update(audiobooks)
		.set({ ...data, updatedAt: now })
		.where(eq(audiobooks.id, id))
		.returning();

	return updated || null;
}

/**
 * Get all audiobooks linked to a specific book
 */
export async function getAudiobooksByBookId(bookId: number, userId?: number): Promise<AudiobookWithFiles[]> {
	const results = await db.query.audiobooks.findMany({
		where: eq(audiobooks.bookId, bookId),
		with: {
			files: {
				orderBy: [asc(audiobookFiles.trackNumber)]
			}
		},
		orderBy: [desc(audiobooks.createdAt)]
	});

	// Add progress for the specified user
	if (userId && results.length > 0) {
		const progressRecords = await db.query.audiobookProgress.findMany({
			where: and(
				eq(audiobookProgress.userId, userId),
				sql`${audiobookProgress.audiobookId} IN (${sql.join(results.map(a => sql`${a.id}`), sql`, `)})`
			)
		});

		const progressMap = new Map<number, AudiobookProgress>();
		for (const p of progressRecords) {
			progressMap.set(p.audiobookId, p);
		}

		return results.map(item => ({
			...item,
			userProgress: progressMap.get(item.id) || null
		}));
	}

	return results.map(item => ({ ...item, userProgress: null }));
}

export async function deleteAudiobook(id: number): Promise<boolean> {
	// Get audiobook to find files to delete
	const audiobook = await getAudiobookById(id);
	if (!audiobook) return false;

	// Delete physical files
	for (const file of audiobook.files) {
		try {
			if (existsSync(file.filePath)) {
				unlinkSync(file.filePath);
			}
		} catch (e) {
			console.error('[audiobookService] Failed to delete file:', file.filePath, e);
		}
	}

	// Delete cover if exists
	if (audiobook.coverPath && existsSync(audiobook.coverPath)) {
		try {
			unlinkSync(audiobook.coverPath);
		} catch (e) {
			console.error('[audiobookService] Failed to delete cover:', audiobook.coverPath, e);
		}
	}

	// Delete from database (cascade will handle files, progress, chapters, bookmarks)
	await db.delete(audiobooks).where(eq(audiobooks.id, id));

	return true;
}

// ============================================================================
// Audiobook Files
// ============================================================================

export async function addAudiobookFile(data: NewAudiobookFile): Promise<AudiobookFile> {
	const now = new Date().toISOString();
	const [file] = await db.insert(audiobookFiles).values({
		...data,
		createdAt: now,
		updatedAt: now
	}).returning();

	// Update audiobook total duration
	await recalculateAudiobookDuration(data.audiobookId);

	return file;
}

export async function recalculateAudiobookDuration(audiobookId: number): Promise<number> {
	// Get all files and calculate total duration
	const files = await db.query.audiobookFiles.findMany({
		where: eq(audiobookFiles.audiobookId, audiobookId),
		orderBy: [asc(audiobookFiles.trackNumber)]
	});

	let totalDuration = 0;
	let currentOffset = 0;

	// Update startOffset for each file
	for (const file of files) {
		await db.update(audiobookFiles)
			.set({ startOffset: currentOffset })
			.where(eq(audiobookFiles.id, file.id));

		currentOffset += file.duration;
		totalDuration += file.duration;
	}

	// Update audiobook duration
	await db.update(audiobooks)
		.set({ duration: totalDuration, updatedAt: new Date().toISOString() })
		.where(eq(audiobooks.id, audiobookId));

	return totalDuration;
}

export async function getAudiobookFileById(id: number): Promise<AudiobookFile | null> {
	const file = await db.query.audiobookFiles.findFirst({
		where: eq(audiobookFiles.id, id)
	});
	return file || null;
}

export async function deleteAudiobookFile(id: number): Promise<boolean> {
	const file = await getAudiobookFileById(id);
	if (!file) return false;

	// Delete physical file
	try {
		if (existsSync(file.filePath)) {
			unlinkSync(file.filePath);
		}
	} catch (e) {
		console.error('[audiobookService] Failed to delete file:', file.filePath, e);
	}

	// Delete from database
	await db.delete(audiobookFiles).where(eq(audiobookFiles.id, id));

	// Recalculate duration
	await recalculateAudiobookDuration(file.audiobookId);

	return true;
}

// ============================================================================
// Progress Tracking
// ============================================================================

export async function getOrCreateProgress(audiobookId: number, userId: number): Promise<AudiobookProgress> {
	// Try to get existing progress
	let progress = await db.query.audiobookProgress.findFirst({
		where: and(
			eq(audiobookProgress.audiobookId, audiobookId),
			eq(audiobookProgress.userId, userId)
		)
	});

	if (progress) return progress;

	// Get audiobook duration
	const audiobook = await db.query.audiobooks.findFirst({
		where: eq(audiobooks.id, audiobookId)
	});

	// Create new progress record
	const now = new Date().toISOString();
	const [newProgress] = await db.insert(audiobookProgress).values({
		audiobookId,
		userId,
		currentTime: 0,
		duration: audiobook?.duration || 0,
		progress: 0,
		playbackRate: 1,
		isFinished: false,
		createdAt: now,
		updatedAt: now
	}).returning();

	return newProgress;
}

export async function updateProgress(
	audiobookId: number,
	userId: number,
	currentTime: number,
	currentFileId?: number,
	playbackRate?: number
): Promise<AudiobookProgress> {
	const now = new Date().toISOString();

	// Get or create progress
	let progress = await getOrCreateProgress(audiobookId, userId);

	// Get audiobook duration
	const audiobook = await db.query.audiobooks.findFirst({
		where: eq(audiobooks.id, audiobookId)
	});
	const duration = audiobook?.duration || 1;

	// Calculate progress percentage
	const progressPercent = Math.min(currentTime / duration, 1);

	// Check if finished (>= 95% or within last 30 seconds)
	const isFinished = progressPercent >= 0.95 || (duration - currentTime) <= 30;

	// Update progress
	const updateData: Partial<AudiobookProgress> = {
		currentTime,
		progress: progressPercent,
		lastPlayedAt: now,
		updatedAt: now
	};

	if (currentFileId !== undefined) {
		updateData.currentFileId = currentFileId;
	}

	if (playbackRate !== undefined) {
		updateData.playbackRate = playbackRate;
	}

	if (isFinished && !progress.isFinished) {
		updateData.isFinished = true;
		updateData.finishedAt = now;
	}

	const [updated] = await db.update(audiobookProgress)
		.set(updateData)
		.where(eq(audiobookProgress.id, progress.id))
		.returning();

	return updated;
}

export async function markAsFinished(audiobookId: number, userId: number): Promise<AudiobookProgress> {
	const now = new Date().toISOString();
	let progress = await getOrCreateProgress(audiobookId, userId);

	const [updated] = await db.update(audiobookProgress)
		.set({
			isFinished: true,
			finishedAt: now,
			progress: 1,
			updatedAt: now
		})
		.where(eq(audiobookProgress.id, progress.id))
		.returning();

	return updated;
}

export async function resetProgress(audiobookId: number, userId: number): Promise<AudiobookProgress> {
	const now = new Date().toISOString();
	let progress = await getOrCreateProgress(audiobookId, userId);

	const [updated] = await db.update(audiobookProgress)
		.set({
			currentTime: 0,
			currentFileId: null,
			progress: 0,
			isFinished: false,
			finishedAt: null,
			updatedAt: now
		})
		.where(eq(audiobookProgress.id, progress.id))
		.returning();

	return updated;
}

// ============================================================================
// Chapters
// ============================================================================

export async function addChapter(data: NewAudiobookChapter): Promise<AudiobookChapter> {
	const now = new Date().toISOString();
	const [chapter] = await db.insert(audiobookChapters).values({
		...data,
		createdAt: now,
		updatedAt: now
	}).returning();

	return chapter;
}

export async function getChapters(audiobookId: number): Promise<AudiobookChapter[]> {
	return db.query.audiobookChapters.findMany({
		where: eq(audiobookChapters.audiobookId, audiobookId),
		orderBy: [asc(audiobookChapters.chapterNumber)]
	});
}

export async function deleteChapters(audiobookId: number): Promise<void> {
	await db.delete(audiobookChapters).where(eq(audiobookChapters.audiobookId, audiobookId));
}

// ============================================================================
// Bookmarks
// ============================================================================

export async function addBookmark(data: NewAudiobookBookmark): Promise<AudiobookBookmark> {
	const now = new Date().toISOString();
	const [bookmark] = await db.insert(audiobookBookmarks).values({
		...data,
		createdAt: now
	}).returning();

	return bookmark;
}

export async function getBookmarks(audiobookId: number, userId: number): Promise<AudiobookBookmark[]> {
	return db.query.audiobookBookmarks.findMany({
		where: and(
			eq(audiobookBookmarks.audiobookId, audiobookId),
			eq(audiobookBookmarks.userId, userId)
		),
		orderBy: [asc(audiobookBookmarks.time)]
	});
}

export async function deleteBookmark(id: number, userId: number): Promise<boolean> {
	const result = await db.delete(audiobookBookmarks)
		.where(and(
			eq(audiobookBookmarks.id, id),
			eq(audiobookBookmarks.userId, userId)
		));

	return true;
}

// ============================================================================
// Recently Played
// ============================================================================

export async function getRecentlyPlayed(userId: number, limit: number = 10): Promise<AudiobookWithFiles[]> {
	const recentProgress = await db.query.audiobookProgress.findMany({
		where: and(
			eq(audiobookProgress.userId, userId),
			sql`${audiobookProgress.lastPlayedAt} IS NOT NULL`
		),
		orderBy: [desc(audiobookProgress.lastPlayedAt)],
		limit
	});

	const audiobookIds = recentProgress.map(p => p.audiobookId);
	if (audiobookIds.length === 0) return [];

	const items: AudiobookWithFiles[] = [];
	for (const id of audiobookIds) {
		const audiobook = await getAudiobookById(id, userId);
		if (audiobook) {
			items.push(audiobook);
		}
	}

	return items;
}

// ============================================================================
// Continue Listening (in progress)
// ============================================================================

export async function getContinueListening(userId: number, limit: number = 10): Promise<AudiobookWithFiles[]> {
	const inProgress = await db.query.audiobookProgress.findMany({
		where: and(
			eq(audiobookProgress.userId, userId),
			sql`${audiobookProgress.progress} > 0`,
			eq(audiobookProgress.isFinished, false)
		),
		orderBy: [desc(audiobookProgress.lastPlayedAt)],
		limit
	});

	const items: AudiobookWithFiles[] = [];
	for (const progress of inProgress) {
		const audiobook = await getAudiobookById(progress.audiobookId, userId);
		if (audiobook) {
			items.push(audiobook);
		}
	}

	return items;
}

// ============================================================================
// Helper: Format Duration
// ============================================================================

export function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}m ${secs}s`;
}

export function formatDurationLong(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) {
		return `${hours} hr ${minutes} min`;
	}
	return `${minutes} min`;
}
