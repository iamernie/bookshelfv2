<script lang="ts">
	import {
		MoreVertical,
		Eye,
		Edit,
		Star,
		Download,
		Trash2,
		BookMarked,
		ExternalLink
	} from 'lucide-svelte';

	let {
		bookId,
		hasEbook = false,
		onViewDetails,
		onEdit,
		onQuickEdit,
		onDownload,
		onDelete,
		onAssignShelf
	}: {
		bookId: number;
		hasEbook?: boolean;
		onViewDetails?: () => void;
		onEdit?: () => void;
		onQuickEdit?: () => void;
		onDownload?: () => void;
		onDelete?: () => void;
		onAssignShelf?: () => void;
	} = $props();

	let isOpen = $state(false);

	function handleToggle(e: MouseEvent) {
		e.stopPropagation();
		isOpen = !isOpen;
	}

	function handleAction(action: (() => void) | undefined) {
		return (e: MouseEvent) => {
			e.stopPropagation();
			isOpen = false;
			action?.();
		};
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative">
	<button
		type="button"
		class="p-1.5 rounded bg-black/70 text-white hover:bg-black/90 transition-colors"
		onclick={handleToggle}
		title="More actions"
	>
		<MoreVertical class="w-4 h-4" />
	</button>

	{#if isOpen}
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 z-40"
			onclick={() => isOpen = false}
			aria-label="Close menu"
		></button>

		<!-- Dropdown Menu -->
		<div
			class="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg shadow-lg border overflow-hidden"
			style="background-color: var(--bg-secondary); border-color: var(--border-color);"
		>
			<div class="py-1">
				{#if onViewDetails}
					<button
						type="button"
						class="menu-item"
						onclick={handleAction(onViewDetails)}
					>
						<Eye class="w-4 h-4" />
						View Details
					</button>
				{/if}

				{#if onEdit}
					<button
						type="button"
						class="menu-item"
						onclick={handleAction(onEdit)}
					>
						<Edit class="w-4 h-4" />
						Edit Book
					</button>
				{/if}

				{#if onQuickEdit}
					<button
						type="button"
						class="menu-item"
						onclick={handleAction(onQuickEdit)}
					>
						<Star class="w-4 h-4" />
						Quick Edit
					</button>
				{/if}

				{#if onAssignShelf}
					<button
						type="button"
						class="menu-item"
						onclick={handleAction(onAssignShelf)}
					>
						<BookMarked class="w-4 h-4" />
						Assign Shelf
					</button>
				{/if}

				{#if hasEbook && onDownload}
					<div class="border-t my-1" style="border-color: var(--border-color);"></div>
					<button
						type="button"
						class="menu-item"
						onclick={handleAction(onDownload)}
					>
						<Download class="w-4 h-4" />
						Download
					</button>
				{/if}

				{#if onDelete}
					<div class="border-t my-1" style="border-color: var(--border-color);"></div>
					<button
						type="button"
						class="menu-item text-red-500 hover:text-red-600"
						onclick={handleAction(onDelete)}
					>
						<Trash2 class="w-4 h-4" />
						Delete
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.menu-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		color: var(--text-primary);
		transition: background-color 0.15s;
		text-align: left;
	}

	.menu-item:hover {
		background-color: var(--bg-tertiary);
	}
</style>
