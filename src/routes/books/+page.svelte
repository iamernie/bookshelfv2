<script lang="ts">
	import { BookOpen, Plus, Grid, List, Search } from 'lucide-svelte';
	import BookCard from '$components/book/BookCard.svelte';
	import Modal from '$components/ui/Modal.svelte';
	import type { BookCardData } from '$lib/types';

	let { data } = $props();

	let viewMode = $state<'grid' | 'list'>('grid');
	let searchQuery = $state('');
	let showAddModal = $state(false);
	let selectedBook = $state<BookCardData | null>(null);

	let filteredBooks = $derived(
		searchQuery
			? data.books.filter(book =>
				book.title.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: data.books
	);
</script>

<svelte:head>
	<title>Books | BookShelf</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
		<h1 class="text-3xl font-bold text-gray-900">Books</h1>

		<div class="flex items-center gap-2">
			<button class="btn-primary" onclick={() => showAddModal = true}>
				<Plus class="w-4 h-4" />
				Add Book
			</button>
		</div>
	</div>

	<!-- Filters Bar -->
	<div class="card p-4 mb-6">
		<div class="flex flex-col sm:flex-row gap-4">
			<!-- Search -->
			<div class="flex-1 relative">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
				<input
					type="text"
					placeholder="Search books..."
					class="input pl-10"
					bind:value={searchQuery}
				/>
			</div>

			<!-- View Toggle -->
			<div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
				<button
					class="p-2 rounded {viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}"
					onclick={() => viewMode = 'grid'}
				>
					<Grid class="w-4 h-4" />
				</button>
				<button
					class="p-2 rounded {viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}"
					onclick={() => viewMode = 'list'}
				>
					<List class="w-4 h-4" />
				</button>
			</div>
		</div>
	</div>

	<!-- Books Grid -->
	{#if filteredBooks.length > 0}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
			{#each filteredBooks as book (book.id)}
				<BookCard
					{book}
					onClick={(b) => selectedBook = b}
				/>
			{/each}
		</div>

		<!-- Pagination -->
		{#if data.totalPages > 1}
			<div class="flex justify-center gap-2 mt-8">
				{#each Array(data.totalPages) as _, i}
					<a
						href="?page={i + 1}"
						class="px-4 py-2 rounded-lg {data.currentPage === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						{i + 1}
					</a>
				{/each}
			</div>
		{/if}
	{:else}
		<div class="text-center py-12">
			<BookOpen class="w-16 h-16 text-gray-300 mx-auto mb-4" />
			<h3 class="text-lg font-medium text-gray-900 mb-2">No books found</h3>
			<p class="text-gray-500 mb-4">
				{searchQuery ? 'Try a different search term' : 'Get started by adding your first book'}
			</p>
			{#if !searchQuery}
				<button class="btn-primary" onclick={() => showAddModal = true}>
					<Plus class="w-4 h-4" />
					Add Book
				</button>
			{/if}
		</div>
	{/if}
</div>

<!-- Book Detail Modal -->
{#if selectedBook}
	<Modal
		open={true}
		title={selectedBook.title}
		size="lg"
		onClose={() => selectedBook = null}
	>
		<div class="p-6">
			<div class="flex gap-6">
				<!-- Cover -->
				<div class="w-48 flex-shrink-0">
					{#if selectedBook.coverImageUrl}
						<img
							src={selectedBook.coverImageUrl}
							alt={selectedBook.title}
							class="w-full rounded-lg shadow-md"
						/>
					{:else}
						<div class="w-full aspect-[2/3] bg-gray-100 rounded-lg flex items-center justify-center">
							<BookOpen class="w-16 h-16 text-gray-300" />
						</div>
					{/if}
				</div>

				<!-- Details -->
				<div class="flex-1">
					<h2 class="text-2xl font-bold text-gray-900 mb-2">{selectedBook.title}</h2>

					{#if selectedBook.authorName}
						<p class="text-gray-600 mb-4">by {selectedBook.authorName}</p>
					{/if}

					{#if selectedBook.summary}
						<div class="prose prose-sm max-w-none">
							<p>{selectedBook.summary}</p>
						</div>
					{/if}

					<div class="flex gap-3 mt-6">
						<a href="/books/{selectedBook.id}/edit" class="btn-primary">Edit</a>
						{#if selectedBook.ebookPath}
							<a href="/reader/{selectedBook.id}" class="btn-secondary">
								<BookOpen class="w-4 h-4" />
								Read
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</Modal>
{/if}
