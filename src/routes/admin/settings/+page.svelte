<script lang="ts">
	import { Settings, FolderOpen, BookOpen, Monitor, Rss, Upload, Save, Check, AlertCircle, Loader2, Database, Sparkles, Eye, EyeOff } from 'lucide-svelte';

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

	// AI settings state
	let aiEnabled = $state(data.aiSettings.enabled);
	let aiApiKey = $state(data.aiSettings.apiKey || '');
	let aiModel = $state(data.aiSettings.model);
	let showApiKey = $state(false);
	let testingConnection = $state(false);
	let testResult = $state<{ success: boolean; message: string } | null>(null);
	let savingAI = $state(false);
	let aiSaveSuccess = $state(false);

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
		},
		metadata: {
			icon: Database,
			title: 'Metadata Providers',
			description: 'Configure book metadata lookup sources'
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

	async function testAIConnection() {
		if (!aiApiKey.trim()) {
			testResult = { success: false, message: 'Please enter an API key' };
			return;
		}

		testingConnection = true;
		testResult = null;

		try {
			const res = await fetch('/api/recommendations/ai/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ apiKey: aiApiKey })
			});

			const result = await res.json();
			testResult = {
				success: result.success,
				message: result.success ? 'Connection successful!' : result.error || 'Connection failed'
			};
		} catch {
			testResult = { success: false, message: 'Failed to test connection' };
		} finally {
			testingConnection = false;
		}
	}

	async function saveAISettings() {
		savingAI = true;
		aiSaveSuccess = false;

		try {
			const res = await fetch('/api/recommendations/ai/settings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					enabled: aiEnabled,
					apiKey: aiApiKey,
					model: aiModel
				})
			});

			if (!res.ok) {
				throw new Error('Failed to save');
			}

			aiSaveSuccess = true;
			setTimeout(() => aiSaveSuccess = false, 3000);
		} catch {
			saveError = 'Failed to save AI settings';
		} finally {
			savingAI = false;
		}
	}
</script>

<svelte:head>
	<title>System Settings - Admin - BookShelf</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold" style="color: var(--text-primary);">System Settings</h1>
			<p class="mt-1" style="color: var(--text-secondary);">Configure application-wide settings for all users</p>
		</div>

		{#if data.isAdmin}
			<button
				class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
				style="background: var(--accent); color: white;"
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
						<svelte:component this={info.icon} class="w-5 h-5" style="color: var(--accent);" />
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
									<button
										type="button"
										class="toggle-switch {editedSettings[setting.key] === 'true' ? 'active' : ''}"
										onclick={() => updateSetting(setting.key, editedSettings[setting.key] === 'true' ? 'false' : 'true')}
										disabled={!data.isAdmin}
										role="switch"
										aria-checked={editedSettings[setting.key] === 'true'}
									>
										<span class="toggle-knob"></span>
									</button>
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

		<!-- AI Recommendations Settings -->
		<div class="rounded-xl overflow-hidden" style="background: var(--bg-secondary);">
			<!-- Category Header -->
			<div class="p-4 border-b flex items-center justify-between" style="border-color: var(--border-color);">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #4f46e5, #7c3aed);">
						<Sparkles class="w-5 h-5 text-white" />
					</div>
					<div>
						<h2 class="text-lg font-semibold" style="color: var(--text-primary);">
							AI Recommendations
						</h2>
						<p class="text-sm" style="color: var(--text-muted);">Configure OpenAI-powered book suggestions</p>
					</div>
				</div>
				{#if data.isAdmin}
					<button
						class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
						style="background: var(--accent); color: white;"
						onclick={saveAISettings}
						disabled={savingAI}
					>
						{#if savingAI}
							<Loader2 class="w-4 h-4 animate-spin" />
							Saving...
						{:else if aiSaveSuccess}
							<Check class="w-4 h-4" />
							Saved!
						{:else}
							<Save class="w-4 h-4" />
							Save
						{/if}
					</button>
				{/if}
			</div>

			<!-- AI Settings -->
			<div class="divide-y" style="border-color: var(--border-color);">
				<!-- Enable Toggle -->
				<div class="p-4 flex items-start gap-4">
					<div class="flex-1">
						<label class="font-medium" style="color: var(--text-primary);">
							Enable AI Recommendations
						</label>
						<p class="text-sm mt-0.5" style="color: var(--text-muted);">
							Get personalized book recommendations powered by ChatGPT
						</p>
					</div>
					<div class="w-72">
						<button
							type="button"
							class="toggle-switch {aiEnabled ? 'active' : ''}"
							onclick={() => aiEnabled = !aiEnabled}
							disabled={!data.isAdmin}
							role="switch"
							aria-checked={aiEnabled}
						>
							<span class="toggle-knob"></span>
						</button>
					</div>
				</div>

				<!-- API Key -->
				<div class="p-4 flex items-start gap-4">
					<div class="flex-1">
						<label for="ai-api-key" class="font-medium" style="color: var(--text-primary);">
							OpenAI API Key
						</label>
						<p class="text-sm mt-0.5" style="color: var(--text-muted);">
							Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" class="underline" style="color: var(--accent);">platform.openai.com</a>
						</p>
					</div>
					<div class="w-72">
						<div class="relative">
							<input
								type={showApiKey ? 'text' : 'password'}
								id="ai-api-key"
								bind:value={aiApiKey}
								disabled={!data.isAdmin}
								placeholder="sk-..."
								class="w-full px-3 py-2 pr-20 rounded-lg text-sm font-mono"
								style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);"
							/>
							<div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
								<button
									type="button"
									class="p-1.5 rounded hover:bg-black/10"
									onclick={() => showApiKey = !showApiKey}
								>
									{#if showApiKey}
										<EyeOff class="w-4 h-4" style="color: var(--text-muted);" />
									{:else}
										<Eye class="w-4 h-4" style="color: var(--text-muted);" />
									{/if}
								</button>
							</div>
						</div>
						<button
							type="button"
							class="mt-2 text-sm px-3 py-1 rounded"
							style="background: var(--bg-tertiary); color: var(--text-secondary);"
							onclick={testAIConnection}
							disabled={testingConnection || !data.isAdmin}
						>
							{#if testingConnection}
								<Loader2 class="w-3 h-3 inline animate-spin mr-1" />
								Testing...
							{:else}
								Test Connection
							{/if}
						</button>
						{#if testResult}
							<p class="mt-2 text-sm" style="color: {testResult.success ? '#22c55e' : '#ef4444'};">
								{testResult.message}
							</p>
						{/if}
					</div>
				</div>

				<!-- Model Selection -->
				<div class="p-4 flex items-start gap-4">
					<div class="flex-1">
						<label for="ai-model" class="font-medium" style="color: var(--text-primary);">
							AI Model
						</label>
						<p class="text-sm mt-0.5" style="color: var(--text-muted);">
							Choose the OpenAI model for recommendations
						</p>
					</div>
					<div class="w-72">
						<select
							id="ai-model"
							bind:value={aiModel}
							disabled={!data.isAdmin}
							class="w-full px-3 py-2 rounded-lg text-sm"
							style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);"
						>
							<option value="gpt-4o-mini">GPT-4o Mini (Fastest, Cheapest)</option>
							<option value="gpt-4o">GPT-4o (Best Quality)</option>
							<option value="gpt-4-turbo">GPT-4 Turbo (High Quality)</option>
							<option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy)</option>
						</select>
					</div>
				</div>
			</div>
		</div>
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

<style>
	.toggle-switch {
		position: relative;
		width: 44px;
		height: 24px;
		border-radius: 12px;
		background: var(--bg-tertiary);
		border: none;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.toggle-switch:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toggle-switch.active {
		background: var(--accent);
	}

	.toggle-knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: white;
		transition: transform 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.toggle-switch.active .toggle-knob {
		transform: translateX(20px);
	}
</style>
