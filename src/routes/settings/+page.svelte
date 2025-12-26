<script lang="ts">
	import { Settings, FolderOpen, BookOpen, Monitor, Rss, Upload, Save, Check, AlertCircle, Loader2 } from 'lucide-svelte';

	interface Setting {
		key: string;
		value: string;
		type: string;
		category: string;
		label: string;
		description: string;
	}

	let { data } = $props();

	// Local copy of settings for editing
	let editedSettings = $state<Record<string, string>>({});
	let isSaving = $state(false);
	let saveSuccess = $state(false);
	let saveError = $state('');

	// Initialize edited settings from data
	$effect(() => {
		const initial: Record<string, string> = {};
		for (const category of Object.values(data.settings)) {
			for (const setting of category as Setting[]) {
				initial[setting.key] = setting.value;
			}
		}
		editedSettings = initial;
	});

	// Category display info
	const categoryInfo: Record<string, { icon: typeof Settings; title: string; description: string }> = {
		storage: {
			icon: FolderOpen,
			title: 'Storage',
			description: 'Configure where files are stored on the server'
		},
		library: {
			icon: BookOpen,
			title: 'Library',
			description: 'General library settings'
		},
		display: {
			icon: Monitor,
			title: 'Display',
			description: 'Customize how books are displayed'
		},
		opds: {
			icon: Rss,
			title: 'OPDS Catalog',
			description: 'Settings for the OPDS ebook catalog'
		},
		import: {
			icon: Upload,
			title: 'Import',
			description: 'Configure import behavior'
		}
	};

	function updateSetting(key: string, value: string) {
		editedSettings = { ...editedSettings, [key]: value };
	}

	async function saveSettings() {
		isSaving = true;
		saveSuccess = false;
		saveError = '';

		try {
			const response = await fetch('/api/settings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editedSettings)
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.message || 'Failed to save settings');
			}

			saveSuccess = true;
			setTimeout(() => saveSuccess = false, 3000);
		} catch (e) {
			saveError = e instanceof Error ? e.message : 'Failed to save settings';
		} finally {
			isSaving = false;
		}
	}

	function renderInput(setting: Setting) {
		const value = editedSettings[setting.key] ?? setting.value;

		if (setting.type === 'boolean') {
			return {
				type: 'checkbox',
				checked: value === 'true' || value === '1'
			};
		}

		if (setting.type === 'number') {
			return {
				type: 'number',
				value
			};
		}

		return {
			type: 'text',
			value
		};
	}
</script>

<svelte:head>
	<title>Settings - BookShelf</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold" style="color: var(--text-primary);">Settings</h1>
			<p class="mt-1" style="color: var(--text-secondary);">Configure your BookShelf installation</p>
		</div>

		{#if data.isAdmin}
			<button
				class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
				style="background: var(--accent-primary); color: white;"
				onclick={saveSettings}
				disabled={isSaving}
			>
				{#if isSaving}
					<Loader2 class="w-4 h-4 animate-spin" />
					Saving...
				{:else if saveSuccess}
					<Check class="w-4 h-4" />
					Saved!
				{:else}
					<Save class="w-4 h-4" />
					Save Changes
				{/if}
			</button>
		{/if}
	</div>

	{#if saveError}
		<div class="mb-6 p-4 rounded-lg flex items-center gap-2" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">
			<AlertCircle class="w-5 h-5" />
			{saveError}
		</div>
	{/if}

	{#if !data.isAdmin}
		<div class="mb-6 p-4 rounded-lg" style="background: rgba(234, 179, 8, 0.1); color: #eab308;">
			<div class="flex items-center gap-2">
				<AlertCircle class="w-5 h-5" />
				<span class="font-medium">View Only</span>
			</div>
			<p class="mt-1 text-sm">You need admin access to modify settings.</p>
		</div>
	{/if}

	<div class="space-y-8">
		{#each Object.entries(data.settings) as [category, settings]}
			{@const info = categoryInfo[category] || { icon: Settings, title: category, description: '' }}
			<div class="rounded-xl overflow-hidden" style="background: var(--bg-secondary);">
				<!-- Category Header -->
				<div class="p-4 border-b flex items-center gap-3" style="border-color: var(--border-color);">
					<div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: var(--bg-tertiary);">
						<svelte:component this={info.icon} class="w-5 h-5" style="color: var(--accent-primary);" />
					</div>
					<div>
						<h2 class="text-lg font-semibold" style="color: var(--text-primary);">
							{info.title}
						</h2>
						{#if info.description}
							<p class="text-sm" style="color: var(--text-muted);">{info.description}</p>
						{/if}
					</div>
				</div>

				<!-- Settings List -->
				<div class="divide-y" style="border-color: var(--border-color);">
					{#each settings as setting}
						{@const inputProps = renderInput(setting)}
						<div class="p-4 flex items-start gap-4">
							<div class="flex-1">
								<label for={setting.key} class="font-medium" style="color: var(--text-primary);">
									{setting.label}
								</label>
								<p class="text-sm mt-0.5" style="color: var(--text-muted);">
									{setting.description}
								</p>
							</div>
							<div class="w-72">
								{#if setting.type === 'boolean'}
									<label class="relative inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											id={setting.key}
											checked={editedSettings[setting.key] === 'true'}
											onchange={(e) => updateSetting(setting.key, (e.target as HTMLInputElement).checked ? 'true' : 'false')}
											disabled={!data.isAdmin}
											class="sr-only peer"
										/>
										<div
											class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all"
											style="background: {editedSettings[setting.key] === 'true' ? 'var(--accent-primary)' : 'var(--bg-tertiary)'}; after:background: white;"
										></div>
									</label>
								{:else}
									<input
										type={inputProps.type}
										id={setting.key}
										value={editedSettings[setting.key] ?? setting.value}
										oninput={(e) => updateSetting(setting.key, (e.target as HTMLInputElement).value)}
										disabled={!data.isAdmin}
										class="w-full px-3 py-2 rounded-lg text-sm"
										style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);"
									/>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Info Section -->
	<div class="mt-8 p-4 rounded-lg" style="background: var(--bg-secondary);">
		<h3 class="font-medium mb-2" style="color: var(--text-primary);">About Storage Paths</h3>
		<p class="text-sm" style="color: var(--text-muted);">
			Storage paths can be absolute (starting with /) or relative to the application root.
			When changing storage paths, existing files will NOT be automatically moved.
			Make sure the new directories exist and the application has write permissions.
		</p>
		<div class="mt-3 grid grid-cols-2 gap-4 text-sm">
			<div>
				<span class="font-medium" style="color: var(--text-secondary);">Default Covers Path:</span>
				<code class="ml-2 px-2 py-0.5 rounded" style="background: var(--bg-tertiary); color: var(--text-primary);">./static/covers</code>
			</div>
			<div>
				<span class="font-medium" style="color: var(--text-secondary);">Default Ebooks Path:</span>
				<code class="ml-2 px-2 py-0.5 rounded" style="background: var(--bg-tertiary); color: var(--text-primary);">./static/ebooks</code>
			</div>
		</div>
	</div>

	<!-- Path Pattern Examples -->
	<div class="mt-4 p-4 rounded-lg" style="background: var(--bg-secondary);">
		<h3 class="font-medium mb-2" style="color: var(--text-primary);">Path Pattern Examples</h3>
		<p class="text-sm mb-3" style="color: var(--text-muted);">
			Use placeholders to organize files into subdirectories. Available placeholders:
		</p>
		<div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
			<div><code class="px-1.5 py-0.5 rounded" style="background: var(--bg-tertiary); color: var(--accent);">{'{author}'}</code> - Author name</div>
			<div><code class="px-1.5 py-0.5 rounded" style="background: var(--bg-tertiary); color: var(--accent);">{'{series}'}</code> - Series name</div>
			<div><code class="px-1.5 py-0.5 rounded" style="background: var(--bg-tertiary); color: var(--accent);">{'{title}'}</code> - Book title</div>
			<div><code class="px-1.5 py-0.5 rounded" style="background: var(--bg-tertiary); color: var(--accent);">{'{format}'}</code> - File format (EPUB, PDF)</div>
			<div><code class="px-1.5 py-0.5 rounded" style="background: var(--bg-tertiary); color: var(--accent);">{'{filename}'}</code> - Original filename</div>
		</div>
		<div class="space-y-2 text-sm">
			<p style="color: var(--text-secondary);">Example patterns:</p>
			<div class="pl-4 space-y-1" style="color: var(--text-muted);">
				<div><code class="px-1.5 py-0.5 rounded" style="background: var(--bg-tertiary);">{'{author}/{title}/{filename}'}</code> - Organize by author, then title</div>
				<div><code class="px-1.5 py-0.5 rounded" style="background: var(--bg-tertiary);">{'{author}/{series}/{filename}'}</code> - Organize by author and series</div>
				<div><code class="px-1.5 py-0.5 rounded" style="background: var(--bg-tertiary);">{'{format}/{author}/{filename}'}</code> - Organize by format first</div>
				<div><code class="px-1.5 py-0.5 rounded" style="background: var(--bg-tertiary);">{'{filename}'}</code> - Flat structure (default)</div>
			</div>
		</div>
	</div>
</div>
