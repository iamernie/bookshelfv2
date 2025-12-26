<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			if (!res.ok) {
				const data = await res.json();
				error = data.message || 'Login failed';
				return;
			}

			// Invalidate all data to reload user session, then redirect
			await invalidateAll();
			goto('/');
		} catch (err) {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - BookShelf</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style="background-color: var(--bg-primary);">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h1 class="text-center text-3xl font-bold" style="color: var(--text-primary);">BookShelf</h1>
			<h2 class="mt-2 text-center text-lg" style="color: var(--text-secondary);">Sign in to your account</h2>
		</div>

		<form class="mt-8 space-y-6 card p-6" onsubmit={handleSubmit}>
			{#if error}
				<div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded">
					{error}
				</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label for="email" class="label">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						autocomplete="email"
						class="input"
					/>
				</div>

				<div>
					<label for="password" class="label">Password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						autocomplete="current-password"
						class="input"
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="btn-accent w-full justify-center"
			>
				{#if loading}
					Signing in...
				{:else}
					Sign in
				{/if}
			</button>
		</form>
	</div>
</div>
