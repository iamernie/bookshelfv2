<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import {
		BookOpen,
		ArrowLeft,
		Edit,
		Trash2,
		Star,
		Hash,
		User,
		Tag,
		Download,
		ExternalLink,
		FileText,
		Pencil,
		Check,
		Info,
		Search,
		Sparkles,
		Calendar,
		BookMarked,
		Globe,
		Library
	} from 'lucide-svelte';
	import { toasts } from '$lib/stores/toast';
	import { formatDate } from '$lib/utils/date';
	import DynamicIcon from '$lib/components/ui/DynamicIcon.svelte';
	import LucideIcon from '$lib/components/ui/LucideIcon.svelte';

	let { data } = $props();

	// Tab state
	let activeTab = $state<'details' | 'similar'>('details');

	let showDeleteConfirm = $state(false);
	let permanentDelete = $state(false);

	// Derived: is this a public library book?
	const isPublicLibraryBook = $derived(data.book.libraryType === 'public');

	// Inline editing state
	let editingSummary = $state(false);
	let editingNotes = $state(false);
	let editingSeriesNotes = $state<number | null>(null); // series ID being edited
	let savingSummary = $state(false);
	let savingNotes = $state(false);
	let savingSeriesNotes = $state(false);

	// Local editable copies
	let editSummaryValue = $state('');
	let editNotesValue = $state('');
	let editSeriesNotesValue = $state('');

	// Initialize edit values when editing starts
	function startEditSummary() {
		editSummaryValue = data.book.summary || '';
		editingSummary = true;
	}

	function startEditNotes() {
		editNotesValue = data.book.comments || '';
		editingNotes = true;
	}

	function startEditSeriesNotes(seriesId: number, currentNotes: string | null) {
		editSeriesNotesValue = currentNotes || '';
		editingSeriesNotes = seriesId;
	}

	async function saveSummary() {
		savingSummary = true;
		try {
			const res = await fetch(`/api/books/${data.book.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ summary: editSummaryValue })
			});
			if (res.ok) {
				toasts.success('Summary saved');
				editingSummary = false;
				invalidateAll();
			} else {
				const err = await res.json();
				toasts.error(err.message || 'Failed to save summary');
			}
		} finally {
			savingSummary = false;
		}
	}

	async function saveNotes() {
		savingNotes = true;
		try {
			const res = await fetch(`/api/books/${data.book.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ comments: editNotesValue })
			});
			if (res.ok) {
				toasts.success('Notes saved');
				editingNotes = false;
				invalidateAll();
			} else {
				const err = await res.json();
				toasts.error(err.message || 'Failed to save notes');
			}
		} finally {
			savingNotes = false;
		}
	}

	function cancelSummaryEdit() {
		editingSummary = false;
	}

	function cancelNotesEdit() {
		editingNotes = false;
	}

	async function saveSeriesNotes() {
		if (editingSeriesNotes === null) return;
		savingSeriesNotes = true;
		try {
			const res = await fetch(`/api/series/${editingSeriesNotes}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ comments: editSeriesNotesValue })
			});
			if (res.ok) {
				toasts.success('Series notes saved');
				editingSeriesNotes = null;
				invalidateAll();
			} else {
				const err = await res.json();
				toasts.error(err.message || 'Failed to save series notes');
			}
		} finally {
			savingSeriesNotes = false;
		}
	}

	function cancelSeriesNotesEdit() {
		editingSeriesNotes = null;
	}

	async function handleDelete() {
		// For public library books, admin can choose to permanently delete
		const url = permanentDelete
			? `/api/books/${data.book.id}?permanent=true`
			: `/api/books/${data.book.id}`;

		const res = await fetch(url, {
			method: 'DELETE'
		});
		if (res.ok) {
			const result = await res.json();
			if (result.action === 'removed_from_library') {
				toasts.success('Removed from your library');
			} else {
				toasts.success('Book deleted');
			}
			goto('/books');
		} else {
			const err = await res.json();
			toasts.error(err.message || 'Failed to delete book');
		}
	}


	function formatSeriesNumber(s: { bookNum: number | null; bookNumEnd: number | null }): string {
		if (!s.bookNum) return '';
		if (s.bookNumEnd) return `#${s.bookNum}-${s.bookNumEnd}`;
		return `#${s.bookNum}`;
	}
</script>

<svelte:head>
	<title>{data.book.title} - BookShelf</title>
</svelte:head>

<div class="min-h-full" style="background-color: var(--bg-primary);">
	<!-- Header -->
	<div class="sticky top-0 z-10 px-6 py-4" style="background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
		<div class="max-w-6xl mx-auto flex items-center justify-between">
			<button
				type="button"
				class="flex items-center gap-2 transition-colors"
				style="color: var(--text-secondary);"
				onclick={() => goto('/books')}
				onmouseenter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
				onmouseleave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
			>
				<ArrowLeft class="w-5 h-5" />
				<span>Back to Books</span>
			</button>

			<div class="flex items-center gap-2">
				{#if data.book.ebookPath}
					<a
						href="/reader/{data.book.id}"
						class="btn-accent flex items-center gap-2"
					>
						<BookOpen class="w-4 h-4" />
						Read
					</a>
				{/if}
				<a
					href="/books/{data.book.id}/edit"
					class="btn-ghost flex items-center gap-2"
				>
					<Edit class="w-4 h-4" />
					Edit
				</a>
				<button
					type="button"
					class="btn-ghost flex items-center gap-2"
					style="color: var(--text-muted);"
					onclick={() => showDeleteConfirm = true}
				>
					<Trash2 class="w-4 h-4" />
				</button>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="max-w-6xl mx-auto px-6 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Left Column: Cover + Quick Info -->
			<div class="lg:col-span-1">
				<!-- Cover -->
				<div class="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg mb-6" style="background-color: var(--bg-tertiary);">
					<img
						src={data.book.coverImageUrl || '/placeholder.png'}
						alt={data.book.title}
						class="w-full h-full object-cover"
						onerror={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
					/>

					<!-- Series Badge -->
					{#if data.book.series[0]?.bookNum}
						<div class="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
							{formatSeriesNumber(data.book.series[0])}
						</div>
					{/if}

					<!-- Rating Badge -->
					{#if data.book.rating}
						<div class="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1 text-sm">
							<Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
							{data.book.rating.toFixed(1)}
						</div>
					{/if}
				</div>

				<!-- Status Badge -->
				{#if data.book.status}
					<div
						class="w-full py-2 px-4 rounded-lg text-center text-white font-medium mb-4 flex items-center justify-center gap-2"
						style="background-color: {data.book.status.color || '#6c757d'}"
					>
						{#if data.book.status.icon}
							<DynamicIcon icon={data.book.status.icon} size={16} />
						{/if}
						{data.book.status.name}
					</div>
				{/if}

				<!-- Format & Genre Pills -->
				<div class="flex flex-wrap gap-2 mb-4">
					{#if data.book.format}
						<span
							class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
							style="background-color: {data.book.format.color || '#6c757d'}"
						>
							<LucideIcon name={data.book.format.icon || 'book'} size={14} />
							{data.book.format.name}
						</span>
					{/if}
					{#if data.book.genre}
						<span
							class="px-3 py-1.5 rounded-lg text-sm"
							style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
						>
							{data.book.genre.name}
						</span>
					{/if}
				</div>

				<!-- Quick Actions -->
				<div class="space-y-2">
					{#if data.book.ebookPath}
						<a
							href="/api/ebooks/{data.book.id}/download"
							class="w-full btn-ghost flex items-center justify-center gap-2 py-2"
						>
							<Download class="w-4 h-4" />
							Download Ebook
						</a>
					{/if}
				</div>

				<!-- External Links Card -->
				{#if data.book.goodreadsId || data.book.googleBooksId || data.book.asin}
					<div class="card p-4 mt-4">
						<h3 class="text-sm font-semibold mb-3 flex items-center gap-2" style="color: var(--text-primary);">
							<Globe class="w-4 h-4" />
							External Links
						</h3>
						<div class="space-y-2">
							{#if data.book.goodreadsId}
								<a
									href="https://www.goodreads.com/book/show/{data.book.goodreadsId}"
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 text-sm transition-colors hover:underline"
									style="color: var(--accent);"
								>
									<ExternalLink class="w-3.5 h-3.5" />
									Goodreads
								</a>
							{/if}
							{#if data.book.googleBooksId}
								<a
									href="https://books.google.com/books?id={data.book.googleBooksId}"
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 text-sm transition-colors hover:underline"
									style="color: var(--accent);"
								>
									<ExternalLink class="w-3.5 h-3.5" />
									Google Books
								</a>
							{/if}
							{#if data.book.asin}
								<a
									href="https://www.amazon.com/dp/{data.book.asin}"
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 text-sm transition-colors hover:underline"
									style="color: var(--accent);"
								>
									<ExternalLink class="w-3.5 h-3.5" />
									Amazon
								</a>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Identifiers Card -->
				{#if data.book.isbn10 || data.book.isbn13 || data.book.asin}
					<div class="card p-4 mt-4">
						<h3 class="text-sm font-semibold mb-3 flex items-center gap-2" style="color: var(--text-primary);">
							<Library class="w-4 h-4" />
							Identifiers
						</h3>
						<div class="space-y-2 text-sm">
							{#if data.book.isbn13}
								<div class="flex justify-between">
									<span style="color: var(--text-muted);">ISBN-13</span>
									<span class="font-mono" style="color: var(--text-primary);">{data.book.isbn13}</span>
								</div>
							{/if}
							{#if data.book.isbn10}
								<div class="flex justify-between">
									<span style="color: var(--text-muted);">ISBN-10</span>
									<span class="font-mono" style="color: var(--text-primary);">{data.book.isbn10}</span>
								</div>
							{/if}
							{#if data.book.asin}
								<div class="flex justify-between">
									<span style="color: var(--text-muted);">ASIN</span>
									<span class="font-mono" style="color: var(--text-primary);">{data.book.asin}</span>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>

			<!-- Right Column: Details -->
			<div class="lg:col-span-2">
				<!-- Title -->
				<h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">
					{data.book.title}
				</h1>

				<!-- Authors -->
				{#if data.book.authors.length > 0}
					<div class="flex items-center gap-2 mb-3">
						<User class="w-5 h-5" style="color: var(--text-muted);" />
						<div class="flex flex-wrap gap-2">
							{#each data.book.authors as author}
								<a
									href="/authors/{author.id}"
									class="text-lg transition-colors"
									style="color: var(--accent);"
								>
									{author.name}
									{#if author.role && author.role !== 'Author'}
										<span class="text-sm" style="color: var(--text-muted);">({author.role})</span>
									{/if}
								</a>
								{#if data.book.authors.indexOf(author) < data.book.authors.length - 1}
									<span style="color: var(--text-muted);">,</span>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				<!-- Series -->
				{#if data.book.series.length > 0}
					<div class="flex items-center gap-2 mb-3">
						<Hash class="w-5 h-5" style="color: var(--text-muted);" />
						<div class="flex flex-wrap gap-2">
							{#each data.book.series as s}
								<a
									href="/series/{s.id}"
									class="transition-colors"
									style="color: var(--accent);"
								>
									{s.title}
									{#if s.bookNum}
										<span style="color: var(--text-secondary);">{formatSeriesNumber(s)}</span>
									{/if}
								</a>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Narrator -->
				{#if data.book.narrator}
					<div class="flex items-center gap-2 mb-4">
						<BookMarked class="w-5 h-5" style="color: var(--text-muted);" />
						<span style="color: var(--text-secondary);">Narrated by {data.book.narrator.name}</span>
					</div>
				{/if}

				<!-- Tags -->
				{#if data.book.tags.length > 0}
					<div class="flex items-center gap-2 mb-6">
						<Tag class="w-5 h-5" style="color: var(--text-muted);" />
						<div class="flex flex-wrap gap-2">
							{#each data.book.tags as tag}
								<span
									class="px-2 py-0.5 rounded text-sm"
									style="background-color: {tag.color || 'var(--bg-tertiary)'}; color: {tag.color ? 'white' : 'var(--text-secondary)'};"
								>
									{tag.name}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Tab Navigation -->
				<div class="mb-6 border-b" style="border-color: var(--border-color);">
					<div class="flex gap-1">
						<button
							type="button"
							class="tab-btn"
							class:active={activeTab === 'details'}
							onclick={() => activeTab = 'details'}
						>
							<Info class="w-4 h-4" />
							Book Details
						</button>
						<button
							type="button"
							class="tab-btn"
							class:active={activeTab === 'similar'}
							onclick={() => activeTab = 'similar'}
						>
							<Sparkles class="w-4 h-4" />
							Similar Books
						</button>
					</div>
				</div>

				<!-- Tab Content -->
				{#if activeTab === 'details'}
				<!-- Summary Section -->
				{#if data.book.summary || editingSummary}
					<div class="card p-6 mb-6">
						<div class="flex items-center justify-between mb-3">
							<h2 class="text-lg font-semibold" style="color: var(--text-primary);">Summary</h2>
							{#if !editingSummary}
								<button
									type="button"
									class="inline-edit-btn"
									onclick={startEditSummary}
									title="Edit summary"
								>
									<Pencil class="w-4 h-4" />
								</button>
							{/if}
						</div>
						{#if editingSummary}
							<div class="inline-edit-container">
								<textarea
									class="inline-edit-textarea"
									bind:value={editSummaryValue}
									placeholder="Add a summary..."
									rows="6"
								></textarea>
								<div class="inline-edit-actions">
									<button
										type="button"
										class="inline-save-btn"
										onclick={saveSummary}
										disabled={savingSummary}
									>
										<Check class="w-4 h-4" />
										{savingSummary ? 'Saving...' : 'Save'}
									</button>
									<button
										type="button"
										class="inline-cancel-btn"
										onclick={cancelSummaryEdit}
										disabled={savingSummary}
									>
										Cancel
									</button>
								</div>
							</div>
						{:else}
							<p class="whitespace-pre-wrap leading-relaxed" style="color: var(--text-secondary);">{data.book.summary}</p>
						{/if}
					</div>
				{/if}

				<!-- Metadata Grid -->
				<div class="card p-6">
					<h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">Details</h2>
					<div class="grid grid-cols-2 gap-4">
						{#if data.book.isbn10}
							<div>
								<p class="text-sm" style="color: var(--text-muted);">ISBN-10</p>
								<p style="color: var(--text-primary);">{data.book.isbn10}</p>
							</div>
						{/if}
						{#if data.book.isbn13}
							<div>
								<p class="text-sm" style="color: var(--text-muted);">ISBN-13</p>
								<p style="color: var(--text-primary);">{data.book.isbn13}</p>
							</div>
						{/if}
						{#if data.book.pageCount}
							<div>
								<p class="text-sm" style="color: var(--text-muted);">Pages</p>
								<p style="color: var(--text-primary);">{data.book.pageCount}</p>
							</div>
						{/if}
						{#if data.book.releaseDate}
							<div>
								<p class="text-sm" style="color: var(--text-muted);">Published</p>
								<p style="color: var(--text-primary);">{formatDate(data.book.releaseDate)}</p>
							</div>
						{/if}
						{#if data.book.publisher}
							<div>
								<p class="text-sm" style="color: var(--text-muted);">Publisher</p>
								<p style="color: var(--text-primary);">{data.book.publisher}</p>
							</div>
						{/if}
						{#if data.book.completedDate}
							<div>
								<p class="text-sm" style="color: var(--text-muted);">Completed</p>
								<p style="color: var(--text-primary);">{formatDate(data.book.completedDate)}</p>
							</div>
						{/if}
						{#if data.book.startReadingDate}
							<div>
								<p class="text-sm" style="color: var(--text-muted);">Started</p>
								<p style="color: var(--text-primary);">{formatDate(data.book.startReadingDate)}</p>
							</div>
						{/if}
						{#if data.book.createdAt}
							<div>
								<p class="text-sm" style="color: var(--text-muted);">Added to Library</p>
								<p style="color: var(--text-primary);">{formatDate(data.book.createdAt)}</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Personal Notes (Inline Editable) -->
				<div class="card p-6 mt-6">
					<div class="flex items-center justify-between mb-2">
						<h2 class="text-lg font-semibold flex items-center gap-2" style="color: var(--text-primary);">
							<FileText class="w-5 h-5" />
							Notes
						</h2>
						{#if !editingNotes}
							<button
								type="button"
								class="inline-edit-btn"
								onclick={startEditNotes}
								title="Edit notes"
							>
								<Pencil class="w-4 h-4" />
							</button>
						{/if}
					</div>
					{#if editingNotes}
						<div class="inline-edit-container">
							<textarea
								class="inline-edit-textarea"
								bind:value={editNotesValue}
								placeholder="Add personal notes..."
								rows="4"
							></textarea>
							<div class="inline-edit-actions">
								<button
									type="button"
									class="inline-save-btn"
									onclick={saveNotes}
									disabled={savingNotes}
								>
									<Check class="w-4 h-4" />
									{savingNotes ? 'Saving...' : 'Save'}
								</button>
								<button
									type="button"
									class="inline-cancel-btn"
									onclick={cancelNotesEdit}
									disabled={savingNotes}
								>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<button
							type="button"
							class="inline-edit-content"
							onclick={startEditNotes}
						>
							{#if data.book.comments}
								<p class="whitespace-pre-wrap" style="color: var(--text-secondary);">{data.book.comments}</p>
							{:else}
								<p class="text-placeholder">Click to add personal notes...</p>
							{/if}
						</button>
					{/if}
				</div>

				<!-- Series Notes (only show if there are series) -->
				{#if data.book.series.length > 0}
					{#each data.book.series as s}
						<div class="card p-6 mt-6">
							<div class="flex items-center justify-between mb-2">
								<h2 class="text-lg font-semibold flex items-center gap-2" style="color: var(--text-primary);">
									<Hash class="w-5 h-5" />
									{s.title} Notes
								</h2>
								{#if editingSeriesNotes !== s.id}
									<button
										type="button"
										class="inline-edit-btn"
										onclick={() => startEditSeriesNotes(s.id, s.comments)}
										title="Edit series notes"
									>
										<Pencil class="w-4 h-4" />
									</button>
								{/if}
							</div>
							{#if editingSeriesNotes === s.id}
								<div class="inline-edit-container">
									<textarea
										class="inline-edit-textarea"
										bind:value={editSeriesNotesValue}
										placeholder="Add notes about this series..."
										rows="3"
									></textarea>
									<div class="inline-edit-actions">
										<button
											type="button"
											class="inline-save-btn"
											onclick={saveSeriesNotes}
											disabled={savingSeriesNotes}
										>
											<Check class="w-4 h-4" />
											{savingSeriesNotes ? 'Saving...' : 'Save'}
										</button>
										<button
											type="button"
											class="inline-cancel-btn"
											onclick={cancelSeriesNotesEdit}
											disabled={savingSeriesNotes}
										>
											Cancel
										</button>
									</div>
								</div>
							{:else}
								<button
									type="button"
									class="inline-edit-content"
									onclick={() => startEditSeriesNotes(s.id, s.comments)}
								>
									{#if s.comments}
										<p class="whitespace-pre-wrap" style="color: var(--text-secondary);">{s.comments}</p>
									{:else}
										<p class="text-placeholder">Click to add series notes...</p>
									{/if}
								</button>
							{/if}
						</div>
					{/each}
				{/if}
				{:else if activeTab === 'similar'}
				<!-- Similar Books Tab -->
				<div class="card p-6">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color: var(--bg-tertiary);">
							<Sparkles class="w-5 h-5" style="color: var(--accent);" />
						</div>
						<div>
							<h2 class="font-semibold" style="color: var(--text-primary);">Similar Books</h2>
							<p class="text-sm" style="color: var(--text-muted);">Books you might also enjoy</p>
						</div>
					</div>

					{#if data.similarBooks && data.similarBooks.length > 0}
						<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
							{#each data.similarBooks as book}
								<a
									href="/books/{book.id}"
									class="group rounded-lg overflow-hidden transition-shadow hover:shadow-lg"
									style="background-color: var(--bg-tertiary);"
								>
									<div class="aspect-[2/3] relative">
										<img
											src={book.coverImageUrl || '/placeholder.png'}
											alt={book.title}
											class="w-full h-full object-cover group-hover:scale-105 transition-transform"
											loading="lazy"
										/>
									</div>
									<div class="p-2">
										<p class="font-medium text-xs line-clamp-2" style="color: var(--text-primary);">{book.title}</p>
										{#if book.authorName}
											<p class="text-[10px] mt-0.5 truncate" style="color: var(--text-muted);">{book.authorName}</p>
										{/if}
									</div>
								</a>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<Sparkles class="w-12 h-12 mx-auto mb-3" style="color: var(--text-muted); opacity: 0.5;" />
							<p style="color: var(--text-muted);">No similar books found yet</p>
							<p class="text-sm mt-1" style="color: var(--text-muted);">
								Similar books are suggested based on shared authors, series, genres, and tags.
							</p>
						</div>
					{/if}
				</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Delete Confirmation -->
{#if showDeleteConfirm}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={() => { showDeleteConfirm = false; permanentDelete = false; }}>
		<div class="card p-6 max-w-md mx-4" onclick={(e) => e.stopPropagation()}>
			<h2 class="text-xl font-bold mb-4" style="color: var(--text-primary);">
				{isPublicLibraryBook ? 'Remove from Library?' : 'Delete Book?'}
			</h2>

			{#if isPublicLibraryBook}
				<p class="mb-4" style="color: var(--text-secondary);">
					This book is in the public library. Removing it will only remove it from your personal library.
				</p>

				{#if data.canManagePublicLibrary}
					<div class="mb-4 p-3 rounded-lg" style="background-color: var(--bg-tertiary); border: 1px solid var(--border-color);">
						<label class="flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={permanentDelete}
								class="w-4 h-4 rounded"
								style="accent-color: #ef4444;"
							/>
							<span style="color: var(--text-primary);">
								<strong>Permanently delete</strong> from public library
							</span>
						</label>
						{#if permanentDelete}
							<p class="text-sm mt-2" style="color: #ef4444;">
								Warning: This will permanently delete the book for all users. This action cannot be undone.
							</p>
						{/if}
					</div>
				{/if}
			{:else}
				<p class="mb-6" style="color: var(--text-secondary);">
					Are you sure you want to delete "{data.book.title}"? This action cannot be undone.
				</p>
			{/if}

			<div class="flex justify-end gap-2">
				<button
					type="button"
					class="btn-ghost"
					onclick={() => { showDeleteConfirm = false; permanentDelete = false; }}
				>
					Cancel
				</button>
				<button
					type="button"
					class="btn-accent"
					style="background-color: {permanentDelete ? '#dc2626' : '#ef4444'};"
					onclick={handleDelete}
				>
					{permanentDelete ? 'Permanently Delete' : (isPublicLibraryBook ? 'Remove' : 'Delete')}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Inline Edit Button */
	.inline-edit-btn {
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.375rem;
		border-radius: 0.375rem;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.inline-edit-btn:hover {
		color: var(--accent);
		background-color: var(--bg-tertiary);
	}

	/* Inline Edit Content (clickable area) */
	.inline-edit-content {
		width: 100%;
		text-align: left;
		background: none;
		border: 1px solid transparent;
		border-radius: 0.5rem;
		padding: 0.5rem;
		margin: -0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.inline-edit-content:hover {
		background-color: var(--bg-tertiary);
		border-color: var(--border-color);
	}

	.text-placeholder {
		color: var(--text-muted);
		font-style: italic;
	}

	/* Inline Edit Container */
	.inline-edit-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.inline-edit-textarea {
		width: 100%;
		padding: 0.75rem;
		background-color: var(--bg-tertiary);
		border: 1px solid var(--accent);
		border-radius: 0.5rem;
		color: var(--text-primary);
		font-family: inherit;
		font-size: 0.9rem;
		line-height: 1.6;
		resize: vertical;
	}

	.inline-edit-textarea:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.2);
	}

	.inline-edit-textarea::placeholder {
		color: var(--text-muted);
	}

	/* Inline Edit Actions */
	.inline-edit-actions {
		display: flex;
		gap: 0.5rem;
	}

	.inline-save-btn,
	.inline-cancel-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		border-radius: 0.5rem;
		font-weight: 500;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.inline-save-btn {
		background-color: var(--success, #10b981);
		color: white;
	}

	.inline-save-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.inline-save-btn:disabled,
	.inline-cancel-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.inline-cancel-btn {
		background-color: var(--bg-tertiary);
		color: var(--text-secondary);
	}

	.inline-cancel-btn:hover:not(:disabled) {
		background-color: var(--bg-hover);
		color: var(--text-primary);
	}

	/* Tab Navigation */
	.tab-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-muted);
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: -1px;
	}

	.tab-btn:hover {
		color: var(--text-primary);
		background-color: var(--bg-tertiary);
	}

	.tab-btn.active {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}
</style>
