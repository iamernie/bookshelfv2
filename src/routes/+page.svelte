<script lang="ts">
	import { BookOpen, Users, Library, TrendingUp } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Dashboard | BookShelf</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-primary-100 rounded-lg">
					<BookOpen class="w-6 h-6 text-primary-600" />
				</div>
				<div>
					<p class="text-sm text-gray-500">Total Books</p>
					<p class="text-2xl font-bold text-gray-900">{data.stats.totalBooks}</p>
				</div>
			</div>
		</div>

		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-green-100 rounded-lg">
					<TrendingUp class="w-6 h-6 text-green-600" />
				</div>
				<div>
					<p class="text-sm text-gray-500">Read This Year</p>
					<p class="text-2xl font-bold text-gray-900">{data.stats.readThisYear}</p>
				</div>
			</div>
		</div>

		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-purple-100 rounded-lg">
					<Users class="w-6 h-6 text-purple-600" />
				</div>
				<div>
					<p class="text-sm text-gray-500">Authors</p>
					<p class="text-2xl font-bold text-gray-900">{data.stats.totalAuthors}</p>
				</div>
			</div>
		</div>

		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-orange-100 rounded-lg">
					<Library class="w-6 h-6 text-orange-600" />
				</div>
				<div>
					<p class="text-sm text-gray-500">Series</p>
					<p class="text-2xl font-bold text-gray-900">{data.stats.totalSeries}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Currently Reading -->
	{#if data.currentlyReading.length > 0}
		<section class="mb-8">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Currently Reading</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each data.currentlyReading as book}
					<a href="/books/{book.id}" class="card group hover:shadow-md transition-shadow">
						<div class="aspect-[2/3] bg-gray-100">
							{#if book.coverImageUrl}
								<img
									src={book.coverImageUrl}
									alt={book.title}
									class="w-full h-full object-cover"
								/>
							{:else}
								<div class="w-full h-full flex items-center justify-center text-gray-400">
									<BookOpen class="w-12 h-12" />
								</div>
							{/if}
						</div>
						<div class="p-3">
							<h3 class="font-medium text-gray-900 text-sm truncate group-hover:text-primary-600">
								{book.title}
							</h3>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Recently Added -->
	{#if data.recentlyAdded.length > 0}
		<section>
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Recently Added</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each data.recentlyAdded as book}
					<a href="/books/{book.id}" class="card group hover:shadow-md transition-shadow">
						<div class="aspect-[2/3] bg-gray-100">
							{#if book.coverImageUrl}
								<img
									src={book.coverImageUrl}
									alt={book.title}
									class="w-full h-full object-cover"
								/>
							{:else}
								<div class="w-full h-full flex items-center justify-center text-gray-400">
									<BookOpen class="w-12 h-12" />
								</div>
							{/if}
						</div>
						<div class="p-3">
							<h3 class="font-medium text-gray-900 text-sm truncate group-hover:text-primary-600">
								{book.title}
							</h3>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>
