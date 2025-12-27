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
		Check
	} from 'lucide-svelte';
	import { toasts } from '$lib/stores/toast';
	import { formatDate } from '$lib/utils/date';

	let { data } = $props();

	let showDeleteConfirm = $state(false);

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
		const res = await fetch(`/api/books/${data.book.id}`, {
			method: 'DELETE'
		});
		if (res.ok) {
			toasts.success('Book deleted');
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

				<!-- Status -->
				{#if data.book.status}
					<div
						class="w-full py-2 px-4 rounded-lg text-center text-white font-medium mb-4"
						style="background-color: {data.book.status.color || '#6c757d'}"
					>
						{data.book.status.name}
					</div>
				{/if}

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
					{#if data.book.goodreadsId}
						<a
							href="https://www.goodreads.com/book/show/{data.book.goodreadsId}"
							target="_blank"
							rel="noopener noreferrer"
							class="w-full btn-ghost flex items-center justify-center gap-2 py-2"
						>
							<ExternalLink class="w-4 h-4" />
							View on Goodreads
						</a>
					{/if}
				</div>
			</div>

			<!-- Right Column: Details -->
			<div class="lg:col-span-2">
				<!-- Title -->
				<h1 class="text-3xl font-bold mb-4" style="color: var(--text-primary);">
					{data.book.title}
				</h1>

				<!-- Authors -->
				{#if data.book.authors.length > 0}
					<div class="flex items-center gap-2 mb-4">
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
					<div class="flex items-center gap-2 mb-4">
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

					<!-- Series Notes (Inline Editable) -->
					{#each data.book.series as s}
						<div class="mb-4 pl-7">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-medium" style="color: var(--text-muted);">
									{s.title} Notes
								</span>
								{#if editingSeriesNotes !== s.id}
									<button
										type="button"
										class="inline-edit-btn"
										onclick={() => startEditSeriesNotes(s.id, s.comments)}
										title="Edit series notes"
									>
										<Pencil class="w-3.5 h-3.5" />
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
									class="inline-edit-content text-sm"
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

				<!-- Genre & Format Pills -->
				<div class="flex flex-wrap gap-2 mb-6">
					{#if data.book.genre}
						<span
							class="px-3 py-1 rounded-full text-sm"
							style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
						>
							{data.book.genre.name}
						</span>
					{/if}
					{#if data.book.format}
						<span
							class="px-3 py-1 rounded-full text-sm"
							style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
						>
							{data.book.format.name}
						</span>
					{/if}
					{#if data.book.narrator}
						<span
							class="px-3 py-1 rounded-full text-sm"
							style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
						>
							Narrated by {data.book.narrator.name}
						</span>
					{/if}
				</div>

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
			</div>
		</div>
	</div>
</div>

<!-- Delete Confirmation -->
{#if showDeleteConfirm}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={() => showDeleteConfirm = false}>
		<div class="card p-6 max-w-md mx-4" onclick={(e) => e.stopPropagation()}>
			<h2 class="text-xl font-bold mb-4" style="color: var(--text-primary);">Delete Book?</h2>
			<p class="mb-6" style="color: var(--text-secondary);">
				Are you sure you want to delete "{data.book.title}"? This action cannot be undone.
			</p>
			<div class="flex justify-end gap-2">
				<button
					type="button"
					class="btn-ghost"
					onclick={() => showDeleteConfirm = false}
				>
					Cancel
				</button>
				<button
					type="button"
					class="btn-accent"
					style="background-color: #ef4444;"
					onclick={handleDelete}
				>
					Delete
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
</style>
