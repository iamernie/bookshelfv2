<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Search, Plus, Mic } from 'lucide-svelte';
	import NarratorCard from '$lib/components/narrator/NarratorCard.svelte';
	import NarratorModal from '$lib/components/narrator/NarratorModal.svelte';
	import { toasts } from '$lib/stores/toast';

	interface NarratorWithStats {
		id: number;
		name: string;
		bio: string | null;
		url: string | null;
		bookCount: number;
		avgRating: number | null;
		createdAt: string | null;
		updatedAt: string | null;
	}

	let narrators = $state<NarratorWithStats[]>([]);
	let loading = $state(true);
	let search = $state('');
	let total = $state(0);

	// Modal state - only for adding new narrators
	let showAddModal = $state(false);

	async function loadNarrators() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (search) params.set('search', search);

			const response = await fetch(`/api/narrators?${params}`);
			if (!response.ok) throw new Error('Failed to load narrators');

			const data = await response.json();
			narrators = data.items;
			total = data.total;
		} catch (err) {
			console.error('Error loading narrators:', err);
			toasts.error('Failed to load narrators');
		} finally {
			loading = false;
		}
	}

	function openNarrator(narrator: NarratorWithStats) {
		// Navigate to the edit page instead of modal
		const returnUrl = encodeURIComponent($page.url.pathname + $page.url.search);
		goto(`/narrators/${narrator.id}/edit?returnTo=${returnUrl}`);
	}

	function openAddModal() {
		showAddModal = true;
	}

	async function saveNewNarrator(data: { name: string; bio?: string | null; url?: string | null }) {
		const response = await fetch('/api/narrators', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to save narrator');
		}

		toasts.success('Narrator created');
		showAddModal = false;
		await loadNarrators();
	}

	function handleSearch() {
		loadNarrators();
	}

	onMount(() => {
		loadNarrators();
	});
</script>

<svelte:head>
	<title>Narrators - BookShelf</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
				<Mic class="w-7 h-7" />
				Narrators
			</h1>
			<p class="text-gray-500 mt-1">{total} narrators</p>
		</div>

		<button
			type="button"
			class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
			onclick={openAddModal}
		>
			<Plus class="w-5 h-5" />
			Add Narrator
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
					placeholder="Search narrators..."
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

	<!-- Narrators Grid -->
	{#if loading}
		<div class="flex justify-center py-12">
			<div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if narrators.length === 0}
		<div class="text-center py-12">
			<Mic class="w-12 h-12 text-gray-300 mx-auto mb-4" />
			<h3 class="text-lg font-medium text-gray-900 mb-2">No narrators found</h3>
			<p class="text-gray-500 mb-4">
				{search ? 'Try a different search term' : 'Get started by creating your first narrator'}
			</p>
			{#if !search}
				<button
					type="button"
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
					onclick={openAddModal}
				>
					<Plus class="w-5 h-5" />
					Add Narrator
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each narrators as narrator (narrator.id)}
				<NarratorCard {narrator} onclick={() => openNarrator(narrator)} />
			{/each}
		</div>
	{/if}
</div>

<!-- Narrator Modal - only for adding -->
{#if showAddModal}
	<NarratorModal
		narrator={null}
		books={[]}
		mode="add"
		onClose={() => showAddModal = false}
		onSave={saveNewNarrator}
	/>
{/if}
