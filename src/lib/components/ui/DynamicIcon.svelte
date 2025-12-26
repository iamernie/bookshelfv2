<script lang="ts">
	/**
	 * DynamicIcon - Renders a Font Awesome icon from a class string
	 *
	 * Usage:
	 *   <DynamicIcon icon="fas fa-bookmark" />
	 *   <DynamicIcon icon="fas fa-check-circle" size={20} />
	 */
	let {
		icon,
		size = 16,
		class: className = ''
	}: {
		icon: string | null | undefined;
		size?: number;
		class?: string;
	} = $props();

	// Default icon if none provided
	let iconClass = $derived(icon || 'fas fa-bookmark');
</script>

<i
	class="{iconClass} {className}"
	style="font-size: {size}px; width: {size}px; height: {size}px; display: inline-flex; align-items: center; justify-content: center;"
></i>
