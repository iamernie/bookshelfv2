<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, Plus, Folder } from 'lucide-svelte';
	import GenreCard from '$lib/components/genre/GenreCard.svelte';
	import GenreModal from '$lib/components/genre/GenreModal.svelte';
	import { toasts } from '$lib/stores/toast';

	interface GenreWithStats {
		id: number;
		name: string;
		description: string | null;
		color: string | null;
		icon: string | null;
		displayOrder: number | null;
		slug: string | null;
		bookCount: number;
		avgRating: number | null;
		createdAt: string | null;
		updatedAt: string | null;
	}

	let genres = $state<GenreWithStats[]>([]);
	let loading = $state(true);
	let search = $state('');
	let total = $state(0);

	// Modal state
	let showModal = $state(false);
	let selectedGenre = $state<GenreWithStats | null>(null);
	let modalMode = $state<'view' | 'edit' | 'add'>('view');
	let genreBooks = $state<{ id: number; title: string; coverImageUrl: string | null; rating: number | null }[]>([]);

	async function loadGenres() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (search) params.set('search', search);

			const response = await fetch(`/api/genres?${params}`);
			if (!response.ok) throw new Error('Failed to load genres');

			const data = await response.json();
			genres = data.items;
			total = data.total;
		} catch (err) {
			console.error('Error loading genres:', err);
			toasts.error('Failed to load genres');
		} finally {
			loading = false;
		}
	}

	async function openGenre(genre: GenreWithStats) {
		try {
			const response = await fetch(`/api/genres/${genre.id}`);
			if (!response.ok) throw new Error('Failed to load genre');

			const data = await response.json();
			selectedGenre = data.genre;
			genreBooks = data.books;
			modalMode = 'view';
			showModal = true;
		} catch (err) {
			console.error('Error loading genre:', err);
			toasts.error('Failed to load genre details');
		}
	}

	function openAddModal() {
		selectedGenre = null;
		genreBooks = [];
		modalMode = 'add';
		showModal = true;
	}

	async function saveGenre(data: { name: string; description?: string | null; color?: string | null; icon?: string | null; displayOrder?: number }) {
		const isNew = modalMode === 'add';
		const url = isNew ? '/api/genres' : `/api/genres/${selectedGenre?.id}`;
		const method = isNew ? 'POST' : 'PUT';

		const response = await fetch(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to save genre');
		}

		toasts.success(isNew ? 'Genre created' : 'Genre updated');
		await loadGenres();
	}

	async function deleteGenre() {
		if (!selectedGenre) return;

		const response = await fetch(`/api/genres/${selectedGenre.id}`, { method: 'DELETE' });

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to delete genre');
		}

		toasts.success('Genre deleted');
		showModal = false;
		await loadGenres();
	}

	function handleSearch() {
		loadGenres();
	}

	onMount(() => {
		loadGenres();
	});
</script>

<svelte:head>
	<title>Genres - BookShelf</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
				<Folder class="w-7 h-7" />
				Genres
			</h1>
			<p class="text-gray-500 mt-1">{total} genres</p>
		</div>

		<button
			type="button"
			class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
			onclick={openAddModal}
		>
			<Plus class="w-5 h-5" />
			Add Genre
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
					placeholder="Search genres..."
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

	<!-- Genres Grid -->
	{#if loading}
		<div class="flex justify-center py-12">
			<div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if genres.length === 0}
		<div class="text-center py-12">
			<Folder class="w-12 h-12 text-gray-300 mx-auto mb-4" />
			<h3 class="text-lg font-medium text-gray-900 mb-2">No genres found</h3>
			<p class="text-gray-500 mb-4">
				{search ? 'Try a different search term' : 'Get started by creating your first genre'}
			</p>
			{#if !search}
				<button
					type="button"
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
					onclick={openAddModal}
				>
					<Plus class="w-5 h-5" />
					Add Genre
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each genres as genre (genre.id)}
				<GenreCard {genre} onclick={() => openGenre(genre)} />
			{/each}
		</div>
	{/if}
</div>

<!-- Genre Modal -->
{#if showModal}
	<GenreModal
		genre={selectedGenre}
		books={genreBooks}
		mode={modalMode}
		onClose={() => showModal = false}
		onSave={saveGenre}
		onDelete={deleteGenre}
	/>
{/if}
