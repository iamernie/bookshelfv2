<script lang="ts">
	import { BookOpen, Star } from 'lucide-svelte';
	import DynamicIcon from '$lib/components/ui/DynamicIcon.svelte';
	import type { BookCardData } from '$lib/types';

	let {
		book,
		selected = false,
		selectable = false,
		showStatus = true,
		showTags = true,
		showAuthor = true,
		showSeries = true,
		onSelect,
		onClick
	}: {
		book: BookCardData;
		selected?: boolean;
		selectable?: boolean;
		showStatus?: boolean;
		showTags?: boolean;
		showAuthor?: boolean;
		showSeries?: boolean;
		onSelect?: (id: number) => void;
		onClick?: (book: BookCardData) => void;
	} = $props();

	function handleClick(e: MouseEvent) {
		if (selectable && (e.target as HTMLElement).closest('input[type=checkbox]')) {
			return;
		}
		onClick?.(book);
	}

	function handleCheckbox(e: Event) {
		e.stopPropagation();
		onSelect?.(book.id);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick?.(book);
		}
	}

	// Map simple icon names to Font Awesome classes
	function getTagIconClass(icon: string | null): string {
		if (!icon) return 'fas fa-tag';
		if (icon.startsWith('fas ') || icon.startsWith('far ') || icon.startsWith('fab ')) {
			return icon;
		}
		const iconMap: Record<string, string> = {
			heart: 'fas fa-heart',
			star: 'fas fa-star',
			tag: 'fas fa-tag',
			bookmark: 'fas fa-bookmark'
		};
		return iconMap[icon] || 'fas fa-tag';
	}

	// Get first 2 tags for display (to not clutter the card)
	let displayTags = $derived((book.tags || []).slice(0, 2));
</script>

<div
	class="card group cursor-pointer hover:shadow-lg transition-all duration-200"
	style="{selected ? 'ring: 2px solid var(--accent);' : ''}"
	onclick={handleClick}
	onkeydown={handleKeydown}
	role="button"
	tabindex="0"
>
	<!-- Cover Image -->
	<div class="relative aspect-[2/3] overflow-hidden" style="background-color: var(--bg-tertiary);">
		<img
			src={book.coverImageUrl || '/placeholder.png'}
			alt={book.title}
			class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
			loading="lazy"
			onerror={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
		/>

		<!-- Selection Checkbox -->
		{#if selectable}
			<div class="absolute top-2 left-2">
				<input
					type="checkbox"
					checked={selected}
					onchange={handleCheckbox}
					class="w-5 h-5 rounded"
					style="accent-color: var(--accent);"
				/>
			</div>
		{/if}

		<!-- Rating Badge -->
		{#if book.rating}
			<div class="absolute top-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 text-xs">
				<Star class="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
				{book.rating.toFixed(1)}
			</div>
		{/if}

		<!-- Series Number Badge (hidden when selectable to avoid checkbox overlap) -->
		{#if !selectable && book.seriesName && book.bookNum}
			<div class="absolute top-1 left-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
				#{book.bookNum}
			</div>
		{/if}

		<!-- Ebook Badge -->
		{#if book.ebookPath}
			<div class="absolute bottom-1 left-1 p-1 rounded-full" style="background-color: var(--accent); color: white;">
				<BookOpen class="w-3 h-3" />
			</div>
		{/if}

		<!-- Status Badge -->
		{#if showStatus && book.status}
			<div
				class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white shadow-sm flex items-center gap-1"
				style="background-color: {book.status.color || '#6c757d'}"
			>
				{#if book.status.icon}
					<DynamicIcon icon={book.status.icon} size={10} />
				{/if}
				{book.status.name}
			</div>
		{/if}
	</div>

	<!-- Book Info -->
	<div class="px-2 py-1.5">
		<h3 class="font-medium text-xs line-clamp-2 leading-tight transition-colors" style="color: var(--text-primary);">
			{book.title}
		</h3>
		{#if showAuthor && book.authorName}
			<p class="text-[10px] mt-0.5 truncate" style="color: var(--text-secondary);">{book.authorName}</p>
		{/if}
		{#if showSeries && book.seriesName}
			<p class="text-[10px] truncate" style="color: var(--text-muted);">
				{book.seriesName}
				{#if book.bookNum}
					#{book.bookNum}
				{/if}
			</p>
		{/if}
		{#if showTags && displayTags.length > 0}
			<div class="flex flex-wrap gap-1 mt-1">
				{#each displayTags as tag}
					<span
						class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium"
						style="background-color: {tag.color || '#6c757d'}25; color: {tag.color || '#6c757d'}"
						title={tag.name}
					>
						<DynamicIcon icon={getTagIconClass(tag.icon)} size={8} />
						{tag.name}
					</span>
				{/each}
				{#if (book.tags?.length || 0) > 2}
					<span class="text-[9px]" style="color: var(--text-muted);">+{(book.tags?.length || 0) - 2}</span>
				{/if}
			</div>
		{/if}
	</div>
</div>
