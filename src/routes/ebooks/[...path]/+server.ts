import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { existsSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';

// MIME types for ebook files
const MIME_TYPES: Record<string, string> = {
	'.epub': 'application/epub+zip',
	'.pdf': 'application/pdf',
	'.mobi': 'application/x-mobipocket-ebook',
	'.azw': 'application/vnd.amazon.ebook',
	'.azw3': 'application/vnd.amazon.ebook',
	'.cbz': 'application/vnd.comicbook+zip',
	'.cbr': 'application/vnd.comicbook-rar'
};

/**
 * Serve ebook files from static/ebooks directory
 * This is needed because adapter-node bundles static files at build time,
 * but ebooks are mounted at runtime via Docker volumes.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	// Require authentication to access ebooks
	if (!locals.user) {
		throw error(401, 'Authentication required');
	}

	const requestedPath = params.path;

	if (!requestedPath) {
		throw error(400, 'No path specified');
	}

	// Sanitize path to prevent directory traversal
	const sanitizedPath = requestedPath.replace(/\.\./g, '').replace(/\/+/g, '/');

	// Build the full file path
	const ebooksDir = join(process.cwd(), 'static', 'ebooks');
	const filePath = join(ebooksDir, sanitizedPath);

	// Security check: ensure the resolved path is within ebooks directory
	if (!filePath.startsWith(ebooksDir)) {
		throw error(403, 'Access denied');
	}

	// Check if file exists
	if (!existsSync(filePath)) {
		throw error(404, 'Ebook not found');
	}

	// Get file stats
	const stats = statSync(filePath);

	// Determine MIME type
	const ext = extname(filePath).toLowerCase();
	const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

	// Read and return the file
	const fileBuffer = readFileSync(filePath);

	return new Response(fileBuffer, {
		headers: {
			'Content-Type': mimeType,
			'Content-Length': stats.size.toString(),
			'Cache-Control': 'private, max-age=3600'
		}
	});
};
