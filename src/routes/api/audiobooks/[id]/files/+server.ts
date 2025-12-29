import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname } from 'path';
import { env } from '$env/dynamic/private';
import {
	getAudiobookById,
	addAudiobookFile,
	extractAudioMetadata,
	getMimeType,
	isSupportedAudioFormat,
	extractAndSaveChapters
} from '$lib/server/services/audiobookService';
import { db } from '$lib/server/db';
import { audiobookFiles } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

function getAudiobooksBasePath(): string {
	const dataPath = env.DATA_PATH || './data';
	return join(dataPath, 'audiobooks');
}

function getAudiobookPath(userId: number, audiobookId: number): string {
	return join(getAudiobooksBasePath(), String(userId), String(audiobookId));
}

async function ensureAudiobookDir(userId: number, audiobookId: number): Promise<string> {
	const dir = getAudiobookPath(userId, audiobookId);
	if (!existsSync(dir)) {
		await mkdir(dir, { recursive: true });
	}
	return dir;
}

// GET /api/audiobooks/[id]/files - List files for audiobook
export const GET: RequestHandler = async ({ locals, params }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const audiobookId = parseInt(params.id);
	if (isNaN(audiobookId)) {
		throw error(400, 'Invalid audiobook ID');
	}

	const audiobook = await getAudiobookById(audiobookId);
	if (!audiobook) {
		throw error(404, 'Audiobook not found');
	}

	// Check ownership
	if (audiobook.userId !== user.id) {
		throw error(403, 'Access denied');
	}

	return json(audiobook.files);
};

// POST /api/audiobooks/[id]/files - Upload audio file(s)
export const POST: RequestHandler = async ({ locals, params, request }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const audiobookId = parseInt(params.id);
	if (isNaN(audiobookId)) {
		throw error(400, 'Invalid audiobook ID');
	}

	const audiobook = await getAudiobookById(audiobookId);
	if (!audiobook) {
		throw error(404, 'Audiobook not found');
	}

	// Check ownership
	if (audiobook.userId !== user.id) {
		throw error(403, 'Access denied');
	}

	try {
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];

		if (files.length === 0) {
			throw error(400, 'No files uploaded');
		}

		// Get current highest track number
		const existingFiles = await db.query.audiobookFiles.findMany({
			where: eq(audiobookFiles.audiobookId, audiobookId),
			orderBy: [desc(audiobookFiles.trackNumber)]
		});
		let trackNumber = (existingFiles[0]?.trackNumber || 0) + 1;

		const uploadedFiles = [];
		const dir = await ensureAudiobookDir(user.id, audiobookId);

		for (const file of files) {
			if (!isSupportedAudioFormat(file.name)) {
				console.warn(`[upload] Skipping unsupported file: ${file.name}`);
				continue;
			}

			// Generate safe filename
			const ext = extname(file.name);
			const safeFilename = `${String(trackNumber).padStart(3, '0')}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
			const filePath = join(dir, safeFilename);

			// Write file to disk
			const arrayBuffer = await file.arrayBuffer();
			await writeFile(filePath, Buffer.from(arrayBuffer));

			// Extract metadata (duration, etc.)
			const metadata = await extractAudioMetadata(filePath);

			// Add to database
			const dbFile = await addAudiobookFile({
				audiobookId,
				filename: file.name,
				filePath,
				fileSize: file.size,
				mimeType: getMimeType(file.name),
				trackNumber,
				title: metadata.title || file.name.replace(ext, ''),
				duration: metadata.duration
			});

			uploadedFiles.push(dbFile);
			trackNumber++;
		}

		// After all files are uploaded, extract and save chapters
		const chapters = await extractAndSaveChapters(audiobookId);

		return json({
			success: true,
			files: uploadedFiles,
			chapters,
			message: `Uploaded ${uploadedFiles.length} file(s)` + (chapters.length > 0 ? ` with ${chapters.length} chapter(s)` : '')
		}, { status: 201 });
	} catch (e) {
		console.error('[api/audiobooks/files] Failed to upload files:', e);
		throw error(500, 'Failed to upload files');
	}
};
