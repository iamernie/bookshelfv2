<script lang="ts">
	import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-svelte';
	import type { Toast } from '$stores/toast';
	import { toasts } from '$stores/toast';

	let { toast }: { toast: Toast } = $props();

	const icons = {
		success: CheckCircle,
		error: AlertCircle,
		warning: AlertTriangle,
		info: Info
	};

	const colors = {
		success: 'bg-green-50 border-green-200 text-green-800',
		error: 'bg-red-50 border-red-200 text-red-800',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800'
	};

	const iconColors = {
		success: 'text-green-500',
		error: 'text-red-500',
		warning: 'text-yellow-500',
		info: 'text-blue-500'
	};

	const Icon = icons[toast.type];
</script>

<div
	class="flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-md {colors[
		toast.type
	]}"
	role="alert"
>
	<Icon class="w-5 h-5 flex-shrink-0 {iconColors[toast.type]}" />
	<p class="flex-1 text-sm font-medium">{toast.message}</p>
	<button
		type="button"
		class="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
		onclick={() => toasts.remove(toast.id)}
	>
		<X class="w-4 h-4" />
	</button>
</div>
