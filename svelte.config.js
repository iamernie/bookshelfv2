import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$components: 'src/lib/components',
			$server: 'src/lib/server',
			$stores: 'src/lib/stores',
			$types: 'src/lib/types'
		},
		// Disable CSRF origin check for self-hosted deployments
		// Users may access via different origins (IP, hostname, reverse proxy)
		// API routes are protected by session authentication
		csrf: {
			checkOrigin: false
		}
	}
};

export default config;
