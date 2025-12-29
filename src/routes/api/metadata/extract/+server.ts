/**
 * API: /api/metadata/extract
 * Extract metadata from uploaded ebook or audiobook files
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseFile } from 'music-metadata';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { env } from '$env/dynamic/private';

// Temp directory for processing
function getTempDir(): string {
	const dataPath = env.DATA_PATH || './data';
	const tempDir = join(dataPath, 'temp');
	if (!existsSync(tempDir)) {
		mkdirSync(tempDir, { recursive: true });
	}
	return tempDir;
}

interface ExtractedMetadata {
	title?: string;
	author?: string;
	narrator?: string;
	description?: string;
	coverUrl?: string;
	isbn13?: string;
	isbn10?: string;
	publisher?: string;
	publishYear?: number;
	language?: string;
	duration?: number;
	fileType: 'ebook' | 'audiobook';
}

const EBOOK_EXTENSIONS = ['.epub', '.pdf', '.cbz'];
const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.m4b', '.aac', '.ogg', '.opus', '.flac', '.wav'];

function getFileExtension(filename: string): string {
	return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const file = formData.get('file') as File | null;

	if (!file) {
		throw error(400, 'No file provided');
	}

	const ext = getFileExtension(file.name);
	const isEbook = EBOOK_EXTENSIONS.includes(ext);
	const isAudio = AUDIO_EXTENSIONS.includes(ext);

	if (!isEbook && !isAudio) {
		throw error(400, 'Unsupported file type');
	}

	const metadata: ExtractedMetadata = {
		fileType: isEbook ? 'ebook' : 'audiobook'
	};

	try {
		if (isAudio) {
			// Extract metadata from audio file
			const tempDir = getTempDir();
			const tempPath = join(tempDir, `extract_${Date.now()}_${file.name}`);

			try {
				// Write file to temp location
				const buffer = Buffer.from(await file.arrayBuffer());
				writeFileSync(tempPath, buffer);

				// Parse audio metadata
				const audioMeta = await parseFile(tempPath);

				if (audioMeta.common) {
					metadata.title = audioMeta.common.title || audioMeta.common.album;
					metadata.author = audioMeta.common.artist || audioMeta.common.albumartist;

					// Handle comment which can be string or IComment object
					const comment = audioMeta.common.comment?.[0];
					if (comment) {
						metadata.description = typeof comment === 'string' ? comment : comment.text;
					}

					// For audiobooks, the "artist" is often the author, and "composer" might be narrator
					// Or in some cases, "artist" field might have "Author / Narrator" format
					const artist = audioMeta.common.artist || '';
					if (artist.includes('/')) {
						const parts = artist.split('/').map(s => s.trim());
						metadata.author = parts[0];
						if (parts[1]) metadata.narrator = parts[1];
					}

					// Check for dedicated narrator fields
					// composer can be string or string[]
					const composer = audioMeta.common.composer;
					if (composer) {
						const narratorValue = Array.isArray(composer) ? composer[0] : composer;
						metadata.narrator = metadata.narrator || narratorValue;
					}
				}

				if (audioMeta.format) {
					metadata.duration = audioMeta.format.duration;
				}

			} finally {
				// Clean up temp file
				try {
					unlinkSync(tempPath);
				} catch {
					// Ignore cleanup errors
				}
			}
		} else if (ext === '.epub') {
			// For EPUB, we'd need to parse the container.xml and content.opf
			// This is more complex - for now, try to extract from filename
			const filename = file.name.replace(/\.epub$/i, '');

			// Try to parse common filename patterns:
			// "Author - Title.epub"
			// "Title - Author.epub"
			// "Title (Series #1) - Author.epub"
			if (filename.includes(' - ')) {
				const parts = filename.split(' - ');
				if (parts.length >= 2) {
					// Assume "Author - Title" format
					metadata.author = parts[0].trim();
					metadata.title = parts.slice(1).join(' - ').trim();
				}
			} else {
				metadata.title = filename;
			}

			// TODO: Add proper EPUB parsing with jszip + xml parsing
			// For now, basic filename parsing is a reasonable fallback
		}

		return json(metadata);

	} catch (err) {
		console.error('[metadata/extract] Error extracting metadata:', err);
		// Return empty metadata rather than failing - user can fill in manually
		return json(metadata);
	}
};
