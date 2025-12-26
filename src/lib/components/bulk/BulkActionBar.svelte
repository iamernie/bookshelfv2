<script lang="ts">
	import { X, Tag, CheckCircle, Trash2, SquareCheck, Square } from 'lucide-svelte';
	import { selectedBooks, selectionCount, hasSelection } from '$lib/stores/selection';

	let {
		totalCount,
		onAddTags,
		onChangeStatus,
		onDelete,
		onSelectAll,
		onClearSelection
	}: {
		totalCount: number;
		onAddTags: () => void;
		onChangeStatus: () => void;
		onDelete: () => void;
		onSelectAll: () => void;
		onClearSelection: () => void;
	} = $props();

	let count = $derived($selectionCount);
	let visible = $derived($hasSelection);
	let allSelected = $derived(count === totalCount && totalCount > 0);
</script>

{#if visible}
	<div
		class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border animate-slide-up"
		style="background-color: var(--bg-secondary); border-color: var(--border-color);"
	>
		<!-- Selection count -->
		<div class="flex items-center gap-2 pr-3 border-r" style="border-color: var(--border-color);">
			<span class="font-medium" style="color: var(--text-primary);">
				{count} selected
			</span>
			<button
				type="button"
				class="p-1 rounded hover:bg-black/10 transition-colors"
				style="color: var(--text-muted);"
				onclick={onClearSelection}
				title="Clear selection"
			>
				<X class="w-4 h-4" />
			</button>
		</div>

		<!-- Select All / Deselect All -->
		<button
			type="button"
			class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
			style="color: var(--text-secondary);"
			onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
			onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
			onclick={allSelected ? onClearSelection : onSelectAll}
		>
			{#if allSelected}
				<Square class="w-4 h-4" />
				Deselect All
			{:else}
				<SquareCheck class="w-4 h-4" />
				Select All ({totalCount})
			{/if}
		</button>

		<!-- Divider -->
		<div class="w-px h-6" style="background-color: var(--border-color);"></div>

		<!-- Add Tags -->
		<button
			type="button"
			class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
			style="color: var(--text-secondary);"
			onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
			onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
			onclick={onAddTags}
		>
			<Tag class="w-4 h-4" />
			Tags
		</button>

		<!-- Change Status -->
		<button
			type="button"
			class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
			style="color: var(--text-secondary);"
			onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
			onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
			onclick={onChangeStatus}
		>
			<CheckCircle class="w-4 h-4" />
			Status
		</button>

		<!-- Delete -->
		<button
			type="button"
			class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium text-red-500 hover:text-red-600"
			onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
			onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
			onclick={onDelete}
		>
			<Trash2 class="w-4 h-4" />
			Delete
		</button>
	</div>
{/if}

<style>
	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.animate-slide-up {
		animation: slide-up 0.2s ease-out;
	}
</style>
