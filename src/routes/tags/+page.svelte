<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, Plus, Tag } from 'lucide-svelte';
	import TagCard from '$lib/components/tag/TagCard.svelte';
	import TagModal from '$lib/components/tag/TagModal.svelte';
	import { toasts } from '$lib/stores/toast';

	interface TagWithCount {
		id: number;
		name: string;
		color: string | null;
		icon: string | null;
		isSystem: boolean | null;
		bookCount: number;
		seriesCount: number;
		createdAt: string | null;
		updatedAt: string | null;
	}

	interface TagColor {
		name: string;
		value: string;
	}

	let tags = $state<TagWithCount[]>([]);
	let colors = $state<TagColor[]>([]);
	let loading = $state(true);
	let search = $state('');
	let total = $state(0);

	// Modal state
	let showModal = $state(false);
	let selectedTag = $state<TagWithCount | null>(null);
	let modalMode = $state<'view' | 'edit' | 'add'>('view');
	let tagBooks = $state<{ id: number; title: string; coverImageUrl: string | null }[]>([]);
	let tagSeries = $state<{ id: number; title: string }[]>([]);

	async function loadTags() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (search) params.set('search', search);

			const response = await fetch(`/api/tags?${params}`);
			if (!response.ok) throw new Error('Failed to load tags');

			const data = await response.json();
			tags = data.items;
			total = data.total;
			colors = data.colors;
		} catch (err) {
			console.error('Error loading tags:', err);
			toasts.error('Failed to load tags');
		} finally {
			loading = false;
		}
	}

	async function openTag(tag: TagWithCount) {
		try {
			const response = await fetch(`/api/tags/${tag.id}`);
			if (!response.ok) throw new Error('Failed to load tag');

			const data = await response.json();
			selectedTag = data.tag;
			tagBooks = data.books;
			tagSeries = data.series;
			colors = data.colors;
			modalMode = 'view';
			showModal = true;
		} catch (err) {
			console.error('Error loading tag:', err);
			toasts.error('Failed to load tag details');
		}
	}

	function openAddModal() {
		selectedTag = null;
		tagBooks = [];
		tagSeries = [];
		modalMode = 'add';
		showModal = true;
	}

	async function saveTag(data: { name?: string; color?: string; icon?: string | null }) {
		const isNew = modalMode === 'add';
		const url = isNew ? '/api/tags' : `/api/tags/${selectedTag?.id}`;
		const method = isNew ? 'POST' : 'PUT';

		const response = await fetch(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to save tag');
		}

		toasts.success(isNew ? 'Tag created' : 'Tag updated');
		await loadTags();
	}

	async function deleteTag() {
		if (!selectedTag) return;

		const response = await fetch(`/api/tags/${selectedTag.id}`, { method: 'DELETE' });

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to delete tag');
		}

		toasts.success('Tag deleted');
		await loadTags();
	}

	function handleSearch() {
		loadTags();
	}

	onMount(() => {
		loadTags();
	});
</script>

<svelte:head>
	<title>Tags - BookShelf</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
				<Tag class="w-7 h-7" />
				Tags
			</h1>
			<p class="text-gray-500 mt-1">{total} tags</p>
		</div>

		<button
			type="button"
			class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
			onclick={openAddModal}
		>
			<Plus class="w-5 h-5" />
			Add Tag
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
					placeholder="Search tags..."
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

	<!-- Tags Grid -->
	{#if loading}
		<div class="flex justify-center py-12">
			<div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if tags.length === 0}
		<div class="text-center py-12">
			<Tag class="w-12 h-12 text-gray-300 mx-auto mb-4" />
			<h3 class="text-lg font-medium text-gray-900 mb-2">No tags found</h3>
			<p class="text-gray-500 mb-4">
				{search ? 'Try a different search term' : 'Get started by creating your first tag'}
			</p>
			{#if !search}
				<button
					type="button"
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
					onclick={openAddModal}
				>
					<Plus class="w-5 h-5" />
					Add Tag
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each tags as tag (tag.id)}
				<TagCard {tag} onclick={() => openTag(tag)} />
			{/each}
		</div>
	{/if}
</div>

<!-- Tag Modal -->
{#if showModal}
	<TagModal
		tag={selectedTag}
		books={tagBooks}
		series={tagSeries}
		{colors}
		mode={modalMode}
		onClose={() => showModal = false}
		onSave={saveTag}
		onDelete={deleteTag}
	/>
{/if}
