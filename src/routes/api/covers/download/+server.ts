import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

const COVERS_DIR = 'static/covers';

// Ensure covers directory exists
async function ensureCoversDir() {
	if (!existsSync(COVERS_DIR)) {
		await mkdir(COVERS_DIR, { recursive: true });
	}
}

// Get file extension from URL or content type
function getExtension(url: string, contentType: string): string {
	// Try to get from URL
	const urlMatch = url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
	if (urlMatch) {
		return urlMatch[1].toLowerCase() === 'jpeg' ? 'jpg' : urlMatch[1].toLowerCase();
	}

	// Fall back to content type
	const typeMap: Record<string, string> = {
		'image/jpeg': 'jpg',
		'image/jpg': 'jpg',
		'image/png': 'png',
		'image/gif': 'gif',
		'image/webp': 'webp'
	};

	return typeMap[contentType] || 'jpg';
}

// Generate unique filename
function generateFilename(bookId: number | undefined, extension: string): string {
	const timestamp = Date.now();
	const random = randomBytes(8).toString('hex');
	if (bookId) {
		return `book_${bookId}_${timestamp}_${random}.${extension}`;
	}
	return `cover_${timestamp}_${random}.${extension}`;
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { url, bookId } = body as { url: string; bookId?: number };

	if (!url) {
		throw error(400, 'URL is required');
	}

	// Validate URL format
	let parsedUrl: URL;
	try {
		parsedUrl = new URL(url);
		if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
			throw new Error('Invalid protocol');
		}
	} catch {
		throw error(400, 'Invalid URL format');
	}

	try {
		// Fetch the image
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'BookShelf/2.0 (Book cover downloader)',
				'Accept': 'image/*'
			}
		});

		if (!response.ok) {
			throw error(400, `Failed to fetch image: ${response.statusText}`);
		}

		const contentType = response.headers.get('content-type') || 'image/jpeg';
		if (!contentType.startsWith('image/')) {
			throw error(400, 'URL does not point to an image');
		}

		// Get image data
		const buffer = Buffer.from(await response.arrayBuffer());

		// Check file size (max 10MB)
		if (buffer.length > 10 * 1024 * 1024) {
			throw error(400, 'Image file too large (max 10MB)');
		}

		// Generate filename and save
		await ensureCoversDir();
		const extension = getExtension(url, contentType);
		const filename = generateFilename(bookId, extension);
		const filepath = join(COVERS_DIR, filename);

		await writeFile(filepath, buffer);

		// Return the public path
		const coverPath = `/covers/${filename}`;

		return json({ success: true, coverPath });
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		console.error('Cover download error:', err);
		throw error(500, 'Failed to download cover image');
	}
};
