// Application configuration
// Version and copyright info used across the app

export const APP_CONFIG = {
	name: 'BookShelf',
	version: '0.4.1',
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
