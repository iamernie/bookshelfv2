// Application configuration
// Version and copyright info used across the app

// Import version from package.json (resolved at build time via Vite)
import { version } from '../../../package.json';

export const APP_CONFIG = {
	name: 'BookShelf',
	version,
	copyright: {
		owner: 'Ernie',
		year: 2026
	},
	// Formatted strings for display
	get versionString() {
		return `v${this.version}`;
	},
	get copyrightString() {
		return `${this.copyright.year} ${this.copyright.owner}`;
	}
};
