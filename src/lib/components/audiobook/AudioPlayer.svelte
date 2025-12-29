<script lang="ts">
	import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Rewind, FastForward, ChevronDown, ChevronUp } from 'lucide-svelte';
	import { onMount, onDestroy } from 'svelte';

	interface AudioTrack {
		id: number;
		filename: string;
		filePath: string;
		duration: number;
		startOffset: number;
		trackNumber: number;
		title?: string | null;
	}

	interface Props {
		audiobookId: number;
		title: string;
		author?: string | null;
		coverPath?: string | null;
		tracks: AudioTrack[];
		initialTime?: number;
		initialPlaybackRate?: number;
		onProgressUpdate?: (currentTime: number, currentFileId: number, playbackRate: number) => void;
		onEnded?: () => void;
	}

	let {
		audiobookId,
		title,
		author = null,
		coverPath = null,
		tracks,
		initialTime = 0,
		initialPlaybackRate = 1,
		onProgressUpdate,
		onEnded
	}: Props = $props();

	// Audio element reference
	let audioElement: HTMLAudioElement;

	// Player state
	let isPlaying = $state(false);
	let currentTime = $state(initialTime);
	let duration = $state(0);
	let volume = $state(1);
	let isMuted = $state(false);
	let playbackRate = $state(initialPlaybackRate);
	let isLoading = $state(true);
	let isExpanded = $state(true);
	let showVolumeSlider = $state(false);

	// Track management
	let currentTrackIndex = $state(0);
	let currentTrack = $derived(tracks[currentTrackIndex]);

	// Progress update interval
	let progressInterval: ReturnType<typeof setInterval> | null = null;

	// Calculate total duration
	const totalDuration = $derived(
		tracks.reduce((acc, track) => acc + track.duration, 0)
	);

	// Get absolute current time (across all tracks)
	const absoluteCurrentTime = $derived(
		currentTrack ? currentTrack.startOffset + currentTime : 0
	);

	// Progress percentage
	const progressPercent = $derived(
		totalDuration > 0 ? (absoluteCurrentTime / totalDuration) * 100 : 0
	);

	// Playback rate options
	const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

	// Format time helper
	function formatTime(seconds: number): string {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);

		if (hrs > 0) {
			return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Find track index for a given absolute time
	function findTrackForTime(absoluteTime: number): number {
		for (let i = tracks.length - 1; i >= 0; i--) {
			if (absoluteTime >= tracks[i].startOffset) {
				return i;
			}
		}
		return 0;
	}

	// Seek to absolute time
	function seekToAbsoluteTime(absoluteTime: number) {
		const trackIndex = findTrackForTime(absoluteTime);
		const track = tracks[trackIndex];
		const trackTime = absoluteTime - track.startOffset;

		if (trackIndex !== currentTrackIndex) {
			currentTrackIndex = trackIndex;
			loadTrack(trackIndex, trackTime);
		} else if (audioElement) {
			audioElement.currentTime = Math.max(0, Math.min(trackTime, track.duration));
		}
	}

	// Load a track
	function loadTrack(index: number, startTime = 0) {
		if (!tracks[index]) return;

		isLoading = true;
		const track = tracks[index];
		const streamUrl = `/api/audiobooks/${audiobookId}/stream/${track.id}`;

		if (audioElement) {
			const wasPlaying = isPlaying;
			audioElement.src = streamUrl;
			audioElement.currentTime = startTime;
			audioElement.playbackRate = playbackRate;

			audioElement.onloadedmetadata = () => {
				isLoading = false;
				duration = audioElement.duration;
				if (wasPlaying) {
					audioElement.play();
				}
			};
		}
	}

	// Play/Pause toggle
	function togglePlay() {
		if (!audioElement) return;

		if (isPlaying) {
			audioElement.pause();
		} else {
			audioElement.play();
		}
	}

	// Skip forward/backward
	function skip(seconds: number) {
		const newAbsoluteTime = Math.max(0, Math.min(absoluteCurrentTime + seconds, totalDuration));
		seekToAbsoluteTime(newAbsoluteTime);
	}

	// Go to next track
	function nextTrack() {
		if (currentTrackIndex < tracks.length - 1) {
			currentTrackIndex++;
			loadTrack(currentTrackIndex, 0);
		}
	}

	// Go to previous track
	function prevTrack() {
		if (currentTime > 3) {
			// If more than 3 seconds in, restart current track
			if (audioElement) {
				audioElement.currentTime = 0;
			}
		} else if (currentTrackIndex > 0) {
			currentTrackIndex--;
			loadTrack(currentTrackIndex, 0);
		}
	}

	// Toggle mute
	function toggleMute() {
		isMuted = !isMuted;
		if (audioElement) {
			audioElement.muted = isMuted;
		}
	}

	// Set volume
	function setVolume(newVolume: number) {
		volume = newVolume;
		if (audioElement) {
			audioElement.volume = newVolume;
		}
		if (newVolume > 0 && isMuted) {
			isMuted = false;
			audioElement.muted = false;
		}
	}

	// Set playback rate
	function setPlaybackRate(rate: number) {
		playbackRate = rate;
		if (audioElement) {
			audioElement.playbackRate = rate;
		}
	}

	// Handle progress bar click
	function handleProgressClick(e: MouseEvent) {
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const percent = (e.clientX - rect.left) / rect.width;
		const newAbsoluteTime = percent * totalDuration;
		seekToAbsoluteTime(newAbsoluteTime);
	}

	// Report progress to parent
	function reportProgress() {
		if (onProgressUpdate && currentTrack) {
			onProgressUpdate(absoluteCurrentTime, currentTrack.id, playbackRate);
		}
	}

	// Initialize on mount
	onMount(() => {
		// Find initial track based on initialTime
		if (initialTime > 0) {
			const trackIndex = findTrackForTime(initialTime);
			currentTrackIndex = trackIndex;
			const trackTime = initialTime - tracks[trackIndex].startOffset;
			loadTrack(trackIndex, trackTime);
		} else if (tracks.length > 0) {
			loadTrack(0, 0);
		}

		// Set up progress reporting interval
		progressInterval = setInterval(() => {
			if (isPlaying) {
				reportProgress();
			}
		}, 10000); // Report every 10 seconds

		// Keyboard shortcuts
		function handleKeydown(e: KeyboardEvent) {
			// Ignore if typing in input
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			switch (e.code) {
				case 'Space':
					e.preventDefault();
					togglePlay();
					break;
				case 'ArrowLeft':
					e.preventDefault();
					skip(-10);
					break;
				case 'ArrowRight':
					e.preventDefault();
					skip(30);
					break;
				case 'ArrowUp':
					e.preventDefault();
					setVolume(Math.min(1, volume + 0.1));
					break;
				case 'ArrowDown':
					e.preventDefault();
					setVolume(Math.max(0, volume - 0.1));
					break;
				case 'BracketLeft':
					e.preventDefault();
					const lowerRate = playbackRates[Math.max(0, playbackRates.indexOf(playbackRate) - 1)];
					if (lowerRate) setPlaybackRate(lowerRate);
					break;
				case 'BracketRight':
					e.preventDefault();
					const higherRate = playbackRates[Math.min(playbackRates.length - 1, playbackRates.indexOf(playbackRate) + 1)];
					if (higherRate) setPlaybackRate(higherRate);
					break;
			}
		}

		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	onDestroy(() => {
		if (progressInterval) {
			clearInterval(progressInterval);
		}
		// Report final progress
		reportProgress();
	});

	// Audio element event handlers
	function onTimeUpdate() {
		if (audioElement) {
			currentTime = audioElement.currentTime;
		}
	}

	function onPlay() {
		isPlaying = true;
	}

	function onPause() {
		isPlaying = false;
		reportProgress();
	}

	function onTrackEnded() {
		if (currentTrackIndex < tracks.length - 1) {
			// Go to next track
			currentTrackIndex++;
			loadTrack(currentTrackIndex, 0);
			if (isPlaying) {
				audioElement?.play();
			}
		} else {
			// Audiobook finished
			isPlaying = false;
			if (onEnded) {
				onEnded();
			}
		}
	}

	function onError() {
		console.error('[AudioPlayer] Error loading audio');
		isLoading = false;
	}
</script>

<div class="audio-player" class:collapsed={!isExpanded}>
	<!-- Hidden audio element -->
	<audio
		bind:this={audioElement}
		ontimeupdate={onTimeUpdate}
		onplay={onPlay}
		onpause={onPause}
		onended={onTrackEnded}
		onerror={onError}
	></audio>

	{#if isExpanded}
		<!-- Expanded Player -->
		<div class="player-expanded">
			<!-- Cover and info -->
			<div class="player-info">
				{#if coverPath}
					<img
						src={coverPath}
						alt={title}
						class="player-cover"
						onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
					/>
				{:else}
					<div class="player-cover-placeholder">
						<span class="text-2xl">🎧</span>
					</div>
				{/if}
				<div class="player-text">
					<div class="player-title">{title}</div>
					{#if author}
						<div class="player-author">{author}</div>
					{/if}
					{#if currentTrack?.title}
						<div class="player-track">{currentTrack.title}</div>
					{/if}
				</div>
			</div>

			<!-- Progress bar -->
			<div class="progress-container">
				<button
					class="progress-bar"
					onclick={handleProgressClick}
					type="button"
					aria-label="Seek"
				>
					<div class="progress-fill" style="width: {progressPercent}%"></div>
				</button>
				<div class="progress-times">
					<span>{formatTime(absoluteCurrentTime)}</span>
					<span>{formatTime(totalDuration)}</span>
				</div>
			</div>

			<!-- Controls -->
			<div class="player-controls">
				<!-- Skip back 10s -->
				<button onclick={() => skip(-10)} class="control-btn" title="Rewind 10s">
					<Rewind class="w-5 h-5" />
				</button>

				<!-- Previous track -->
				<button onclick={prevTrack} class="control-btn" title="Previous">
					<SkipBack class="w-5 h-5" />
				</button>

				<!-- Play/Pause -->
				<button
					onclick={togglePlay}
					class="control-btn play-btn"
					disabled={isLoading}
					title={isPlaying ? 'Pause' : 'Play'}
				>
					{#if isLoading}
						<div class="loading-spinner"></div>
					{:else if isPlaying}
						<Pause class="w-6 h-6" />
					{:else}
						<Play class="w-6 h-6 ml-0.5" />
					{/if}
				</button>

				<!-- Next track -->
				<button onclick={nextTrack} class="control-btn" title="Next">
					<SkipForward class="w-5 h-5" />
				</button>

				<!-- Skip forward 30s -->
				<button onclick={() => skip(30)} class="control-btn" title="Forward 30s">
					<FastForward class="w-5 h-5" />
				</button>
			</div>

			<!-- Secondary controls -->
			<div class="player-secondary">
				<!-- Speed control -->
				<div class="speed-control">
					<select
						value={playbackRate}
						onchange={(e) => setPlaybackRate(parseFloat((e.target as HTMLSelectElement).value))}
						class="speed-select"
					>
						{#each playbackRates as rate}
							<option value={rate}>{rate}x</option>
						{/each}
					</select>
				</div>

				<!-- Volume control -->
				<div class="volume-control">
					<button onclick={toggleMute} class="control-btn-sm" title={isMuted ? 'Unmute' : 'Mute'}>
						{#if isMuted || volume === 0}
							<VolumeX class="w-4 h-4" />
						{:else}
							<Volume2 class="w-4 h-4" />
						{/if}
					</button>
					<input
						type="range"
						min="0"
						max="1"
						step="0.05"
						value={isMuted ? 0 : volume}
						oninput={(e) => setVolume(parseFloat((e.target as HTMLInputElement).value))}
						class="volume-slider"
					/>
				</div>

				<!-- Collapse button -->
				<button onclick={() => isExpanded = false} class="control-btn-sm" title="Minimize">
					<ChevronDown class="w-4 h-4" />
				</button>
			</div>
		</div>
	{:else}
		<!-- Collapsed Player (mini bar) -->
		<div class="player-collapsed">
			<div class="mini-progress" style="width: {progressPercent}%"></div>

			<div class="mini-info">
				<span class="mini-title">{title}</span>
				<span class="mini-time">{formatTime(absoluteCurrentTime)} / {formatTime(totalDuration)}</span>
			</div>

			<div class="mini-controls">
				<button onclick={togglePlay} class="control-btn-sm" disabled={isLoading}>
					{#if isPlaying}
						<Pause class="w-4 h-4" />
					{:else}
						<Play class="w-4 h-4" />
					{/if}
				</button>
				<button onclick={() => isExpanded = true} class="control-btn-sm">
					<ChevronUp class="w-4 h-4" />
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.audio-player {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 50;
		background: var(--card-bg);
		border-top: 1px solid var(--border-color);
		box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15);
	}

	.player-expanded {
		padding: 1rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.player-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.player-cover {
		width: 48px;
		height: 48px;
		object-fit: cover;
		border-radius: 6px;
	}

	.player-cover-placeholder {
		width: 48px;
		height: 48px;
		background: var(--bg-secondary);
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.player-text {
		flex: 1;
		min-width: 0;
	}

	.player-title {
		font-weight: 600;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.player-author {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.player-track {
		font-size: 0.75rem;
		color: var(--text-muted);
		opacity: 0.8;
	}

	.progress-container {
		width: 100%;
	}

	.progress-bar {
		width: 100%;
		height: 6px;
		background: var(--bg-secondary);
		border-radius: 3px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		border: none;
		padding: 0;
	}

	.progress-bar:hover {
		height: 8px;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent-color, #3b82f6);
		border-radius: 3px;
		transition: width 0.1s ease;
	}

	.progress-times {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
	}

	.player-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.control-btn {
		width: 40px;
		height: 40px;
		border: none;
		background: transparent;
		color: var(--text-primary);
		cursor: pointer;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.control-btn:hover {
		background: var(--bg-secondary);
	}

	.control-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.play-btn {
		width: 56px;
		height: 56px;
		background: var(--accent-color, #3b82f6);
		color: white;
	}

	.play-btn:hover {
		background: var(--accent-color-hover, #2563eb);
	}

	.control-btn-sm {
		width: 32px;
		height: 32px;
		border: none;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.control-btn-sm:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.player-secondary {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem;
	}

	.speed-control {
		display: flex;
		align-items: center;
	}

	.speed-select {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
		color: var(--text-primary);
		cursor: pointer;
	}

	.volume-control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.volume-slider {
		width: 80px;
		height: 4px;
		-webkit-appearance: none;
		background: var(--bg-secondary);
		border-radius: 2px;
		cursor: pointer;
	}

	.volume-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 12px;
		height: 12px;
		background: var(--accent-color, #3b82f6);
		border-radius: 50%;
		cursor: pointer;
	}

	.loading-spinner {
		width: 24px;
		height: 24px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Collapsed state */
	.player-collapsed {
		height: 48px;
		display: flex;
		align-items: center;
		padding: 0 1rem;
		position: relative;
	}

	.mini-progress {
		position: absolute;
		top: 0;
		left: 0;
		height: 2px;
		background: var(--accent-color, #3b82f6);
	}

	.mini-info {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 1rem;
		min-width: 0;
	}

	.mini-title {
		font-weight: 500;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.mini-time {
		font-size: 0.75rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.mini-controls {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	/* Responsive */
	@media (min-width: 768px) {
		.player-expanded {
			flex-direction: row;
			align-items: center;
			gap: 1.5rem;
		}

		.player-info {
			flex: 0 0 auto;
			max-width: 300px;
		}

		.progress-container {
			flex: 1;
		}

		.player-controls {
			flex: 0 0 auto;
		}

		.player-secondary {
			flex: 0 0 auto;
		}
	}
</style>
