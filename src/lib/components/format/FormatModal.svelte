<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import { Disc, BookOpen, Edit2, Trash2, AlertCircle } from 'lucide-svelte';

	let {
		format,
		books = [],
		mode = 'view',
		onClose,
		onSave,
		onDelete
	}: {
		format: { id: number; name: string; bookCount?: number; createdAt: string | null; updatedAt: string | null } | null;
		books?: { id: number; title: string; coverImageUrl: string | null }[];
		mode: 'view' | 'edit' | 'add';
		onClose: () => void;
		onSave: (data: { name: string }) => Promise<void>;
		onDelete?: () => Promise<void>;
	} = $props();

	let currentMode = $state(mode);
	let saving = $state(false);
	let deleting = $state(false);
	let deleteError = $state<string | null>(null);

	let name = $state(format?.name || '');

	async function handleSave() {
		if (!name.trim()) return;
		saving = true;
		try {
			await onSave({ name: name.trim() });
			onClose();
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		if (!onDelete) return;
		if (!confirm('Are you sure you want to delete this format?')) return;
		deleting = true;
		deleteError = null;
		try {
			await onDelete();
			onClose();
		} catch (err) {
			if (err instanceof Error) {
				deleteError = err.message;
			} else {
				deleteError = 'Failed to delete format';
			}
		} finally {
			deleting = false;
		}
	}
</script>

<Modal open={true} onClose={onClose} title={currentMode === 'add' ? 'Add Format' : format?.name || 'Format'} size="sm">
	{#if currentMode === 'view' && format}
		<!-- View Mode -->
		<div class="p-6 space-y-6">
			<div class="flex items-center gap-4">
				<div class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
					<Disc class="w-8 h-8 text-gray-500" />
				</div>

				<div class="flex-1">
					<h2 class="text-xl font-semibold text-gray-900">{format.name}</h2>
					<p class="text-sm text-gray-500 flex items-center gap-1 mt-1">
						<BookOpen class="w-4 h-4" />
						{format.bookCount ?? books.length} {(format.bookCount ?? books.length) === 1 ? 'book' : 'books'}
					</p>
				</div>
			</div>

			{#if books.length > 0}
				<div>
					<h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
						<BookOpen class="w-4 h-4" />
						Books in this format
					</h3>
					<div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
						{#each books.slice(0, 12) as book}
							<a href="/books?id={book.id}" class="block">
								{#if book.coverImageUrl}
									<img src={book.coverImageUrl} alt={book.title} class="w-full aspect-[2/3] object-cover rounded shadow-sm hover:shadow-md transition-shadow" />
								{:else}
									<div class="w-full aspect-[2/3] bg-gray-200 rounded flex items-center justify-center">
										<BookOpen class="w-6 h-6 text-gray-400" />
									</div>
								{/if}
							</a>
						{/each}
					</div>
					{#if books.length > 12}
						<p class="text-sm text-gray-500 mt-2">and {books.length - 12} more...</p>
					{/if}
				</div>
			{/if}

			{#if deleteError}
				<div class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
					<AlertCircle class="w-4 h-4 flex-shrink-0" />
					<span>{deleteError}</span>
				</div>
			{/if}

			<!-- Action buttons -->
			<div class="flex justify-between pt-4 border-t">
				<button
					type="button"
					class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
					onclick={handleDelete}
					disabled={deleting}
				>
					<Trash2 class="w-4 h-4" />
					Delete
				</button>
				<button
					type="button"
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
					onclick={() => { currentMode = 'edit'; deleteError = null; }}
				>
					<Edit2 class="w-4 h-4" />
					Edit
				</button>
			</div>
		</div>
	{:else}
		<!-- Edit/Add Mode -->
		<form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="p-6 space-y-4">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-500">*</span></label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					placeholder="e.g., Hardcover, Paperback, Ebook, Audiobook"
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<!-- Form buttons -->
			<div class="flex justify-end gap-3 pt-4 border-t">
				<button
					type="button"
					class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
					onclick={() => currentMode === 'add' ? onClose() : currentMode = 'view'}
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={saving || !name.trim()}
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
				>
					{saving ? 'Saving...' : 'Save'}
				</button>
			</div>
		</form>
	{/if}
</Modal>
