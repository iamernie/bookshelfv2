<script lang="ts">
	import { BookOpen, Disc } from 'lucide-svelte';

	let {
		format,
		onclick
	}: {
		format: {
			id: number;
			name: string;
			bookCount: number;
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
		<div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
			<Disc class="w-6 h-6 text-gray-500" />
		</div>

		<div class="flex-1 min-w-0">
			<h3 class="font-medium text-gray-900 truncate">{format.name}</h3>
			<p class="text-sm text-gray-500 flex items-center gap-1 mt-1">
				<BookOpen class="w-4 h-4" />
				{format.bookCount} {format.bookCount === 1 ? 'book' : 'books'}
			</p>
		</div>
	</div>
</button>
