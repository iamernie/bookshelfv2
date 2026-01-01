<script lang="ts">
	import {
		Loader2,
		RefreshCw,
		Users,
		BookOpen,
		Book,
		Merge,
		AlertTriangle,
		CheckCircle,
		XCircle,
		ChevronDown,
		ChevronRight,
		Trash2
	} from 'lucide-svelte';

	interface AuthorDuplicate {
		name: string;
		authors: { id: number; name: string; bookCount: number }[];
	}

	interface SeriesDuplicate {
		title: string;
		series: { id: number; title: string; bookCount: number }[];
	}

	interface BookDuplicate {
		title: string;
		books: { id: number; title: string; authorName: string | null; coverImageUrl: string | null }[];
	}

	let loading = $state({
		authors: false,
		series: false,
		books: false
	});

	let duplicates = $state({
		authors: [] as AuthorDuplicate[],
		series: [] as SeriesDuplicate[],
		books: [] as BookDuplicate[]
	});

	let expanded = $state({
		authors: new Set<string>(),
		series: new Set<string>(),
		books: new Set<string>()
	});

	let merging = $state<string | null>(null);
	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	async function loadAuthorDuplicates() {
		loading.authors = true;
		message = null;
		try {
			const res = await fetch('/api/authors/duplicates');
			const data = await res.json();
			if (data.success) {
				duplicates.authors = data.duplicates;
			}
		} catch {
			message = { type: 'error', text: 'Failed to load author duplicates' };
		} finally {
			loading.authors = false;
		}
	}

	async function loadSeriesDuplicates() {
		loading.series = true;
		message = null;
		try {
			const res = await fetch('/api/series/duplicates');
			const data = await res.json();
			if (data.success) {
				duplicates.series = data.duplicates;
			}
		} catch {
			message = { type: 'error', text: 'Failed to load series duplicates' };
		} finally {
			loading.series = false;
		}
	}

	async function loadBookDuplicates() {
		loading.books = true;
		message = null;
		try {
			const res = await fetch('/api/books/duplicates-all');
			const data = await res.json();
			if (data.success) {
				duplicates.books = data.duplicates;
			}
		} catch {
			message = { type: 'error', text: 'Failed to load book duplicates' };
		} finally {
			loading.books = false;
		}
	}

	async function loadAll() {
		await Promise.all([
			loadAuthorDuplicates(),
			loadSeriesDuplicates(),
			loadBookDuplicates()
		]);
	}

	function toggleExpand(type: 'authors' | 'series' | 'books', key: string) {
		if (expanded[type].has(key)) {
			expanded[type].delete(key);
		} else {
			expanded[type].add(key);
		}
		// Trigger reactivity
		expanded = { ...expanded };
	}

	async function mergeAuthors(targetId: number, sourceId: number, groupName: string) {
		merging = `author-${sourceId}`;
		message = null;
		try {
			const res = await fetch('/api/catalog/merge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'author', targetId, sourceId })
			});
			const data = await res.json();
			if (data.success) {
				message = { type: 'success', text: `Author merged successfully` };
				// Reload author duplicates
				await loadAuthorDuplicates();
			} else {
				message = { type: 'error', text: data.error || 'Merge failed' };
			}
		} catch {
			message = { type: 'error', text: 'Failed to merge authors' };
		} finally {
			merging = null;
		}
	}

	async function mergeSeries(targetId: number, sourceId: number, groupName: string) {
		merging = `series-${sourceId}`;
		message = null;
		try {
			const res = await fetch('/api/catalog/merge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'series', targetId, sourceId })
			});
			const data = await res.json();
			if (data.success) {
				message = { type: 'success', text: `Series merged successfully` };
				await loadSeriesDuplicates();
			} else {
				message = { type: 'error', text: data.error || 'Merge failed' };
			}
		} catch {
			message = { type: 'error', text: 'Failed to merge series' };
		} finally {
			merging = null;
		}
	}

	async function mergeBooks(targetId: number, sourceId: number, groupName: string) {
		merging = `book-${sourceId}`;
		message = null;
		try {
			const res = await fetch('/api/books/merge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetId, sourceId })
			});
			const data = await res.json();
			if (data.success) {
				message = { type: 'success', text: `Book merged successfully` };
				await loadBookDuplicates();
			} else {
				message = { type: 'error', text: data.error || 'Merge failed' };
			}
		} catch {
			message = { type: 'error', text: 'Failed to merge books' };
		} finally {
			merging = null;
		}
	}

	// Load data on mount
	$effect(() => {
		loadAll();
	});
</script>

<svelte:head>
	<title>Data Cleanup - BookShelf Admin</title>
</svelte:head>

<div class="p-6 max-w-6xl mx-auto">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold" style="color: var(--text-primary);">Data Cleanup</h1>
			<p style="color: var(--text-secondary);">Find and merge duplicate authors, series, and books</p>
		</div>

		<button
			class="btn-secondary flex items-center gap-2"
			onclick={loadAll}
			disabled={loading.authors || loading.series || loading.books}
		>
			{#if loading.authors || loading.series || loading.books}
				<Loader2 class="w-4 h-4 animate-spin" />
			{:else}
				<RefreshCw class="w-4 h-4" />
			{/if}
			Refresh All
		</button>
	</div>

	<!-- Message -->
	{#if message}
		<div
			class="mb-6 p-4 rounded-lg flex items-center gap-3 {message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}"
			style="border-width: 1px;"
		>
			{#if message.type === 'success'}
				<CheckCircle class="w-5 h-5" />
			{:else}
				<XCircle class="w-5 h-5" />
			{/if}
			{message.text}
		</div>
	{/if}

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
		<div class="card p-4">
			<div class="flex items-center gap-3 mb-2">
				<div class="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500">
					<Users class="w-5 h-5 text-white" />
				</div>
				<div>
					<h3 class="font-semibold" style="color: var(--text-primary);">Duplicate Authors</h3>
					<p class="text-sm" style="color: var(--text-secondary);">
						{#if loading.authors}
							Loading...
						{:else}
							{duplicates.authors.length} group(s) found
						{/if}
					</p>
				</div>
			</div>
		</div>

		<div class="card p-4">
			<div class="flex items-center gap-3 mb-2">
				<div class="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500">
					<BookOpen class="w-5 h-5 text-white" />
				</div>
				<div>
					<h3 class="font-semibold" style="color: var(--text-primary);">Duplicate Series</h3>
					<p class="text-sm" style="color: var(--text-secondary);">
						{#if loading.series}
							Loading...
						{:else}
							{duplicates.series.length} group(s) found
						{/if}
					</p>
				</div>
			</div>
		</div>

		<div class="card p-4">
			<div class="flex items-center gap-3 mb-2">
				<div class="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500">
					<Book class="w-5 h-5 text-white" />
				</div>
				<div>
					<h3 class="font-semibold" style="color: var(--text-primary);">Duplicate Books</h3>
					<p class="text-sm" style="color: var(--text-secondary);">
						{#if loading.books}
							Loading...
						{:else}
							{duplicates.books.length} group(s) found
						{/if}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Duplicate Authors -->
	<div class="card p-4 mb-6">
		<div class="flex items-center justify-between mb-4">
			<h3 class="font-semibold flex items-center gap-2" style="color: var(--text-primary);">
				<Users class="w-5 h-5" />
				Duplicate Authors
			</h3>
			<button
				class="btn-secondary text-sm flex items-center gap-2"
				onclick={loadAuthorDuplicates}
				disabled={loading.authors}
			>
				{#if loading.authors}
					<Loader2 class="w-4 h-4 animate-spin" />
				{:else}
					<RefreshCw class="w-4 h-4" />
				{/if}
			</button>
		</div>

		{#if loading.authors}
			<div class="flex items-center justify-center py-8">
				<Loader2 class="w-8 h-8 animate-spin" style="color: var(--accent);" />
			</div>
		{:else if duplicates.authors.length === 0}
			<div class="flex items-center gap-3 p-4 rounded-lg" style="background-color: var(--bg-tertiary);">
				<CheckCircle class="w-5 h-5 text-green-500" />
				<span style="color: var(--text-primary);">No duplicate authors found</span>
			</div>
		{:else}
			<div class="space-y-2">
				{#each duplicates.authors as group}
					<div class="rounded-lg" style="background-color: var(--bg-tertiary);">
						<button
							class="w-full p-3 flex items-center justify-between text-left"
							onclick={() => toggleExpand('authors', group.name)}
						>
							<div class="flex items-center gap-2">
								{#if expanded.authors.has(group.name)}
									<ChevronDown class="w-4 h-4" style="color: var(--text-muted);" />
								{:else}
									<ChevronRight class="w-4 h-4" style="color: var(--text-muted);" />
								{/if}
								<span class="font-medium" style="color: var(--text-primary);">{group.name}</span>
								<span class="text-sm px-2 py-0.5 rounded-full" style="background-color: var(--accent); color: white;">
									{group.authors.length}
								</span>
							</div>
						</button>

						{#if expanded.authors.has(group.name)}
							<div class="px-3 pb-3">
								<div class="space-y-2">
									{#each group.authors as author, i}
										<div class="flex items-center justify-between p-2 rounded" style="background-color: var(--bg-secondary);">
											<div>
												<span style="color: var(--text-primary);">{author.name}</span>
												<span class="text-sm ml-2" style="color: var(--text-muted);">
													({author.bookCount} book{author.bookCount !== 1 ? 's' : ''})
												</span>
												{#if i === 0}
													<span class="text-xs ml-2 px-2 py-0.5 rounded bg-green-500/20 text-green-400">Keep</span>
												{/if}
											</div>
											{#if i > 0}
												<button
													class="btn-accent text-sm flex items-center gap-1"
													onclick={() => mergeAuthors(group.authors[0].id, author.id, group.name)}
													disabled={merging !== null}
												>
													{#if merging === `author-${author.id}`}
														<Loader2 class="w-4 h-4 animate-spin" />
													{:else}
														<Merge class="w-4 h-4" />
													{/if}
													Merge into first
												</button>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Duplicate Series -->
	<div class="card p-4 mb-6">
		<div class="flex items-center justify-between mb-4">
			<h3 class="font-semibold flex items-center gap-2" style="color: var(--text-primary);">
				<BookOpen class="w-5 h-5" />
				Duplicate Series
			</h3>
			<button
				class="btn-secondary text-sm flex items-center gap-2"
				onclick={loadSeriesDuplicates}
				disabled={loading.series}
			>
				{#if loading.series}
					<Loader2 class="w-4 h-4 animate-spin" />
				{:else}
					<RefreshCw class="w-4 h-4" />
				{/if}
			</button>
		</div>

		{#if loading.series}
			<div class="flex items-center justify-center py-8">
				<Loader2 class="w-8 h-8 animate-spin" style="color: var(--accent);" />
			</div>
		{:else if duplicates.series.length === 0}
			<div class="flex items-center gap-3 p-4 rounded-lg" style="background-color: var(--bg-tertiary);">
				<CheckCircle class="w-5 h-5 text-green-500" />
				<span style="color: var(--text-primary);">No duplicate series found</span>
			</div>
		{:else}
			<div class="space-y-2">
				{#each duplicates.series as group}
					<div class="rounded-lg" style="background-color: var(--bg-tertiary);">
						<button
							class="w-full p-3 flex items-center justify-between text-left"
							onclick={() => toggleExpand('series', group.title)}
						>
							<div class="flex items-center gap-2">
								{#if expanded.series.has(group.title)}
									<ChevronDown class="w-4 h-4" style="color: var(--text-muted);" />
								{:else}
									<ChevronRight class="w-4 h-4" style="color: var(--text-muted);" />
								{/if}
								<span class="font-medium" style="color: var(--text-primary);">{group.title}</span>
								<span class="text-sm px-2 py-0.5 rounded-full" style="background-color: var(--accent); color: white;">
									{group.series.length}
								</span>
							</div>
						</button>

						{#if expanded.series.has(group.title)}
							<div class="px-3 pb-3">
								<div class="space-y-2">
									{#each group.series as s, i}
										<div class="flex items-center justify-between p-2 rounded" style="background-color: var(--bg-secondary);">
											<div>
												<span style="color: var(--text-primary);">{s.title}</span>
												<span class="text-sm ml-2" style="color: var(--text-muted);">
													({s.bookCount} book{s.bookCount !== 1 ? 's' : ''})
												</span>
												{#if i === 0}
													<span class="text-xs ml-2 px-2 py-0.5 rounded bg-green-500/20 text-green-400">Keep</span>
												{/if}
											</div>
											{#if i > 0}
												<button
													class="btn-accent text-sm flex items-center gap-1"
													onclick={() => mergeSeries(group.series[0].id, s.id, group.title)}
													disabled={merging !== null}
												>
													{#if merging === `series-${s.id}`}
														<Loader2 class="w-4 h-4 animate-spin" />
													{:else}
														<Merge class="w-4 h-4" />
													{/if}
													Merge into first
												</button>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Duplicate Books -->
	<div class="card p-4">
		<div class="flex items-center justify-between mb-4">
			<h3 class="font-semibold flex items-center gap-2" style="color: var(--text-primary);">
				<Book class="w-5 h-5" />
				Duplicate Books
			</h3>
			<button
				class="btn-secondary text-sm flex items-center gap-2"
				onclick={loadBookDuplicates}
				disabled={loading.books}
			>
				{#if loading.books}
					<Loader2 class="w-4 h-4 animate-spin" />
				{:else}
					<RefreshCw class="w-4 h-4" />
				{/if}
			</button>
		</div>

		{#if loading.books}
			<div class="flex items-center justify-center py-8">
				<Loader2 class="w-8 h-8 animate-spin" style="color: var(--accent);" />
			</div>
		{:else if duplicates.books.length === 0}
			<div class="flex items-center gap-3 p-4 rounded-lg" style="background-color: var(--bg-tertiary);">
				<CheckCircle class="w-5 h-5 text-green-500" />
				<span style="color: var(--text-primary);">No duplicate books found</span>
			</div>
		{:else}
			<div class="space-y-2">
				{#each duplicates.books as group}
					<div class="rounded-lg" style="background-color: var(--bg-tertiary);">
						<button
							class="w-full p-3 flex items-center justify-between text-left"
							onclick={() => toggleExpand('books', group.title)}
						>
							<div class="flex items-center gap-2">
								{#if expanded.books.has(group.title)}
									<ChevronDown class="w-4 h-4" style="color: var(--text-muted);" />
								{:else}
									<ChevronRight class="w-4 h-4" style="color: var(--text-muted);" />
								{/if}
								<span class="font-medium" style="color: var(--text-primary);">{group.title}</span>
								<span class="text-sm px-2 py-0.5 rounded-full" style="background-color: var(--accent); color: white;">
									{group.books.length}
								</span>
							</div>
						</button>

						{#if expanded.books.has(group.title)}
							<div class="px-3 pb-3">
								<div class="space-y-2">
									{#each group.books as book, i}
										<div class="flex items-center justify-between p-2 rounded" style="background-color: var(--bg-secondary);">
											<div class="flex items-center gap-3">
												{#if book.coverImageUrl}
													<img
														src={book.coverImageUrl}
														alt={book.title}
														class="w-10 h-14 object-cover rounded"
													/>
												{:else}
													<div class="w-10 h-14 rounded flex items-center justify-center" style="background-color: var(--bg-tertiary);">
														<Book class="w-5 h-5" style="color: var(--text-muted);" />
													</div>
												{/if}
												<div>
													<div style="color: var(--text-primary);">{book.title}</div>
													{#if book.authorName}
														<div class="text-sm" style="color: var(--text-muted);">by {book.authorName}</div>
													{/if}
													{#if i === 0}
														<span class="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">Keep</span>
													{/if}
												</div>
											</div>
											{#if i > 0}
												<button
													class="btn-accent text-sm flex items-center gap-1"
													onclick={() => mergeBooks(group.books[0].id, book.id, group.title)}
													disabled={merging !== null}
												>
													{#if merging === `book-${book.id}`}
														<Loader2 class="w-4 h-4 animate-spin" />
													{:else}
														<Merge class="w-4 h-4" />
													{/if}
													Merge into first
												</button>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Help Text -->
	<div class="mt-6 p-4 rounded-lg" style="background-color: var(--bg-tertiary);">
		<div class="flex items-start gap-3">
			<AlertTriangle class="w-5 h-5 text-yellow-500 mt-0.5" />
			<div>
				<h4 class="font-medium" style="color: var(--text-primary);">How Merging Works</h4>
				<p class="text-sm mt-1" style="color: var(--text-muted);">
					When you merge items, the first item in each group (marked "Keep") will be preserved.
					All books, relationships, and data from the merged item will be transferred to the kept item,
					then the merged item will be deleted. This action cannot be undone.
				</p>
			</div>
		</div>
	</div>
</div>
