<script lang="ts">
	import '../app.css';
	import Navbar from '$components/layout/Navbar.svelte';
	import Toast from '$components/ui/Toast.svelte';
	import { toasts } from '$stores/toast';

	let { children, data } = $props();
</script>

<div class="min-h-screen flex flex-col">
	{#if data.user}
		<Navbar user={data.user} />
	{/if}

	<main class="flex-1">
		{@render children()}
	</main>
</div>

<!-- Toast notifications -->
<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
	{#each $toasts as toast (toast.id)}
		<Toast {toast} />
	{/each}
</div>
