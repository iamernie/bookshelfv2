<script lang="ts">
	/**
	 * IconPicker - A dropdown for selecting Lucide icons
	 */
	import LucideIcon from './LucideIcon.svelte';
	import { X } from 'lucide-svelte';

	let {
		icons,
		value = $bindable(''),
		name = 'icon',
		placeholder = 'Select icon...'
	}: {
		icons: readonly string[];
		value?: string;
		name?: string;
		placeholder?: string;
	} = $props();

	let isOpen = $state(false);
	let search = $state('');

	const filteredIcons = $derived(
		search
			? icons.filter(icon => icon.toLowerCase().includes(search.toLowerCase()))
			: icons
	);

	function selectIcon(icon: string) {
		value = icon;
		isOpen = false;
		search = '';
	}

	function clearIcon() {
		value = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="icon-picker">
	<input type="hidden" {name} bind:value />

	<div class="icon-picker-trigger">
		<button
			type="button"
			class="trigger-main"
			onclick={() => (isOpen = !isOpen)}
		>
			{#if value}
				<LucideIcon name={value} size={18} />
				<span class="icon-name">{value}</span>
			{:else}
				<span class="placeholder">{placeholder}</span>
			{/if}
		</button>
		{#if value}
			<button
				type="button"
				class="clear-btn"
				onclick={clearIcon}
				title="Clear selection"
			>
				<X class="w-3 h-3" />
			</button>
		{/if}
	</div>

	{#if isOpen}
		<div class="icon-picker-dropdown">
			<div class="icon-picker-search">
				<input
					type="text"
					bind:value={search}
					placeholder="Search icons..."
					class="search-input"
				/>
			</div>
			<div class="icon-grid">
				{#each filteredIcons as icon}
					<button
						type="button"
						class="icon-option"
						class:selected={value === icon}
						onclick={() => selectIcon(icon)}
						title={icon}
					>
						<LucideIcon name={icon} size={20} />
					</button>
				{/each}
				{#if filteredIcons.length === 0}
					<div class="no-results">No icons found</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if isOpen}
	<button
		class="backdrop"
		onclick={() => (isOpen = false)}
		aria-label="Close picker"
	></button>
{/if}

<style>
	.icon-picker {
		position: relative;
	}

	.icon-picker-trigger {
		display: flex;
		align-items: center;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		background-color: var(--bg-primary);
		transition: border-color 0.2s;
	}

	.icon-picker-trigger:hover {
		border-color: var(--accent);
	}

	.trigger-main {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		flex: 1;
		background: transparent;
		color: var(--text-primary);
		font-size: 0.875rem;
		cursor: pointer;
		border: none;
		text-align: left;
	}

	.icon-name {
		flex: 1;
		text-align: left;
	}

	.placeholder {
		color: var(--text-muted);
		flex: 1;
		text-align: left;
	}

	.clear-btn {
		padding: 0.5rem;
		border-radius: 0 0.5rem 0.5rem 0;
		color: var(--text-muted);
		transition: background-color 0.2s, color 0.2s;
		background: transparent;
		border: none;
		border-left: 1px solid var(--border-color);
		cursor: pointer;
	}

	.clear-btn:hover {
		background-color: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.icon-picker-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: 0.25rem;
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 50;
		max-height: 280px;
		display: flex;
		flex-direction: column;
	}

	.icon-picker-search {
		padding: 0.5rem;
		border-bottom: 1px solid var(--border-color);
	}

	.search-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 0.375rem;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		font-size: 0.875rem;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.icon-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 0.25rem;
		padding: 0.5rem;
		overflow-y: auto;
	}

	.icon-option {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 0.375rem;
		color: var(--text-muted);
		transition: background-color 0.2s, color 0.2s;
	}

	.icon-option:hover {
		background-color: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.icon-option.selected {
		background-color: var(--accent);
		color: white;
	}

	.no-results {
		grid-column: 1 / -1;
		text-align: center;
		padding: 1rem;
		color: var(--text-muted);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: transparent;
	}
</style>
