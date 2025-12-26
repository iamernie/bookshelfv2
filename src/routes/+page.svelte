<script lang="ts">
	import { Users, Library, TrendingUp, BookOpen, Target, Trophy, ArrowRight, ArrowUp, ArrowDown, Minus } from 'lucide-svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import BookCard from '$lib/components/book/BookCard.svelte';
	import type { BookCardData } from '$lib/types';
	import { toasts } from '$lib/stores/toast';

	let { data } = $props();

	function handleBookClick(book: BookCardData) {
		goto(`/books/${book.id}`);
	}

	async function handleQuickEdit(bookId: number, field: string, value: any) {
		const res = await fetch(`/api/books/${bookId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ [field]: value })
		});
		if (res.ok) {
			toasts.success(`Updated ${field === 'statusId' ? 'status' : field}`);
			invalidateAll();
		} else {
			const err = await res.json();
			toasts.error(err.message || `Failed to update ${field}`);
		}
	}

	function getPaceColor(status: string) {
		switch (status) {
			case 'ahead':
				return '#22c55e';
			case 'behind':
				return '#ef4444';
			default:
				return '#eab308';
		}
	}
</script>

<svelte:head>
	<title>Dashboard | BookShelf</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-8" style="color: var(--text-primary);">Dashboard</h1>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-primary-100 rounded-lg">
					<BookOpen class="w-6 h-6 text-primary-600" />
				</div>
				<div>
					<p class="text-sm" style="color: var(--text-secondary);">Total Books</p>
					<p class="text-2xl font-bold" style="color: var(--text-primary);">{data.stats.totalBooks}</p>
				</div>
			</div>
		</div>

		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-green-100 rounded-lg">
					<TrendingUp class="w-6 h-6 text-green-600" />
				</div>
				<div>
					<p class="text-sm" style="color: var(--text-secondary);">Read This Year</p>
					<p class="text-2xl font-bold" style="color: var(--text-primary);">{data.stats.readThisYear}</p>
				</div>
			</div>
		</div>

		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-purple-100 rounded-lg">
					<Users class="w-6 h-6 text-purple-600" />
				</div>
				<div>
					<p class="text-sm" style="color: var(--text-secondary);">Authors</p>
					<p class="text-2xl font-bold" style="color: var(--text-primary);">{data.stats.totalAuthors}</p>
				</div>
			</div>
		</div>

		<div class="card p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-orange-100 rounded-lg">
					<Library class="w-6 h-6 text-orange-600" />
				</div>
				<div>
					<p class="text-sm" style="color: var(--text-secondary);">Series</p>
					<p class="text-2xl font-bold" style="color: var(--text-primary);">{data.stats.totalSeries}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Reading Goal Widget -->
	{#if data.goalData}
		<section class="mb-8">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold" style="color: var(--text-primary);">
					{data.goalData.year} Reading Goal
				</h2>
				<a href="/stats/goals" class="flex items-center gap-1 text-sm hover:underline" style="color: var(--accent);">
					View all goals
					<ArrowRight class="w-4 h-4" />
				</a>
			</div>
			<div class="card p-6">
				<div class="flex flex-col lg:flex-row lg:items-center gap-6">
					<!-- Main Progress -->
					<div class="flex-1">
						<div class="flex items-center gap-4 mb-4">
							<div class="p-3 rounded-lg" style="background-color: var(--accent); opacity: 0.15;">
								<Target class="w-8 h-8" style="color: var(--accent);" />
							</div>
							<div>
								<div class="flex items-baseline gap-2">
									<span class="text-4xl font-bold" style="color: var(--text-primary);">{data.goalData.booksRead}</span>
									<span class="text-lg" style="color: var(--text-muted);">/ {data.goalData.targetBooks} books</span>
								</div>
								<div class="flex items-center gap-2 mt-1">
									{#if data.goalData.progress >= 100}
										<Trophy class="w-4 h-4 text-yellow-500" />
										<span class="text-sm font-medium text-yellow-600">Goal achieved!</span>
									{:else}
										<span class="text-sm" style="color: var(--text-muted);">{data.goalData.remaining} more to reach your goal</span>
									{/if}
								</div>
							</div>
						</div>

						<!-- Progress Bar -->
						<div class="mb-4">
							<div class="h-3 rounded-full overflow-hidden" style="background-color: var(--border-color);">
								<div
									class="h-full rounded-full transition-all duration-500"
									style="width: {data.goalData.progress}%; background-color: {data.goalData.progress >= 100 ? '#22c55e' : 'var(--accent)'};"
								></div>
							</div>
							<div class="flex justify-between text-xs mt-1" style="color: var(--text-muted);">
								<span>{data.goalData.progress}% complete</span>
								<span>Target: {data.goalData.targetBooks}</span>
							</div>
						</div>

						<!-- Pace Status -->
						<div class="flex items-center gap-2">
							<div
								class="w-6 h-6 rounded-full flex items-center justify-center"
								style="background-color: {getPaceColor(data.goalData.paceStatus)}20;"
							>
								{#if data.goalData.paceStatus === 'ahead'}
									<ArrowUp class="w-3.5 h-3.5" style="color: {getPaceColor(data.goalData.paceStatus)};" />
								{:else if data.goalData.paceStatus === 'behind'}
									<ArrowDown class="w-3.5 h-3.5" style="color: {getPaceColor(data.goalData.paceStatus)};" />
								{:else}
									<Minus class="w-3.5 h-3.5" style="color: {getPaceColor(data.goalData.paceStatus)};" />
								{/if}
							</div>
							<span class="text-sm" style="color: {getPaceColor(data.goalData.paceStatus)};">
								{#if data.goalData.paceStatus === 'ahead'}
									{data.goalData.paceDiff} books ahead
								{:else if data.goalData.paceStatus === 'behind'}
									{data.goalData.paceDiff} books behind
								{:else}
									On track
								{/if}
							</span>
							<span class="text-xs" style="color: var(--text-muted);">
								(Expected: {data.goalData.expectedByNow} by now)
							</span>
						</div>
					</div>

					<!-- Challenge Summary -->
					{#if data.goalData.challenges && data.goalData.challenges.length > 1}
						<div class="lg:w-64 lg:border-l lg:pl-6" style="border-color: var(--border-color);">
							<h3 class="text-sm font-medium mb-3" style="color: var(--text-muted);">Active Challenges</h3>
							<div class="space-y-3">
								{#each data.goalData.challenges.filter(c => c.type !== 'books').slice(0, 3) as challenge}
									<div class="flex items-center gap-3">
										<div class="flex-1 min-w-0">
											<div class="flex items-center justify-between text-xs mb-1">
												<span class="truncate" style="color: var(--text-primary);">{challenge.typeInfo.name}</span>
												<span style="color: {challenge.isComplete ? '#22c55e' : 'var(--text-muted)'};">
													{challenge.current}/{challenge.target}
												</span>
											</div>
											<div class="h-1.5 rounded-full overflow-hidden" style="background-color: var(--border-color);">
												<div
													class="h-full rounded-full"
													style="width: {challenge.progress}%; background-color: {challenge.isComplete ? '#22c55e' : 'var(--accent)'};"
												></div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<!-- Currently Reading -->
	{#if data.currentlyReading.length > 0}
		<section class="mb-8">
			<h2 class="text-xl font-semibold mb-4" style="color: var(--text-primary);">Currently Reading</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each data.currentlyReading as book}
					<BookCard
						{book}
						onClick={handleBookClick}
						showStatus={false}
						quickEdit={true}
						statuses={data.statuses}
						onQuickEdit={handleQuickEdit}
					/>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Recently Added -->
	{#if data.recentlyAdded.length > 0}
		<section>
			<h2 class="text-xl font-semibold mb-4" style="color: var(--text-primary);">Recently Added</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each data.recentlyAdded as book}
					<BookCard
						{book}
						onClick={handleBookClick}
						quickEdit={true}
						statuses={data.statuses}
						onQuickEdit={handleQuickEdit}
					/>
				{/each}
			</div>
		</section>
	{/if}
</div>
