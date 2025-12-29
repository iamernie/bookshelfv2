<script lang="ts">
	import { BookOpen, Headphones, ArrowRight, Plus, ChevronLeft } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Add Audiobook | BookShelf</title>
</svelte:head>

<div class="container mx-auto px-4 py-6 max-w-2xl">
	<!-- Header -->
	<div class="flex items-center gap-4 mb-6">
		<a href="/audiobooks" class="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
			<ChevronLeft class="w-6 h-6" style="color: var(--text-primary);" />
		</a>
		<h1 class="text-xl font-bold" style="color: var(--text-primary);">Add Audiobook</h1>
	</div>

	<!-- Info Card -->
	<div class="rounded-xl p-6 mb-8" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%); border: 1px solid rgba(139, 92, 246, 0.3);">
		<div class="flex items-start gap-4">
			<div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color: rgba(139, 92, 246, 0.2);">
				<Headphones class="w-6 h-6" style="color: #8b5cf6;" />
			</div>
			<div>
				<h2 class="font-semibold mb-2" style="color: var(--text-primary);">Audiobooks are part of your books</h2>
				<p class="text-sm mb-3" style="color: var(--text-muted);">
					In BookShelf, audiobooks are attached to books rather than being standalone items. This means your book is the single source of truth for all metadata (title, author, series, etc.), whether you have an ebook, audiobook, or both.
				</p>
				<p class="text-sm" style="color: var(--text-muted);">
					To add an audiobook, first create or find the book you want to attach it to, then add audio files from the book's edit page.
				</p>
			</div>
		</div>
	</div>

	<!-- Options -->
	<div class="space-y-4">
		<h3 class="font-medium" style="color: var(--text-primary);">Choose how to proceed:</h3>

		<!-- Option 1: Create new book -->
		<a
			href="/books/new"
			class="block p-4 rounded-lg transition-all hover:scale-[1.01]"
			style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
		>
			<div class="flex items-center gap-4">
				<div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color: var(--accent); opacity: 0.1;">
					<Plus class="w-5 h-5" style="color: var(--accent);" />
				</div>
				<div class="flex-1">
					<p class="font-medium" style="color: var(--text-primary);">Create a new book</p>
					<p class="text-sm" style="color: var(--text-muted);">
						Start fresh with a new book entry, then add audio files
					</p>
				</div>
				<ArrowRight class="w-5 h-5" style="color: var(--text-muted);" />
			</div>
		</a>

		<!-- Option 2: Find existing book -->
		<a
			href="/books"
			class="block p-4 rounded-lg transition-all hover:scale-[1.01]"
			style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
		>
			<div class="flex items-center gap-4">
				<div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color: var(--accent); opacity: 0.1;">
					<BookOpen class="w-5 h-5" style="color: var(--accent);" />
				</div>
				<div class="flex-1">
					<p class="font-medium" style="color: var(--text-primary);">Find an existing book</p>
					<p class="text-sm" style="color: var(--text-muted);">
						Browse your library to find a book and add audio files to it
					</p>
				</div>
				<ArrowRight class="w-5 h-5" style="color: var(--text-muted);" />
			</div>
		</a>
	</div>

	<!-- Tip -->
	<div class="mt-8 p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
		<p class="text-sm" style="color: var(--text-muted);">
			<strong style="color: var(--text-primary);">Tip:</strong> You can also add audio files directly from any book's detail page by clicking "Edit" and going to the "Media" tab.
		</p>
	</div>
</div>
