<script lang="ts">
	import { page } from '$app/stores';
	import {
		Home,
		BookOpen,
		Users,
		Library,
		Bookmark,
		Tag,
		BarChart2,
		Settings,
		Plus,
		ChevronDown,
		ChevronRight,
		Disc,
		Mic,
		FolderOpen,
		Heart,
		Clock,
		CheckCircle,
		XCircle,
		Pause,
		Sparkles,
		Upload,
		Download,
		Layers,
		ListChecks,
		Wand2,
		Lightbulb
	} from 'lucide-svelte';
	import DynamicIcon from '$lib/components/ui/DynamicIcon.svelte';

	interface MagicShelf {
		id: number;
		name: string;
		iconColor: string | null;
		bookCount: number;
	}

	interface SidebarData {
		genres: { id: number; name: string; bookCount: number; color: string | null; icon: string | null }[];
		statuses: { id: number; name: string; key: string | null; bookCount: number; color: string | null }[];
		magicShelves?: MagicShelf[];
		totalBooks: number;
	}

	let { data }: { data: SidebarData } = $props();

	// Collapsible sections state
	let librariesOpen = $state(true);
	let statusesOpen = $state(true);
	let smartCollectionsOpen = $state(true);

	// Active path
	let currentPath = $derived($page.url.pathname);

	function isActive(path: string): boolean {
		if (path === '/') return currentPath === '/';
		return currentPath.startsWith(path);
	}

	// Get icon for status based on key
	function getStatusIcon(key: string | null) {
		switch (key) {
			case 'READ': return CheckCircle;
			case 'READING': return BookOpen;
			case 'TO_READ': return Clock;
			case 'DNF': return XCircle;
			case 'PAUSED': return Pause;
			default: return Bookmark;
		}
	}
</script>

<aside class="sidebar w-64 h-full flex flex-col overflow-hidden">
	<!-- Logo / Brand -->
	<div class="p-4 flex items-center gap-3">
		<div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: var(--accent);">
			<BookOpen class="w-5 h-5 text-white" />
		</div>
		<span class="text-lg font-bold" style="color: var(--text-primary);">BookShelf</span>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 overflow-y-auto px-3 py-2">
		<!-- Main Nav -->
		<div class="space-y-1">
			<a href="/" class="sidebar-item" class:active={isActive('/')}>
				<Home class="w-5 h-5" />
				<span>Dashboard</span>
			</a>

			<a href="/books" class="sidebar-item" class:active={currentPath === '/books'}>
				<BookOpen class="w-5 h-5" />
				<span>My Books</span>
				<span class="ml-auto text-xs px-2 py-0.5 rounded-full" style="background-color: var(--bg-tertiary); color: var(--accent);">
					{data.totalBooks}
				</span>
			</a>

			<a href="/library" class="sidebar-item" class:active={isActive('/library')}>
				<Library class="w-5 h-5" />
				<span>Public Library</span>
			</a>
		</div>

		<!-- Libraries Section -->
		<div class="mt-6">
			<button
				class="sidebar-section w-full flex items-center justify-between"
				onclick={() => librariesOpen = !librariesOpen}
			>
				<span>Libraries</span>
				{#if librariesOpen}
					<ChevronDown class="w-4 h-4" />
				{:else}
					<ChevronRight class="w-4 h-4" />
				{/if}
			</button>

			{#if librariesOpen}
				<div class="mt-1 space-y-1">
					{#each data.genres.slice(0, 6) as genre}
						<a href="/books?genre={genre.id}" class="sidebar-item text-sm">
							{#if genre.icon}
								<DynamicIcon icon={genre.icon} size={16} color={genre.color || 'var(--text-muted)'} />
							{:else}
								<FolderOpen class="w-4 h-4" style="color: {genre.color || 'var(--text-muted)'};" />
							{/if}
							<span class="truncate">{genre.name}</span>
							<span class="ml-auto text-xs" style="color: var(--text-muted);">{genre.bookCount}</span>
						</a>
					{/each}
					{#if data.genres.length > 6}
						<a href="/genres" class="sidebar-item text-sm" style="color: var(--accent);">
							<Plus class="w-4 h-4" />
							<span>View all genres</span>
						</a>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Statuses Section -->
		<div class="mt-6">
			<button
				class="sidebar-section w-full flex items-center justify-between"
				onclick={() => statusesOpen = !statusesOpen}
			>
				<span>Statuses</span>
				{#if statusesOpen}
					<ChevronDown class="w-4 h-4" />
				{:else}
					<ChevronRight class="w-4 h-4" />
				{/if}
			</button>

			{#if statusesOpen}
				<div class="mt-1 space-y-1">
					{#each data.statuses as status}
						{@const StatusIcon = getStatusIcon(status.key)}
						<a href="/books?status={status.id}" class="sidebar-item text-sm">
							<StatusIcon class="w-4 h-4" style="color: {status.color || 'var(--text-muted)'};" />
							<span class="truncate">{status.name}</span>
							<span class="ml-auto text-xs" style="color: var(--text-muted);">{status.bookCount}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Smart Collections Section -->
		<div class="mt-6">
			<button
				class="sidebar-section w-full flex items-center justify-between"
				onclick={() => smartCollectionsOpen = !smartCollectionsOpen}
			>
				<span class="flex items-center gap-1">
					<Wand2 class="w-3 h-3" style="color: var(--accent);" />
					Smart Collections
				</span>
				{#if smartCollectionsOpen}
					<ChevronDown class="w-4 h-4" />
				{:else}
					<ChevronRight class="w-4 h-4" />
				{/if}
			</button>

			{#if smartCollectionsOpen}
				<div class="mt-1 space-y-1">
					{#if data.magicShelves && data.magicShelves.length > 0}
						{#each data.magicShelves.slice(0, 5) as shelf}
							<a href="/shelves/{shelf.id}" class="sidebar-item text-sm" class:active={currentPath === `/shelves/${shelf.id}`}>
								<Wand2 class="w-4 h-4" style="color: {shelf.iconColor || 'var(--text-muted)'};" />
								<span class="truncate">{shelf.name}</span>
								<span class="ml-auto text-xs" style="color: var(--text-muted);">{shelf.bookCount}</span>
							</a>
						{/each}
					{/if}
					<!-- Always show link to manage collections -->
					<a href="/shelves" class="sidebar-item text-sm" class:active={currentPath === '/shelves'} style="color: var(--accent);">
						<Plus class="w-4 h-4" />
						<span>{data.magicShelves && data.magicShelves.length > 0 ? 'Manage Collections' : 'Create Collection'}</span>
					</a>
				</div>
			{/if}
		</div>

		<!-- Management Section -->
		<div class="mt-6">
			<div class="sidebar-section">Manage</div>
			<div class="mt-1 space-y-1">
				<a href="/authors" class="sidebar-item text-sm" class:active={isActive('/authors')}>
					<Users class="w-4 h-4" />
					<span>Authors</span>
				</a>
				<a href="/series" class="sidebar-item text-sm" class:active={isActive('/series')}>
					<Library class="w-4 h-4" />
					<span>Series</span>
				</a>
				<a href="/tags" class="sidebar-item text-sm" class:active={isActive('/tags')}>
					<Tag class="w-4 h-4" />
					<span>Tags</span>
				</a>
				<a href="/narrators" class="sidebar-item text-sm" class:active={isActive('/narrators')}>
					<Mic class="w-4 h-4" />
					<span>Narrators</span>
				</a>
				<a href="/genres" class="sidebar-item text-sm" class:active={isActive('/genres')}>
					<FolderOpen class="w-4 h-4" />
					<span>Genres</span>
				</a>
				<a href="/formats" class="sidebar-item text-sm" class:active={isActive('/formats')}>
					<Layers class="w-4 h-4" />
					<span>Formats</span>
				</a>
				<a href="/statuses" class="sidebar-item text-sm" class:active={isActive('/statuses')}>
					<ListChecks class="w-4 h-4" />
					<span>Statuses</span>
				</a>
			</div>
		</div>

		<!-- Import/Export Section -->
		<div class="mt-6">
			<div class="sidebar-section">Data</div>
			<div class="mt-1 space-y-1">
				<a href="/import" class="sidebar-item text-sm" class:active={isActive('/import')}>
					<Upload class="w-4 h-4" />
					<span>Import</span>
				</a>
				<a href="/export" class="sidebar-item text-sm" class:active={isActive('/export')}>
					<Download class="w-4 h-4" />
					<span>Export</span>
				</a>
			</div>
		</div>

		<!-- Stats & Settings -->
		<div class="mt-6">
			<div class="sidebar-section">More</div>
			<div class="mt-1 space-y-1">
				<a href="/stats" class="sidebar-item text-sm" class:active={isActive('/stats')}>
					<BarChart2 class="w-4 h-4" />
					<span>Statistics</span>
				</a>
				<a href="/recommendations" class="sidebar-item text-sm" class:active={isActive('/recommendations')}>
					<Lightbulb class="w-4 h-4" />
					<span>Recommendations</span>
				</a>
				<a href="/search" class="sidebar-item text-sm" class:active={isActive('/search')}>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<span>Advanced Search</span>
				</a>
			</div>
		</div>
	</nav>

	<!-- Bottom section -->
	<div class="p-3 border-t" style="border-color: var(--border-color);">
		<a href="/settings" class="sidebar-item text-sm" class:active={isActive('/settings')}>
			<Settings class="w-4 h-4" />
			<span>Settings</span>
		</a>
	</div>
</aside>
