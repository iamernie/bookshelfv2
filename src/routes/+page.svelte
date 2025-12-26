<script lang="ts">
	import { Users, Library, TrendingUp, BookOpen } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import BookCard from '$lib/components/book/BookCard.svelte';
	import type { BookCardData } from '$lib/types';

	let { data } = $props();

	function handleBookClick(book: BookCardData) {
		goto(`/books/${book.id}`);
	}
</script>

<svelte:head>
	<title>Dashboard | BookShelf</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-8" style="color: var(--text-primary);">Dashboard</h1>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-primary-100 rounded-lg">
					<BookOpen class="w-6 h-6 text-primary-600" />
				</div>
				<div>
					<p class="text-sm" style="color: var(--text-secondary);">Total Books</p>
					<p class="text-2xl font-bold" style="color: var(--text-primary);">{data.stats.totalBooks}</p>
				</div>
			</div>
		</div>

		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-green-100 rounded-lg">
					<TrendingUp class="w-6 h-6 text-green-600" />
				</div>
				<div>
					<p class="text-sm" style="color: var(--text-secondary);">Read This Year</p>
					<p class="text-2xl font-bold" style="color: var(--text-primary);">{data.stats.readThisYear}</p>
				</div>
			</div>
		</div>

		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-purple-100 rounded-lg">
					<Users class="w-6 h-6 text-purple-600" />
				</div>
				<div>
					<p class="text-sm" style="color: var(--text-secondary);">Authors</p>
					<p class="text-2xl font-bold" style="color: var(--text-primary);">{data.stats.totalAuthors}</p>
				</div>
			</div>
		</div>

		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-orange-100 rounded-lg">
					<Library class="w-6 h-6 text-orange-600" />
				</div>
				<div>
					<p class="text-sm" style="color: var(--text-secondary);">Series</p>
					<p class="text-2xl font-bold" style="color: var(--text-primary);">{data.stats.totalSeries}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Currently Reading -->
	{#if data.currentlyReading.length > 0}
		<section class="mb-8">
			<h2 class="text-xl font-semibold mb-4" style="color: var(--text-primary);">Currently Reading</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each data.currentlyReading as book}
					<BookCard {book} onClick={handleBookClick} showStatus={false} />
				{/each}
			</div>
		</section>
	{/if}

	<!-- Recently Added -->
	{#if data.recentlyAdded.length > 0}
		<section>
			<h2 class="text-xl font-semibold mb-4" style="color: var(--text-primary);">Recently Added</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each data.recentlyAdded as book}
					<BookCard {book} onClick={handleBookClick} />
				{/each}
			</div>
		</section>
	{/if}
</div>
