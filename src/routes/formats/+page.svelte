<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Search, Plus, Disc } from 'lucide-svelte';
	import FormatCard from '$lib/components/format/FormatCard.svelte';
	import FormatModal from '$lib/components/format/FormatModal.svelte';
	import { toasts } from '$lib/stores/toast';

	interface FormatWithCount {
		id: number;
		name: string;
		icon?: string | null;
		color?: string | null;
		bookCount: number;
		createdAt: string | null;
		updatedAt: string | null;
	}

	let formats = $state<FormatWithCount[]>([]);
	let loading = $state(true);
	let search = $state('');
	let total = $state(0);

	// Modal state - only for adding new formats
	let showAddModal = $state(false);

	async function loadFormats() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (search) params.set('search', search);

			const response = await fetch(`/api/formats?${params}`);
			if (!response.ok) throw new Error('Failed to load formats');

			const data = await response.json();
			formats = data.items;
			total = data.total;
		} catch (err) {
			console.error('Error loading formats:', err);
			toasts.error('Failed to load formats');
		} finally {
			loading = false;
		}
	}

	function openFormat(format: FormatWithCount) {
		// Navigate to the edit page instead of modal
		const returnUrl = encodeURIComponent($page.url.pathname + $page.url.search);
		goto(`/formats/${format.id}/edit?returnTo=${returnUrl}`);
	}

	function openAddModal() {
		showAddModal = true;
	}

	async function saveNewFormat(data: { name: string; icon?: string; color?: string }) {
		const response = await fetch('/api/formats', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to save format');
		}

		toasts.success('Format created');
		showAddModal = false;
		await loadFormats();
	}

	function handleSearch() {
		loadFormats();
	}

	onMount(() => {
		loadFormats();
	});
</script>

<svelte:head>
	<title>Formats - BookShelf</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
				<Disc class="w-7 h-7" />
				Formats
			</h1>
			<p class="text-gray-500 mt-1">{total} formats</p>
		</div>

		<button
			type="button"
			class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
			onclick={openAddModal}
		>
			<Plus class="w-5 h-5" />
			Add Format
		</button>
	</div>

	<!-- Search -->
	<div class="mb-6">
		<form onsubmit={(e) => { e.preventDefault(); handleSearch(); }} class="flex gap-2">
			<div class="relative flex-1 max-w-md">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
				<input
					type="text"
					bind:value={search}
					placeholder="Search formats..."
					class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
			<button
				type="submit"
				class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
			>
				Search
			</button>
		</form>
	</div>

	<!-- Formats Grid -->
	{#if loading}
		<div class="flex justify-center py-12">
			<div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if formats.length === 0}
		<div class="text-center py-12">
			<Disc class="w-12 h-12 text-gray-300 mx-auto mb-4" />
			<h3 class="text-lg font-medium text-gray-900 mb-2">No formats found</h3>
			<p class="text-gray-500 mb-4">
				{search ? 'Try a different search term' : 'Get started by creating your first format'}
			</p>
			{#if !search}
				<button
					type="button"
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
					onclick={openAddModal}
				>
					<Plus class="w-5 h-5" />
					Add Format
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each formats as format (format.id)}
				<FormatCard {format} onclick={() => openFormat(format)} />
			{/each}
		</div>
	{/if}
</div>

<!-- Format Modal - only for adding -->
{#if showAddModal}
	<FormatModal
		format={null}
		books={[]}
		allFormats={formats}
		mode="add"
		onClose={() => showAddModal = false}
		onSave={saveNewFormat}
	/>
{/if}
