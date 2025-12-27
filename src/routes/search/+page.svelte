<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		Search,
		BookOpen,
		Filter,
		X,
		ChevronDown,
		ChevronUp,
		ChevronLeft,
		ChevronRight,
		Star,
		Grid,
		List
	} from 'lucide-svelte';
	import BookCard from '$lib/components/book/BookCard.svelte';

	let { data } = $props();

	// Form state
	let title = $state(data.filters.title || '');
	let authorName = $state(data.filters.authorName || '');
	let seriesTitle = $state(data.filters.seriesTitle || '');
	let summaryComments = $state(data.filters.summaryComments || '');
	let statusId = $state(data.filters.statusId?.toString() || '');
	let genreId = $state(data.filters.genreId?.toString() || '');
	let formatId = $state(data.filters.formatId?.toString() || '');
	let seriesId = $state(data.filters.seriesId?.toString() || '');
	let selectedTagIds = $state<number[]>(data.filters.tagIds || []);
	let ratingMin = $state(data.filters.ratingMin?.toString() || '');
	let ratingMax = $state(data.filters.ratingMax?.toString() || '');
	let pagesMin = $state(data.filters.pagesMin?.toString() || '');
	let pagesMax = $state(data.filters.pagesMax?.toString() || '');
	let completedFrom = $state(data.filters.completedFrom || '');
	let completedTo = $state(data.filters.completedTo || '');
	let releaseFrom = $state(data.filters.releaseFrom || '');
	let releaseTo = $state(data.filters.releaseTo || '');
	let hasNarrator = $state(data.filters.hasNarrator || false);
	let hasRating = $state(data.filters.hasRating || false);
	let noRating = $state(data.filters.noRating || false);
	let hasCover = $state(data.filters.hasCover || false);
	let noCover = $state(data.filters.noCover || false);
	let sortBy = $state(data.filters.sortBy || 'title');

	// UI state
	let showAdvanced = $state(false);
	let viewMode = $state<'grid' | 'list'>('grid');

	function handleSearch() {
		const params = new URLSearchParams();

		if (title) params.set('title', title);
		if (authorName) params.set('author', authorName);
		if (seriesTitle) params.set('seriesTitle', seriesTitle);
		if (summaryComments) params.set('summary', summaryComments);
		if (statusId) params.set('status', statusId);
		if (genreId) params.set('genre', genreId);
		if (formatId) params.set('format', formatId);
		if (seriesId) params.set('series', seriesId);
		for (const tagId of selectedTagIds) {
			params.append('tag', tagId.toString());
		}
		if (ratingMin) params.set('ratingMin', ratingMin);
		if (ratingMax) params.set('ratingMax', ratingMax);
		if (pagesMin) params.set('pagesMin', pagesMin);
		if (pagesMax) params.set('pagesMax', pagesMax);
		if (completedFrom) params.set('completedFrom', completedFrom);
		if (completedTo) params.set('completedTo', completedTo);
		if (releaseFrom) params.set('releaseFrom', releaseFrom);
		if (releaseTo) params.set('releaseTo', releaseTo);
		if (hasNarrator) params.set('hasNarrator', '1');
		if (hasRating) params.set('hasRating', '1');
		if (noRating) params.set('noRating', '1');
		if (hasCover) params.set('hasCover', '1');
		if (noCover) params.set('noCover', '1');
		if (sortBy && sortBy !== 'title') params.set('sortBy', sortBy);

		goto(`/search?${params.toString()}`);
	}

	function clearFilters() {
		title = '';
		authorName = '';
		seriesTitle = '';
		summaryComments = '';
		statusId = '';
		genreId = '';
		formatId = '';
		seriesId = '';
		selectedTagIds = [];
		ratingMin = '';
		ratingMax = '';
		pagesMin = '';
		pagesMax = '';
		completedFrom = '';
		completedTo = '';
		releaseFrom = '';
		releaseTo = '';
		hasNarrator = false;
		hasRating = false;
		noRating = false;
		hasCover = false;
		noCover = false;
		sortBy = 'title';
		goto('/search');
	}

	function goToPage(pageNum: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', pageNum.toString());
		goto(`/search?${params.toString()}`);
	}

	function toggleTag(tagId: number) {
		if (selectedTagIds.includes(tagId)) {
			selectedTagIds = selectedTagIds.filter(id => id !== tagId);
		} else {
			selectedTagIds = [...selectedTagIds, tagId];
		}
	}

	let activeFilterCount = $derived(() => {
		let count = 0;
		if (title) count++;
		if (authorName) count++;
		if (seriesTitle) count++;
		if (summaryComments) count++;
		if (statusId) count++;
		if (genreId) count++;
		if (formatId) count++;
		if (seriesId) count++;
		if (selectedTagIds.length > 0) count++;
		if (ratingMin || ratingMax) count++;
		if (pagesMin || pagesMax) count++;
		if (completedFrom || completedTo) count++;
		if (releaseFrom || releaseTo) count++;
		if (hasNarrator || hasRating || noRating || hasCover || noCover) count++;
		return count;
	});
</script>

<svelte:head>
	<title>Advanced Search - BookShelf</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
			<Search class="w-7 h-7" />
			Advanced Search
		</h1>
		<p class="text-gray-500 mt-1">Find books using multiple criteria</p>
	</div>

	<!-- Search Form -->
	<form onsubmit={(e) => { e.preventDefault(); handleSearch(); }} class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
		<!-- Basic Search -->
		<div class="p-4 space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- Title -->
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
					<input
						id="title"
						type="text"
						placeholder="Search by title..."
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						bind:value={title}
					/>
				</div>

				<!-- Author -->
				<div>
					<label for="author" class="block text-sm font-medium text-gray-700 mb-1">Author</label>
					<input
						id="author"
						type="text"
						placeholder="Search by author..."
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						bind:value={authorName}
					/>
				</div>

				<!-- Status -->
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
					<select
						id="status"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						bind:value={statusId}
					>
						<option value="">Any status</option>
						{#each data.options.statuses as status}
							<option value={status.id.toString()}>{status.name}</option>
						{/each}
					</select>
				</div>

				<!-- Genre -->
				<div>
					<label for="genre" class="block text-sm font-medium text-gray-700 mb-1">Genre</label>
					<select
						id="genre"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						bind:value={genreId}
					>
						<option value="">Any genre</option>
						{#each data.options.genres as genre}
							<option value={genre.id.toString()}>{genre.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Search Buttons -->
			<div class="flex items-center gap-3">
				<button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
					<Search class="w-4 h-4" />
					Search
				</button>

				{#if activeFilterCount() > 0}
					<button type="button" class="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2" onclick={clearFilters}>
						<X class="w-4 h-4" />
						Clear ({activeFilterCount()})
					</button>
				{/if}

				<button
					type="button"
					class="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 ml-auto"
					onclick={() => showAdvanced = !showAdvanced}
				>
					<Filter class="w-4 h-4" />
					More Filters
					{#if showAdvanced}
						<ChevronUp class="w-4 h-4" />
					{:else}
						<ChevronDown class="w-4 h-4" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Advanced Filters -->
		{#if showAdvanced}
			<div class="border-t border-gray-200 p-4 space-y-6 bg-gray-50">
				<!-- Text Filters -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="seriesTitle" class="block text-sm font-medium text-gray-700 mb-1">Series Title</label>
						<input
							id="seriesTitle"
							type="text"
							placeholder="Search by series name..."
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							bind:value={seriesTitle}
						/>
					</div>

					<div>
						<label for="summary" class="block text-sm font-medium text-gray-700 mb-1">Summary / Comments</label>
						<input
							id="summary"
							type="text"
							placeholder="Search in summary or comments..."
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							bind:value={summaryComments}
						/>
					</div>
				</div>

				<!-- Dropdown Filters -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label for="format" class="block text-sm font-medium text-gray-700 mb-1">Format</label>
						<select
							id="format"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							bind:value={formatId}
						>
							<option value="">Any format</option>
							{#each data.options.formats as format}
								<option value={format.id.toString()}>{format.name}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="series" class="block text-sm font-medium text-gray-700 mb-1">Series</label>
						<select
							id="series"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							bind:value={seriesId}
						>
							<option value="">Any series</option>
							{#each data.options.series as s}
								<option value={s.id.toString()}>{s.title}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="sortBy" class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
						<select
							id="sortBy"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							bind:value={sortBy}
						>
							<option value="title">Title (A-Z)</option>
							<option value="title_desc">Title (Z-A)</option>
							<option value="rating">Rating (High to Low)</option>
							<option value="rating_asc">Rating (Low to High)</option>
							<option value="completedDate">Completed Date</option>
							<option value="releaseDate">Release Date</option>
							<option value="dateAdded">Date Added</option>
							<option value="pages">Page Count</option>
						</select>
					</div>
				</div>

				<!-- Range Filters -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Rating Range</label>
						<div class="flex items-center gap-2">
							<input
								type="number"
								placeholder="Min"
								min="0"
								max="5"
								step="0.1"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								bind:value={ratingMin}
							/>
							<span class="text-gray-400">-</span>
							<input
								type="number"
								placeholder="Max"
								min="0"
								max="5"
								step="0.1"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								bind:value={ratingMax}
							/>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
						<div class="flex items-center gap-2">
							<input
								type="number"
								placeholder="Min"
								min="0"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								bind:value={pagesMin}
							/>
							<span class="text-gray-400">-</span>
							<input
								type="number"
								placeholder="Max"
								min="0"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								bind:value={pagesMax}
							/>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Completed Date</label>
						<div class="flex items-center gap-2">
							<input
								type="date"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								bind:value={completedFrom}
							/>
							<span class="text-gray-400">-</span>
							<input
								type="date"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								bind:value={completedTo}
							/>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
						<div class="flex items-center gap-2">
							<input
								type="date"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								bind:value={releaseFrom}
							/>
							<span class="text-gray-400">-</span>
							<input
								type="date"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								bind:value={releaseTo}
							/>
						</div>
					</div>
				</div>

				<!-- Tags -->
				{#if data.options.tags.length > 0}
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
						<div class="flex flex-wrap gap-2">
							{#each data.options.tags as tag}
								<button
									type="button"
									class="px-3 py-1 rounded-full text-sm font-medium transition-colors border-2 {selectedTagIds.includes(tag.id) ? 'border-blue-500' : 'border-transparent'}"
									style="background-color: {tag.color || '#6c757d'}20; color: {tag.color || '#6c757d'}"
									onclick={() => toggleTag(tag.id)}
								>
									{tag.name}
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Boolean Filters -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Special Filters</label>
					<div class="flex flex-wrap gap-4">
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" bind:checked={hasNarrator} />
							<span class="text-sm text-gray-700">Has Narrator</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" bind:checked={hasRating} />
							<span class="text-sm text-gray-700">Has Rating</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" bind:checked={noRating} />
							<span class="text-sm text-gray-700">No Rating</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" bind:checked={hasCover} />
							<span class="text-sm text-gray-700">Has Cover</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" bind:checked={noCover} />
							<span class="text-sm text-gray-700">No Cover</span>
						</label>
					</div>
				</div>
			</div>
		{/if}
	</form>

	<!-- Results -->
	{#if data.searched}
		{#if data.results && data.results.items.length > 0}
			<!-- Results Header -->
			<div class="flex items-center justify-between mb-4">
				<p class="text-sm text-gray-600">
					{data.results.total} {data.results.total === 1 ? 'book' : 'books'} found
				</p>

				<!-- View Toggle -->
				<div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
					<button
						type="button"
						class="p-2 rounded {viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}"
						onclick={() => viewMode = 'grid'}
					>
						<Grid class="w-4 h-4" />
					</button>
					<button
						type="button"
						class="p-2 rounded {viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}"
						onclick={() => viewMode = 'list'}
					>
						<List class="w-4 h-4" />
					</button>
				</div>
			</div>

			<!-- Grid View -->
			{#if viewMode === 'grid'}
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
					{#each data.results.items as book (book.id)}
						<a href="/books?id={book.id}" class="block">
							<BookCard
								book={{
									id: book.id,
									title: book.title,
									coverImageUrl: book.coverImageUrl,
									rating: book.rating,
									authorName: book.authors[0]?.name || null,
									seriesName: book.series[0]?.title || null,
									bookNum: book.series[0]?.bookNum || null,
									status: book.status
								}}
								showStatus={true}
							/>
						</a>
					{/each}
				</div>
			{:else}
				<!-- List View -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
					{#each data.results.items as book (book.id)}
						<a
							href="/books?id={book.id}"
							class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
						>
							<!-- Cover -->
							<div class="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
								<img
									src={book.coverImageUrl || '/placeholder.png'}
									alt={book.title}
									class="w-full h-full object-cover"
									onerror={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
								/>
							</div>

							<!-- Info -->
							<div class="flex-1 min-w-0">
								<h3 class="font-medium text-gray-900 truncate">{book.title}</h3>
								<p class="text-sm text-gray-500 truncate">
									{#if book.authors.length > 0}
										{book.authors.map(a => a.name).join(', ')}
									{/if}
									{#if book.series.length > 0}
										<span class="text-gray-400">
											• {book.series[0].title}
											{#if book.series[0].bookNum}#{book.series[0].bookNum}{/if}
										</span>
									{/if}
								</p>
							</div>

							<!-- Status -->
							{#if book.status}
								<div
									class="px-2 py-1 rounded text-xs font-medium text-white flex-shrink-0"
									style="background-color: {book.status.color || '#6c757d'}"
								>
									{book.status.name}
								</div>
							{/if}

							<!-- Rating -->
							{#if book.rating}
								<div class="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
									<Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
									{book.rating.toFixed(1)}
								</div>
							{/if}
						</a>
					{/each}
				</div>
			{/if}

			<!-- Pagination -->
			{#if data.results.totalPages > 1}
				<div class="flex items-center justify-center gap-2 mt-8">
					<button
						type="button"
						class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={data.results.page <= 1}
						onclick={() => goToPage(data.results!.page - 1)}
					>
						<ChevronLeft class="w-5 h-5" />
					</button>

					<span class="px-4 py-2 text-sm text-gray-600">
						Page {data.results.page} of {data.results.totalPages}
					</span>

					<button
						type="button"
						class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={data.results.page >= data.results.totalPages}
						onclick={() => goToPage(data.results!.page + 1)}
					>
						<ChevronRight class="w-5 h-5" />
					</button>
				</div>
			{/if}
		{:else}
			<!-- No Results -->
			<div class="text-center py-12">
				<Search class="w-16 h-16 text-gray-300 mx-auto mb-4" />
				<h3 class="text-lg font-medium text-gray-900 mb-2">No books found</h3>
				<p class="text-gray-500 mb-4">Try adjusting your search criteria</p>
				<button
					type="button"
					class="px-4 py-2 text-blue-600 hover:text-blue-800"
					onclick={clearFilters}
				>
					Clear all filters
				</button>
			</div>
		{/if}
	{:else}
		<!-- No Search Yet -->
		<div class="text-center py-12">
			<Search class="w-16 h-16 text-gray-300 mx-auto mb-4" />
			<h3 class="text-lg font-medium text-gray-900 mb-2">Start your search</h3>
			<p class="text-gray-500">Use the filters above to find books in your library</p>
		</div>
	{/if}
</div>
