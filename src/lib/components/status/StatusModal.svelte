<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import { BookOpen, Edit2, AlertTriangle, Lock } from 'lucide-svelte';

	let {
		status,
		books = [],
		mode = 'view',
		onClose,
		onSave
	}: {
		status: { id: number; name: string; key: string | null; color: string | null; icon: string | null; isSystem: boolean | null; sortOrder: number | null; bookCount?: number; createdAt: string | null; updatedAt: string | null } | null;
		books?: { id: number; title: string; coverImageUrl: string | null }[];
		mode: 'view' | 'edit';
		onClose: () => void;
		onSave: (data: { name: string }) => Promise<void>;
	} = $props();

	let currentMode = $state(mode);
	let saving = $state(false);

	let name = $state(status?.name || '');

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
</script>

<Modal open={true} onClose={onClose} title={status?.name || 'Status'} size="md">
	{#if currentMode === 'view' && status}
		<!-- View Mode -->
		<div class="p-6 space-y-6">
			<div class="flex items-center gap-4">
				<div
					class="w-16 h-16 rounded-lg flex items-center justify-center"
					style="background-color: {status.color || '#6c757d'}20"
				>
					<div
						class="w-8 h-8 rounded-full"
						style="background-color: {status.color || '#6c757d'}"
					></div>
				</div>

				<div class="flex-1">
					<div class="flex items-center gap-2">
						<h2 class="text-xl font-semibold text-gray-900">{status.name}</h2>
						{#if status.isSystem}
							<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
								<Lock class="w-3 h-3" />
								System
							</span>
						{/if}
					</div>
					<div class="flex items-center gap-3 mt-1 text-sm text-gray-500">
						<span class="flex items-center gap-1">
							<BookOpen class="w-4 h-4" />
							{status.bookCount ?? books.length} {(status.bookCount ?? books.length) === 1 ? 'book' : 'books'}
						</span>
						{#if status.key}
							<span class="text-gray-400">Key: {status.key}</span>
						{/if}
					</div>
				</div>

				<div
					class="w-8 h-8 rounded-full border-4 border-white shadow"
					style="background-color: {status.color || '#6c757d'}"
				></div>
			</div>

			<div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
				<AlertTriangle class="w-4 h-4 flex-shrink-0" />
				<span>Statuses are system-defined. Only the display name can be changed for localization purposes.</span>
			</div>

			{#if books.length > 0}
				<div>
					<h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
						<BookOpen class="w-4 h-4" />
						Books with this status
					</h3>
					<div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
						{#each books.slice(0, 12) as book}
							<a href="/books?id={book.id}" class="block">
								<img
									src={book.coverImageUrl || '/placeholder.png'}
									alt={book.title}
									class="w-full aspect-[2/3] object-cover rounded shadow-sm hover:shadow-md transition-shadow"
									onerror={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
								/>
							</a>
						{/each}
					</div>
					{#if books.length > 12}
						<p class="text-sm text-gray-500 mt-2">and {books.length - 12} more...</p>
					{/if}
				</div>
			{/if}

			<!-- Action buttons -->
			<div class="flex justify-end pt-4 border-t">
				<button
					type="button"
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
					onclick={() => currentMode = 'edit'}
				>
					<Edit2 class="w-4 h-4" />
					Edit Name
				</button>
			</div>
		</div>
	{:else if status}
		<!-- Edit Mode -->
		<form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="p-6 space-y-4">
			<div class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
				<Lock class="w-4 h-4 flex-shrink-0" />
				<span>You can only change the display name for localization. The status key and behavior cannot be modified.</span>
			</div>

			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Display Name <span class="text-red-500">*</span></label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
				{#if status.key}
					<p class="text-xs text-gray-500 mt-1">System key: {status.key}</p>
				{/if}
			</div>

			<!-- Form buttons -->
			<div class="flex justify-end gap-3 pt-4 border-t">
				<button
					type="button"
					class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
					onclick={() => currentMode = 'view'}
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
