<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { tick } from 'svelte';
	import {
		ArrowLeft,
		Loader2,
		Mic,
		BookOpen,
		Globe
	} from 'lucide-svelte';
	import { toasts } from '$lib/stores/toast';

	let { data } = $props();
	const narrator = data.narrator;

	// Get return URL from query params
	let returnTo = $derived($page.url.searchParams.get('returnTo') || `/narrators`);

	let saving = $state(false);

	// Form fields
	let name = $state(narrator.name || '');
	let bio = $state(narrator.bio || '');
	let url = $state(narrator.url || '');

	async function handleSave() {
		if (!name.trim()) return;
		saving = true;
		try {
			const res = await fetch(`/api/narrators/${narrator.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					bio: bio.trim() || null,
					url: url.trim() || null
				})
			});

			if (!res.ok) {
				const err = await res.json();
				toasts.error(err.message || 'Failed to save narrator');
				return;
			}

			toasts.success('Narrator saved');
			await tick();
			goto(decodeURIComponent(returnTo));
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		goto(decodeURIComponent(returnTo));
	}
</script>

<svelte:head>
	<title>Edit {narrator.name} - BookShelf</title>
</svelte:head>

<div class="min-h-full" style="background-color: var(--bg-primary);">
	<!-- Header -->
	<div
		class="sticky top-0 z-20"
		style="background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color);"
	>
		<div class="max-w-4xl mx-auto px-4 sm:px-6">
			<div class="flex items-center justify-between h-16">
				<button
					type="button"
					class="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
					style="color: var(--text-secondary);"
					onclick={handleCancel}
				>
					<ArrowLeft class="w-4 h-4" />
					<span class="hidden sm:inline">Back</span>
				</button>

				<h1 class="font-semibold truncate max-w-[200px] sm:max-w-md" style="color: var(--text-primary);">
					Edit Narrator
				</h1>

				<div class="flex items-center gap-2">
					<button
						type="button"
						class="px-3 py-1.5 text-sm rounded-lg transition-colors"
						style="color: var(--text-muted);"
						onclick={handleCancel}
					>
						Cancel
					</button>
					<button
						type="button"
						class="btn-accent px-4 py-1.5 text-sm flex items-center gap-2"
						disabled={saving || !name.trim()}
						onclick={handleSave}
					>
						{#if saving}
							<Loader2 class="w-4 h-4 animate-spin" />
						{/if}
						Save
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="max-w-4xl mx-auto px-4 sm:px-6 py-6">
		<div class="flex gap-6">
			<!-- Sidebar with Preview and Stats -->
			<div class="hidden lg:block w-48 flex-shrink-0">
				<div class="sticky top-20 space-y-4">
					<!-- Narrator Preview -->
					<div
						class="rounded-lg p-4"
						style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
					>
						<div
							class="w-full aspect-square rounded-lg flex items-center justify-center mb-3"
							style="background-color: var(--bg-tertiary);"
						>
							<Mic class="w-12 h-12" style="color: var(--text-muted);" />
						</div>
						<p class="text-center text-sm font-medium" style="color: var(--text-primary);">
							{name || 'Narrator Name'}
						</p>
					</div>

					<!-- Stats Card -->
					<div
						class="rounded-lg p-4"
						style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
					>
						<h3 class="text-xs font-medium mb-3" style="color: var(--text-muted);">Stats</h3>
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-xs" style="color: var(--text-muted);">Audiobooks</span>
								<span class="text-sm font-medium" style="color: var(--text-primary);">
									{narrator.bookCount}
								</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-xs" style="color: var(--text-muted);">Avg Rating</span>
								<span class="text-sm font-medium" style="color: var(--text-primary);">
									{narrator.avgRating ? narrator.avgRating.toFixed(1) : '-'}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Main Form -->
			<div class="flex-1 min-w-0">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleSave();
					}}
				>
					<div class="space-y-4">
						<!-- Name -->
						<div
							class="rounded-lg p-4"
							style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
						>
							<label for="name" class="block text-xs font-medium mb-1.5" style="color: var(--text-muted);">
								Name <span style="color: var(--accent);">*</span>
							</label>
							<input
								id="name"
								type="text"
								bind:value={name}
								required
								class="w-full px-3 py-2 rounded-md transition-all focus:ring-2 focus:ring-offset-0"
								style="background-color: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); --tw-ring-color: var(--accent);"
								placeholder="Narrator name"
							/>
						</div>

						<!-- Bio -->
						<div
							class="rounded-lg p-4"
							style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
						>
							<label for="bio" class="block text-xs font-medium mb-1.5" style="color: var(--text-muted);">
								Biography
							</label>
							<textarea
								id="bio"
								bind:value={bio}
								rows="4"
								class="w-full px-3 py-2 rounded-md text-sm resize-y"
								style="background-color: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary);"
								placeholder="Narrator biography..."
							></textarea>
						</div>

						<!-- URL -->
						<div
							class="rounded-lg p-4"
							style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
						>
							<label for="url" class="block text-xs font-medium mb-1.5 flex items-center gap-1" style="color: var(--text-muted);">
								<Globe class="w-3.5 h-3.5" />
								Website / Profile URL
							</label>
							<input
								id="url"
								type="url"
								bind:value={url}
								class="w-full px-3 py-2 rounded-md text-sm"
								style="background-color: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary);"
								placeholder="https://..."
							/>
						</div>

						<!-- Books by Narrator -->
						{#if data.books.length > 0}
							<div
								class="rounded-lg p-4"
								style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
							>
								<h3 class="text-xs font-medium mb-3 flex items-center gap-2" style="color: var(--text-muted);">
									<BookOpen class="w-3.5 h-3.5" />
									Audiobooks ({data.books.length})
								</h3>
								<div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
									{#each data.books as book}
										<a
											href="/books/{book.id}"
											class="flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors hover:opacity-80"
											style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
										>
											<img
												src={book.coverImageUrl || '/placeholder.png'}
												alt=""
												class="w-6 h-9 object-cover rounded"
												onerror={(e) => {
													(e.currentTarget as HTMLImageElement).src = '/placeholder.png';
												}}
											/>
											{book.title}
										</a>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</form>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}
</style>
