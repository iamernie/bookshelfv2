<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import { Tag, BookOpen, Library, Edit2, Trash2, Lock, AlertTriangle } from 'lucide-svelte';
	import type { Tag as TagType } from '$lib/server/db/schema';

	interface TagColor {
		name: string;
		value: string;
	}

	let {
		tag,
		books = [],
		series = [],
		colors = [],
		mode = 'view',
		onClose,
		onSave,
		onDelete
	}: {
		tag: (TagType & { bookCount?: number; seriesCount?: number }) | null;
		books?: { id: number; title: string; coverImageUrl: string | null }[];
		series?: { id: number; title: string }[];
		colors: TagColor[];
		mode: 'view' | 'edit' | 'add';
		onClose: () => void;
		onSave: (data: { name?: string; color?: string; icon?: string | null }) => Promise<void>;
		onDelete?: () => Promise<void>;
	} = $props();

	let currentMode = $state(mode);
	let saving = $state(false);
	let deleting = $state(false);

	// Form fields
	let name = $state(tag?.name || '');
	let color = $state(tag?.color || '#6c757d');
	let icon = $state(tag?.icon || '');

	const isSystem = tag?.isSystem ?? false;

	async function handleSave() {
		if (!isSystem && !name.trim()) return;
		saving = true;
		try {
			await onSave({
				name: isSystem ? undefined : name.trim(),
				color,
				icon: icon.trim() || null
			});
			onClose();
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		if (!onDelete) return;
		if (isSystem) {
			alert('System tags cannot be deleted');
			return;
		}
		if (!confirm('Are you sure you want to delete this tag? This will remove it from all books and series.')) return;
		deleting = true;
		try {
			await onDelete();
			onClose();
		} finally {
			deleting = false;
		}
	}

	function getIconPreview(iconName: string, colorValue: string) {
		if (iconName === 'heart') return { type: 'heart', color: colorValue };
		if (iconName === 'star') return { type: 'star', color: colorValue };
		return { type: 'tag', color: colorValue };
	}

	let iconPreview = $derived(getIconPreview(icon, color));
</script>

<Modal open={true} onClose={onClose} title={currentMode === 'add' ? 'Add Tag' : tag?.name || 'Tag'} size="md">
	{#if currentMode === 'view' && tag}
		<!-- View Mode -->
		<div class="p-6 space-y-6">
			<div class="flex items-center gap-4">
				<div
					class="w-16 h-16 rounded-lg flex items-center justify-center"
					style="background-color: {tag.color || '#6c757d'}20"
				>
					{#if tag.icon === 'heart'}
						<svg class="w-8 h-8" style="color: {tag.color || '#6c757d'}" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
						</svg>
					{:else if tag.icon === 'star'}
						<svg class="w-8 h-8" style="color: {tag.color || '#6c757d'}" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
						</svg>
					{:else}
						<Tag class="w-8 h-8" style="color: {tag.color || '#6c757d'}" />
					{/if}
				</div>

				<div class="flex-1">
					<div class="flex items-center gap-2">
						<h2 class="text-xl font-semibold text-gray-900">{tag.name}</h2>
						{#if isSystem}
							<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
								<Lock class="w-3 h-3" />
								System
							</span>
						{/if}
					</div>
					<div class="flex items-center gap-3 mt-1 text-sm text-gray-500">
						<span class="flex items-center gap-1">
							<BookOpen class="w-4 h-4" />
							{tag.bookCount ?? books.length} {(tag.bookCount ?? books.length) === 1 ? 'book' : 'books'}
						</span>
						{#if (tag.seriesCount ?? series.length) > 0}
							<span class="flex items-center gap-1">
								<Library class="w-4 h-4" />
								{tag.seriesCount ?? series.length} series
							</span>
						{/if}
					</div>
				</div>

				<div
					class="w-8 h-8 rounded-full border-4 border-white shadow"
					style="background-color: {tag.color || '#6c757d'}"
				></div>
			</div>

			{#if books.length > 0}
				<div>
					<h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
						<BookOpen class="w-4 h-4" />
						Books with this tag
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

			{#if series.length > 0}
				<div>
					<h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
						<Library class="w-4 h-4" />
						Series with this tag
					</h3>
					<div class="flex flex-wrap gap-2">
						{#each series as s}
							<a
								href="/series?id={s.id}"
								class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
							>
								{s.title}
							</a>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Action buttons -->
			<div class="flex justify-between pt-4 border-t">
				{#if isSystem}
					<div class="flex items-center gap-2 text-sm text-amber-600">
						<AlertTriangle class="w-4 h-4" />
						System tags can't be deleted or renamed
					</div>
				{:else}
					<button
						type="button"
						class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
						onclick={handleDelete}
						disabled={deleting}
					>
						<Trash2 class="w-4 h-4" />
						Delete
					</button>
				{/if}
				<button
					type="button"
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
					onclick={() => currentMode = 'edit'}
				>
					<Edit2 class="w-4 h-4" />
					Edit
				</button>
			</div>
		</div>
	{:else}
		<!-- Edit/Add Mode -->
		<form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="p-6 space-y-4">
			{#if isSystem && currentMode === 'edit'}
				<div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
					<Lock class="w-4 h-4 flex-shrink-0" />
					<span>System tags can only have their color and icon changed. The name cannot be modified.</span>
				</div>
			{/if}

			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
					Name {#if !isSystem}<span class="text-red-500">*</span>{/if}
				</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required={!isSystem}
					disabled={isSystem}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
				<div class="flex flex-wrap gap-2">
					{#each colors as c}
						<button
							type="button"
							class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 {color === c.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'border-white'}"
							style="background-color: {c.value}"
							title={c.name}
							onclick={() => color = c.value}
						></button>
					{/each}
				</div>
			</div>

			<div>
				<label for="icon" class="block text-sm font-medium text-gray-700 mb-1">Icon (optional)</label>
				<div class="flex gap-3">
					<input
						id="icon"
						type="text"
						bind:value={icon}
						placeholder="e.g., heart, star"
						class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
					<div
						class="w-10 h-10 rounded-lg flex items-center justify-center"
						style="background-color: {color}20"
					>
						{#if iconPreview.type === 'heart'}
							<svg class="w-5 h-5" style="color: {iconPreview.color}" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
							</svg>
						{:else if iconPreview.type === 'star'}
							<svg class="w-5 h-5" style="color: {iconPreview.color}" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
							</svg>
						{:else}
							<Tag class="w-5 h-5" style="color: {iconPreview.color}" />
						{/if}
					</div>
				</div>
				<p class="text-xs text-gray-500 mt-1">Supported icons: heart, star. Leave empty for default tag icon.</p>
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
					disabled={saving || (!isSystem && !name.trim())}
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
				>
					{saving ? 'Saving...' : 'Save'}
				</button>
			</div>
		</form>
	{/if}
</Modal>
