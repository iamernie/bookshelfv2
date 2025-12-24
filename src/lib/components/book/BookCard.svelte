<script lang="ts">
	import { BookOpen, Star } from 'lucide-svelte';
	import type { BookCardData } from '$lib/types';

	let {
		book,
		selected = false,
		selectable = false,
		onSelect,
		onClick
	}: {
		book: BookCardData;
		selected?: boolean;
		selectable?: boolean;
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
</script>

<div
	class="card group cursor-pointer hover:shadow-md transition-all duration-200 {selected ? 'ring-2 ring-primary-500' : ''}"
	onclick={handleClick}
	onkeydown={handleKeydown}
	role="button"
	tabindex="0"
>
	<!-- Cover Image -->
	<div class="relative aspect-[2/3] bg-gray-100 overflow-hidden">
		{#if book.coverImageUrl}
			<img
				src={book.coverImageUrl}
				alt={book.title}
				class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				loading="lazy"
			/>
		{:else}
			<div class="w-full h-full flex items-center justify-center text-gray-300">
				<BookOpen class="w-16 h-16" />
			</div>
		{/if}

		<!-- Selection Checkbox -->
		{#if selectable}
			<div class="absolute top-2 left-2">
				<input
					type="checkbox"
					checked={selected}
					onchange={handleCheckbox}
					class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
				/>
			</div>
		{/if}

		<!-- Rating Badge -->
		{#if book.rating}
			<div class="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-sm">
				<Star class="w-3 h-3 fill-yellow-400 text-yellow-400" />
				{book.rating.toFixed(1)}
			</div>
		{/if}

		<!-- Ebook Badge -->
		{#if book.ebookPath}
			<div class="absolute bottom-2 left-2 bg-cyan-500 text-white p-1.5 rounded-full">
				<BookOpen class="w-4 h-4" />
			</div>
		{/if}
	</div>

	<!-- Book Info -->
	<div class="p-3">
		<h3 class="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
			{book.title}
		</h3>
		{#if book.authorName}
			<p class="text-xs text-gray-500 mt-1 truncate">{book.authorName}</p>
		{/if}
		{#if book.seriesName}
			<p class="text-xs text-gray-400 mt-0.5 truncate">
				{book.seriesName}
				{#if book.bookNum}
					#{book.bookNum}
				{/if}
			</p>
		{/if}
	</div>
</div>
