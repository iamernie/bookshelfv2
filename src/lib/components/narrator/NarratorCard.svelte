<script lang="ts">
	import { Mic, BookOpen, Star } from 'lucide-svelte';

	let {
		narrator,
		onclick
	}: {
		narrator: {
			id: number;
			name: string;
			bio: string | null;
			bookCount: number;
			avgRating: number | null;
		};
		onclick: () => void;
	} = $props();
</script>

<button
	type="button"
	class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer text-left w-full"
	onclick={onclick}
>
	<div class="flex items-center gap-4">
		<div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
			<Mic class="w-6 h-6 text-purple-600" />
		</div>

		<div class="flex-1 min-w-0">
			<h3 class="font-medium text-gray-900 truncate">{narrator.name}</h3>
			<div class="text-sm text-gray-500 flex items-center gap-3 mt-1">
				<span class="flex items-center gap-1">
					<BookOpen class="w-4 h-4" />
					{narrator.bookCount} {narrator.bookCount === 1 ? 'book' : 'books'}
				</span>
				{#if narrator.avgRating}
					<span class="flex items-center gap-1">
						<Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
						{narrator.avgRating}
					</span>
				{/if}
			</div>
		</div>
	</div>
</button>
