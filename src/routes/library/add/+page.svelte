<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Upload, FileAudio, FileText, BookOpen, ChevronLeft, X, Loader2,
		Library, User, Search, Info, AlignLeft, Image, Fingerprint,
		Headphones, Music, Check, AlertCircle, Star, Tag, Database,
		Calendar, Globe
	} from 'lucide-svelte';
	import { toasts } from '$lib/stores/toast';
	import MetadataSearchModal from '$lib/components/book/MetadataSearchModal.svelte';

	let { data } = $props();

	// File type detection
	const EBOOK_EXTENSIONS = ['.epub', '.pdf', '.cbz'];
	const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.m4b', '.aac', '.ogg', '.opus', '.flac', '.wav'];

	type MediaType = 'ebook' | 'audiobook' | null;

	// State
	let step = $state<'upload' | 'form'>('upload');
	let mediaType = $state<MediaType>(null);
	let uploadedFile = $state<File | null>(null);
	let extractedMetadata = $state<any>(null);
	let isExtracting = $state(false);
	let isDragging = $state(false);
	let isSubmitting = $state(false);

	// Metadata search modal
	let showMetadataModal = $state(false);

	// Form fields - Basic
	let title = $state('');
	let summary = $state('');
	let coverUrl = $state('');
	let rating = $state('');

	// Authors with roles
	let authorSearch = $state('');
	let authorRole = $state('Author');
	let selectedAuthors = $state<{ id: number; name: string; role: string }[]>([]);
	let showAuthorDropdown = $state(false);

	// Series with book numbers
	let seriesSearch = $state('');
	let seriesBookNum = $state('');
	let selectedSeries = $state<{ id: number; title: string; bookNum: string; bookNumEnd: string }[]>([]);
	let showSeriesDropdown = $state(false);

	// Classification
	let genreId = $state('');
	let formatId = $state('');
	let statusId = $state('');
	let selectedTagIds = $state<number[]>([]);

	// Audiobook specific
	let narratorId = $state('');
	let narratorName = $state('');

	// Identifiers
	let isbn13 = $state('');
	let isbn10 = $state('');
	let asin = $state('');
	let goodreadsId = $state('');
	let googleBooksId = $state('');

	// Publication
	let publisher = $state('');
	let publishYear = $state('');
	let pageCount = $state('');
	let language = $state('English');

	// Dates
	let releaseDate = $state('');
	let startReadingDate = $state('');
	let completedDate = $state('');

	// Filtered options
	let filteredAuthors = $derived(
		data.options.authors.filter(a =>
			a.name.toLowerCase().includes(authorSearch.toLowerCase()) &&
			!selectedAuthors.some(sa => sa.id === a.id)
		).slice(0, 8)
	);

	let filteredSeries = $derived(
		data.options.series.filter(s =>
			s.title.toLowerCase().includes(seriesSearch.toLowerCase()) &&
			!selectedSeries.some(ss => ss.id === s.id)
		).slice(0, 8)
	);

	const authorRoles = ['Author', 'Co-Author', 'Editor', 'Translator', 'Illustrator', 'Contributor', 'Foreword By', 'Afterword By'];
	const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Japanese', 'Chinese', 'Korean', 'Dutch', 'Swedish', 'Polish', 'Other'];

	function getFileExtension(filename: string): string {
		return filename.slice(filename.lastIndexOf('.')).toLowerCase();
	}

	function detectMediaType(file: File): MediaType {
		const ext = getFileExtension(file.name);
		if (EBOOK_EXTENSIONS.includes(ext)) return 'ebook';
		if (AUDIO_EXTENSIONS.includes(ext)) return 'audiobook';
		return null;
	}

	async function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) await processFile(file);
	}

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) await processFile(file);
	}

	async function processFile(file: File) {
		const type = detectMediaType(file);

		if (!type) {
			toasts.error('Unsupported file type. Please upload an ebook (EPUB, PDF, CBZ) or audiobook (MP3, M4A, M4B, etc.)');
			return;
		}

		const maxSize = type === 'ebook' ? 100 * 1024 * 1024 : 500 * 1024 * 1024;
		if (file.size > maxSize) {
			toasts.error(`File too large. Maximum size is ${type === 'ebook' ? '100MB' : '500MB'}`);
			return;
		}

		uploadedFile = file;
		mediaType = type;

		// Try to extract metadata
		isExtracting = true;
		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch('/api/metadata/extract', {
				method: 'POST',
				body: formData
			});

			if (res.ok) {
				const metadata = await res.json();
				extractedMetadata = metadata;
				applyExtractedMetadata(metadata);
			}
		} catch (err) {
			console.error('Failed to extract metadata:', err);
		} finally {
			isExtracting = false;
		}

		step = 'form';
	}

	function applyExtractedMetadata(metadata: any) {
		if (metadata.title) title = metadata.title;
		if (metadata.author) {
			const existingAuthor = data.options.authors.find(
				a => a.name.toLowerCase() === metadata.author.toLowerCase()
			);
			if (existingAuthor) {
				selectedAuthors = [{ id: existingAuthor.id, name: existingAuthor.name, role: 'Author' }];
			} else {
				authorSearch = metadata.author;
			}
		}
		if (metadata.narrator) narratorName = metadata.narrator;
		if (metadata.description) summary = metadata.description;
		if (metadata.coverUrl) coverUrl = metadata.coverUrl;
		if (metadata.isbn13) isbn13 = metadata.isbn13;
		if (metadata.isbn10) isbn10 = metadata.isbn10;
		if (metadata.publisher) publisher = metadata.publisher;
		if (metadata.publishYear) publishYear = metadata.publishYear.toString();
		if (metadata.language) language = metadata.language;
	}

	function applyMetadataResult(result: any, selectedFields: string[]) {
		for (const field of selectedFields) {
			switch (field) {
				case 'title':
					if (result.title) title = result.title;
					break;
				case 'summary':
					if (result.description) summary = result.description;
					break;
				case 'coverUrl':
					if (result.coverUrl) coverUrl = result.coverUrl;
					break;
				case 'isbn13':
					if (result.isbn13) isbn13 = result.isbn13;
					break;
				case 'isbn10':
					if (result.isbn10) isbn10 = result.isbn10;
					break;
				case 'publisher':
					if (result.publisher) publisher = result.publisher;
					break;
				case 'publishYear':
					if (result.publishYear) publishYear = result.publishYear.toString();
					break;
				case 'pageCount':
					if (result.pageCount) pageCount = result.pageCount.toString();
					break;
				case 'language':
					if (result.language) language = result.language;
					break;
				case 'rating':
					if (result.rating) rating = result.rating.toString();
					break;
			}
		}

		// Store provider IDs
		if (result.provider === 'goodreads' && result.providerId) {
			goodreadsId = result.providerId;
		} else if (result.provider === 'googlebooks' && result.providerId) {
			googleBooksId = result.providerId;
		}

		toasts.success(`Applied ${selectedFields.length} fields from ${result.provider}`);
	}

	function skipFileUpload() {
		step = 'form';
	}

	function goBackToUpload() {
		step = 'upload';
		uploadedFile = null;
		mediaType = null;
		extractedMetadata = null;
		resetForm();
	}

	function resetForm() {
		title = '';
		summary = '';
		coverUrl = '';
		rating = '';
		selectedAuthors = [];
		selectedSeries = [];
		genreId = '';
		formatId = '';
		statusId = '';
		selectedTagIds = [];
		narratorId = '';
		narratorName = '';
		isbn13 = '';
		isbn10 = '';
		asin = '';
		goodreadsId = '';
		googleBooksId = '';
		publisher = '';
		publishYear = '';
		pageCount = '';
		language = 'English';
		releaseDate = '';
		startReadingDate = '';
		completedDate = '';
	}

	function addAuthor(author: { id: number; name: string }) {
		selectedAuthors = [...selectedAuthors, { id: author.id, name: author.name, role: authorRole }];
		authorSearch = '';
		authorRole = 'Author';
		showAuthorDropdown = false;
	}

	function removeAuthor(id: number) {
		selectedAuthors = selectedAuthors.filter(a => a.id !== id);
	}

	function addSeries(s: { id: number; title: string }) {
		selectedSeries = [...selectedSeries, { id: s.id, title: s.title, bookNum: seriesBookNum, bookNumEnd: '' }];
		seriesSearch = '';
		seriesBookNum = '';
		showSeriesDropdown = false;
	}

	function removeSeries(id: number) {
		selectedSeries = selectedSeries.filter(s => s.id !== id);
	}

	function toggleTag(tagId: number) {
		if (selectedTagIds.includes(tagId)) {
			selectedTagIds = selectedTagIds.filter(id => id !== tagId);
		} else {
			selectedTagIds = [...selectedTagIds, tagId];
		}
	}

	async function handleSubmit() {
		console.log('[library/add] handleSubmit called');
		console.log('[library/add] title:', title);
		console.log('[library/add] mediaType:', mediaType);
		console.log('[library/add] uploadedFile:', uploadedFile?.name);

		if (!title.trim()) {
			toasts.error('Title is required');
			return;
		}

		isSubmitting = true;

		try {
			// Create the book
			const bookData = {
				title: title.trim(),
				summary: summary.trim() || null,
				rating: rating ? parseFloat(rating) : null,
				coverImageUrl: null,
				originalCoverUrl: coverUrl.trim() || null,
				genreId: genreId ? parseInt(genreId) : null,
				formatId: formatId ? parseInt(formatId) : null,
				statusId: statusId ? parseInt(statusId) : null,
				narratorId: narratorId ? parseInt(narratorId) : null,
				isbn13: isbn13.trim() || null,
				isbn10: isbn10.trim() || null,
				asin: asin.trim() || null,
				goodreadsId: goodreadsId.trim() || null,
				googleBooksId: googleBooksId.trim() || null,
				publisher: publisher.trim() || null,
				publishYear: publishYear ? parseInt(publishYear) : null,
				pageCount: pageCount ? parseInt(pageCount) : null,
				language: language || 'English',
				releaseDate: releaseDate || null,
				startReadingDate: startReadingDate || null,
				completedDate: completedDate || null,
				authors: selectedAuthors.map(a => ({ id: a.id, role: a.role })),
				series: selectedSeries.map(s => ({
					id: s.id,
					bookNum: s.bookNum ? parseFloat(s.bookNum) : null,
					bookNumEnd: s.bookNumEnd ? parseFloat(s.bookNumEnd) : null
				})),
				tagIds: selectedTagIds,
				libraryType: data.isPublic ? 'public' : 'personal'
			};

			console.log('[library/add] Creating book with data:', bookData);

			const bookRes = await fetch('/api/books', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(bookData)
			});

			console.log('[library/add] Book creation response status:', bookRes.status);

			if (!bookRes.ok) {
				const err = await bookRes.json();
				console.error('[library/add] Book creation failed:', err);
				throw new Error(err.message || 'Failed to create book');
			}

			const newBook = await bookRes.json();
			console.log('[library/add] Book created:', newBook.id);

			// Upload file if we have one
			if (uploadedFile) {
				const formData = new FormData();

				if (mediaType === 'ebook') {
					formData.append('ebook', uploadedFile);
					const uploadRes = await fetch(`/api/ebooks/${newBook.id}/upload`, {
						method: 'POST',
						body: formData
					});

					if (!uploadRes.ok) {
						toasts.warning('Book created but file upload failed. You can upload the file later.');
					}
				} else if (mediaType === 'audiobook') {
					// Create audiobook entry linked to book
					console.log('[library/add] Creating audiobook...');
					const audiobookPayload = {
						title: title.trim(),
						bookId: newBook.id,
						author: selectedAuthors[0]?.name || null,
						narratorName: narratorName.trim() || null,
						narratorId: narratorId ? parseInt(narratorId) : null,
						libraryType: data.isPublic ? 'public' : 'personal'
					};
					console.log('[library/add] Audiobook payload:', audiobookPayload);

					const audiobookRes = await fetch('/api/audiobooks', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(audiobookPayload)
					});

					console.log('[library/add] Audiobook creation response status:', audiobookRes.status);

					if (audiobookRes.ok) {
						const audiobook = await audiobookRes.json();
						console.log('[library/add] Audiobook created:', audiobook.id);
						console.log('[library/add] Uploading audio file:', uploadedFile.name, uploadedFile.size);

						formData.append('files', uploadedFile);
						const audioUploadRes = await fetch(`/api/audiobooks/${audiobook.id}/files`, {
							method: 'POST',
							body: formData
						});

						console.log('[library/add] Audio file upload response status:', audioUploadRes.status);

						if (!audioUploadRes.ok) {
							const errData = await audioUploadRes.json().catch(() => ({}));
							console.error('[library/add] Audio file upload failed:', errData);
							toasts.warning('Book created but audio file upload failed. You can upload the file later.');
						} else {
							console.log('[library/add] Audio file uploaded successfully');
						}
					} else {
						const errData = await audiobookRes.json().catch(() => ({}));
						console.error('[library/add] Audiobook creation failed:', errData);
						toasts.warning('Book created but audiobook creation failed.');
					}
				}
			}

			// Download cover if we have a URL
			if (coverUrl.trim()) {
				try {
					await fetch('/api/covers/download', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ url: coverUrl.trim(), bookId: newBook.id })
					});
				} catch {
					// Cover download failed - not critical
				}
			}

			toasts.success(data.isPublic ? 'Added to public library!' : 'Book added!');
			goto(`/books/${newBook.id}`);

		} catch (err: any) {
			toasts.error(err.message || 'Failed to add to library');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>{data.isPublic ? 'Add to Public Library' : 'Add Book'} | BookShelf</title>
</svelte:head>

<div class="container mx-auto px-4 py-6 max-w-4xl">
	<!-- Header -->
	<div class="flex items-center gap-4 mb-6">
		<a href="/books" class="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
			<ChevronLeft class="w-6 h-6" style="color: var(--text-primary);" />
		</a>
		<div class="flex-1">
			<div class="flex items-center gap-3">
				<h1 class="text-xl font-bold" style="color: var(--text-primary);">
					{data.isPublic ? 'Add to Public Library' : 'Add Book'}
				</h1>
				{#if data.isPublic}
					<span class="px-2 py-1 rounded-full text-xs font-medium" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">
						<Globe class="w-3 h-3 inline mr-1" />
						Public
					</span>
				{/if}
			</div>
			{#if data.isPublic}
				<p class="text-sm mt-1" style="color: var(--text-muted);">This will be visible to all users</p>
			{/if}
		</div>

		<!-- Back button when in public library mode -->
		{#if data.isPublic}
			<a
				href="/library/add"
				class="px-3 py-1.5 rounded-lg text-sm transition-colors"
				style="background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-color);"
			>
				Back to Personal
			</a>
		{/if}
	</div>

	{#if step === 'upload'}
		<!-- Upload Step -->
		<div class="space-y-6">
			<!-- Drop Zone -->
			<div
				class="relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer"
				style="border-color: {isDragging ? 'var(--accent)' : 'var(--border-color)'}; background: {isDragging ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-secondary)'};"
				ondragover={(e) => { e.preventDefault(); isDragging = true; }}
				ondragleave={() => isDragging = false}
				ondrop={handleFileDrop}
				onclick={() => document.getElementById('file-input')?.click()}
				role="button"
				tabindex="0"
				onkeydown={(e) => { if (e.key === 'Enter') document.getElementById('file-input')?.click(); }}
			>
				<input
					id="file-input"
					type="file"
					class="hidden"
					accept=".epub,.pdf,.cbz,.mp3,.m4a,.m4b,.aac,.ogg,.opus,.flac,.wav"
					onchange={handleFileSelect}
				/>

				<div class="flex justify-center gap-4 mb-4">
					<div class="w-16 h-16 rounded-xl flex items-center justify-center" style="background: rgba(59, 130, 246, 0.1);">
						<FileText class="w-8 h-8" style="color: #3b82f6;" />
					</div>
					<div class="w-16 h-16 rounded-xl flex items-center justify-center" style="background: rgba(139, 92, 246, 0.1);">
						<FileAudio class="w-8 h-8" style="color: #8b5cf6;" />
					</div>
				</div>

				<p class="text-lg font-medium mb-2" style="color: var(--text-primary);">
					Drop your file here or click to browse
				</p>
				<p class="text-sm mb-4" style="color: var(--text-muted);">
					We'll detect the type and extract metadata automatically
				</p>

				<div class="flex flex-wrap justify-center gap-2 text-xs" style="color: var(--text-muted);">
					<span class="px-2 py-1 rounded" style="background: var(--bg-tertiary);">EPUB</span>
					<span class="px-2 py-1 rounded" style="background: var(--bg-tertiary);">PDF</span>
					<span class="px-2 py-1 rounded" style="background: var(--bg-tertiary);">CBZ</span>
					<span class="px-2 py-1 rounded" style="background: var(--bg-tertiary);">MP3</span>
					<span class="px-2 py-1 rounded" style="background: var(--bg-tertiary);">M4A</span>
					<span class="px-2 py-1 rounded" style="background: var(--bg-tertiary);">M4B</span>
					<span class="px-2 py-1 rounded" style="background: var(--bg-tertiary);">FLAC</span>
				</div>
			</div>

			<!-- Alternative options -->
			<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
				<div class="h-px flex-1 max-w-[100px]" style="background: var(--border-color);"></div>
				<span class="text-sm" style="color: var(--text-muted);">or</span>
				<div class="h-px flex-1 max-w-[100px]" style="background: var(--border-color);"></div>
			</div>

			<div class="flex flex-col sm:flex-row justify-center gap-4">
				{#if data.isPublic}
					<!-- Public library requires a file - show info message -->
					<div class="text-center px-6 py-3 rounded-lg" style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3);">
						<p class="text-sm" style="color: #ca8a04;">
							<AlertCircle class="w-4 h-4 inline mr-1" />
							Public library entries require an ebook or audiobook file
						</p>
					</div>
				{:else}
					<!-- Search metadata button -->
					<button
						type="button"
						class="px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
						style="background: var(--accent); color: white;"
						onclick={() => { step = 'form'; showMetadataModal = true; }}
					>
						<Database class="w-5 h-5" />
						Search Online Databases
					</button>

					<!-- Skip file option (personal library only) -->
					<button
						type="button"
						class="px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
						style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);"
						onclick={skipFileUpload}
					>
						<BookOpen class="w-5 h-5" />
						Add Manually
					</button>
				{/if}
			</div>
		</div>

	{:else if step === 'form'}
		<!-- Form Step -->
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
			<!-- File info banner -->
			{#if uploadedFile}
				<div class="p-4 rounded-lg flex items-center gap-4" style="background: {mediaType === 'ebook' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)'}; border: 1px solid {mediaType === 'ebook' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'};">
					{#if mediaType === 'ebook'}
						<FileText class="w-8 h-8 flex-shrink-0" style="color: #3b82f6;" />
					{:else}
						<FileAudio class="w-8 h-8 flex-shrink-0" style="color: #8b5cf6;" />
					{/if}
					<div class="flex-1 min-w-0">
						<p class="font-medium truncate" style="color: var(--text-primary);">{uploadedFile.name}</p>
						<p class="text-sm" style="color: var(--text-muted);">
							{mediaType === 'ebook' ? 'Ebook' : 'Audiobook'} • {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
							{#if isExtracting}
								<span class="ml-2 inline-flex items-center gap-1">
									<Loader2 class="w-3 h-3 animate-spin" />
									Extracting metadata...
								</span>
							{:else if extractedMetadata}
								<span class="ml-2 inline-flex items-center gap-1 text-green-500">
									<Check class="w-3 h-3" />
									Metadata extracted
								</span>
							{/if}
						</p>
					</div>
					<button
						type="button"
						class="p-2 rounded-lg transition-colors hover:bg-black/10"
						style="color: var(--text-muted);"
						onclick={goBackToUpload}
						title="Remove file"
					>
						<X class="w-5 h-5" />
					</button>
				</div>
			{:else if data.isPublic}
				<!-- Public library requires file - show error -->
				<div class="p-4 rounded-lg flex items-center gap-4" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);">
					<AlertCircle class="w-8 h-8 flex-shrink-0" style="color: #ef4444;" />
					<div class="flex-1">
						<p class="font-medium" style="color: #ef4444;">File required for public library</p>
						<p class="text-sm" style="color: var(--text-muted);">Public library entries must have an ebook or audiobook file attached</p>
					</div>
					<button
						type="button"
						class="px-3 py-1.5 rounded-lg text-sm transition-colors"
						style="background: var(--accent); color: white;"
						onclick={goBackToUpload}
					>
						Upload file
					</button>
				</div>
			{:else}
				<!-- Personal library - file optional -->
				<div class="p-4 rounded-lg flex items-center gap-4" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
					<BookOpen class="w-8 h-8 flex-shrink-0" style="color: var(--text-muted);" />
					<div class="flex-1">
						<p class="font-medium" style="color: var(--text-primary);">Tracking entry (no file)</p>
						<p class="text-sm" style="color: var(--text-muted);">You can upload ebook or audiobook files later</p>
					</div>
					<button
						type="button"
						class="px-3 py-1.5 rounded-lg text-sm transition-colors"
						style="background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color);"
						onclick={goBackToUpload}
					>
						Upload file
					</button>
				</div>
			{/if}

			<!-- Quick metadata search button -->
			<div class="p-3 rounded-lg flex items-center justify-between" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); border: 1px solid rgba(139, 92, 246, 0.2);">
				<div class="flex items-center gap-2">
					<Database class="w-5 h-5" style="color: var(--accent);" />
					<span class="text-sm" style="color: var(--text-primary);">Fill from online databases</span>
				</div>
				<button
					type="button"
					class="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
					style="background: var(--accent); color: white;"
					onclick={() => showMetadataModal = true}
				>
					<Search class="w-4 h-4" />
					Search
				</button>
			</div>

			<!-- Main form grid -->
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- Left column: Basic info -->
				<div class="lg:col-span-2 space-y-4">
					<!-- Title -->
					<div>
						<label for="title" class="block text-sm font-medium mb-1" style="color: var(--text-primary);">
							Title <span class="text-red-500">*</span>
						</label>
						<input
							id="title"
							type="text"
							bind:value={title}
							required
							class="w-full px-4 py-2.5 rounded-lg border transition-colors"
							style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
							placeholder="Enter book title"
						/>
					</div>

					<!-- Authors with roles -->
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Authors</label>
						{#if selectedAuthors.length > 0}
							<div class="space-y-2 mb-2">
								{#each selectedAuthors as author, index}
									<div class="flex items-center gap-2 p-2 rounded-lg" style="background: var(--bg-tertiary); {index === 0 ? 'border: 1px solid var(--accent);' : ''}">
										<User class="w-4 h-4 flex-shrink-0" style="color: var(--text-muted);" />
										<span class="flex-1 text-sm font-medium" style="color: var(--text-primary);">{author.name}</span>
										<select
											bind:value={selectedAuthors[index].role}
											class="text-xs px-2 py-1 rounded"
											style="background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);"
										>
											{#each authorRoles as role}
												<option value={role}>{role}</option>
											{/each}
										</select>
										{#if index === 0}
											<span class="text-xs px-2 py-0.5 rounded" style="background: var(--accent); color: white;">Primary</span>
										{/if}
										<button type="button" onclick={() => removeAuthor(author.id)} class="p-1 hover:text-red-500">
											<X class="w-4 h-4" />
										</button>
									</div>
								{/each}
							</div>
						{/if}
						<div class="flex gap-2">
							<div class="relative flex-1">
								<input
									type="text"
									bind:value={authorSearch}
									onfocus={() => showAuthorDropdown = true}
									class="w-full px-4 py-2.5 rounded-lg border transition-colors"
									style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
									placeholder="Search authors..."
								/>
								{#if showAuthorDropdown && filteredAuthors.length > 0}
									<div class="absolute z-20 w-full mt-1 rounded-lg shadow-lg overflow-hidden" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
										{#each filteredAuthors as author}
											<button
												type="button"
												class="w-full px-4 py-2 text-left transition-colors flex items-center gap-2 hover:bg-[var(--bg-tertiary)]"
												style="color: var(--text-primary);"
												onclick={() => addAuthor(author)}
											>
												<User class="w-4 h-4" style="color: var(--text-muted);" />
												{author.name}
											</button>
										{/each}
									</div>
								{/if}
							</div>
							<select
								bind:value={authorRole}
								class="px-3 py-2.5 rounded-lg border"
								style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
							>
								{#each authorRoles as role}
									<option value={role}>{role}</option>
								{/each}
							</select>
						</div>
					</div>

					<!-- Series with book numbers -->
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Series</label>
						{#if selectedSeries.length > 0}
							<div class="space-y-2 mb-2">
								{#each selectedSeries as s, index}
									<div class="flex items-center gap-2 p-2 rounded-lg" style="background: var(--bg-tertiary);">
										<span class="flex-1 text-sm font-medium" style="color: var(--text-primary);">{s.title}</span>
										<input
											type="number"
											step="0.5"
											bind:value={selectedSeries[index].bookNum}
											placeholder="#"
											class="w-16 px-2 py-1 rounded text-sm text-center"
											style="background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);"
										/>
										<span class="text-xs" style="color: var(--text-muted);">to</span>
										<input
											type="number"
											step="0.5"
											bind:value={selectedSeries[index].bookNumEnd}
											placeholder="#"
											class="w-16 px-2 py-1 rounded text-sm text-center"
											style="background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary);"
										/>
										<button type="button" onclick={() => removeSeries(s.id)} class="p-1 hover:text-red-500">
											<X class="w-4 h-4" />
										</button>
									</div>
								{/each}
							</div>
						{/if}
						<div class="flex gap-2">
							<div class="relative flex-1">
								<input
									type="text"
									bind:value={seriesSearch}
									onfocus={() => showSeriesDropdown = true}
									class="w-full px-4 py-2.5 rounded-lg border transition-colors"
									style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
									placeholder="Search series..."
								/>
								{#if showSeriesDropdown && filteredSeries.length > 0}
									<div class="absolute z-20 w-full mt-1 rounded-lg shadow-lg overflow-hidden" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
										{#each filteredSeries as s}
											<button
												type="button"
												class="w-full px-4 py-2 text-left transition-colors hover:bg-[var(--bg-tertiary)]"
												style="color: var(--text-primary);"
												onclick={() => addSeries(s)}
											>
												{s.title}
											</button>
										{/each}
									</div>
								{/if}
							</div>
							<input
								type="number"
								step="0.5"
								bind:value={seriesBookNum}
								placeholder="Book #"
								class="w-24 px-3 py-2.5 rounded-lg border"
								style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
							/>
						</div>
					</div>

					<!-- Narrator (for audiobooks) -->
					{#if mediaType === 'audiobook'}
						<div>
							<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">
								<Headphones class="w-4 h-4 inline mr-1" />
								Narrator
							</label>
							<div class="grid grid-cols-2 gap-2">
								<select
									bind:value={narratorId}
									class="px-4 py-2.5 rounded-lg border"
									style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
								>
									<option value="">Select existing...</option>
									{#each data.options.narrators as narrator}
										<option value={narrator.id.toString()}>{narrator.name}</option>
									{/each}
								</select>
								<input
									type="text"
									bind:value={narratorName}
									placeholder="Or enter new name..."
									class="px-4 py-2.5 rounded-lg border"
									style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
								/>
							</div>
						</div>
					{/if}

					<!-- Summary -->
					<div>
						<label for="summary" class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Summary</label>
						<textarea
							id="summary"
							bind:value={summary}
							rows="4"
							class="w-full px-4 py-2.5 rounded-lg border resize-none"
							style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
							placeholder="Book description or summary..."
						></textarea>
					</div>
				</div>

				<!-- Right column: Cover, status, classification -->
				<div class="space-y-4">
					<!-- Cover preview -->
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Cover</label>
						<div class="rounded-lg overflow-hidden mb-2" style="background: var(--bg-tertiary); aspect-ratio: 2/3;">
							{#if coverUrl}
								<img
									src={coverUrl}
									alt="Cover preview"
									class="w-full h-full object-cover"
									onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
								/>
							{:else}
								<div class="w-full h-full flex items-center justify-center">
									<Image class="w-12 h-12" style="color: var(--text-muted);" />
								</div>
							{/if}
						</div>
						<input
							type="url"
							bind:value={coverUrl}
							placeholder="Cover image URL..."
							class="w-full px-3 py-2 rounded-lg border text-sm"
							style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
						/>
					</div>

					<!-- Status -->
					<div>
						<label for="status" class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Reading Status</label>
						<select
							id="status"
							bind:value={statusId}
							class="w-full px-4 py-2.5 rounded-lg border"
							style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
						>
							<option value="">Select status...</option>
							{#each data.options.statuses as status}
								<option value={status.id.toString()}>{status.name}</option>
							{/each}
						</select>
					</div>

					<!-- Rating -->
					<div>
						<label for="rating" class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Rating</label>
						<div class="flex items-center gap-2">
							<input
								id="rating"
								type="number"
								min="0"
								max="5"
								step="0.5"
								bind:value={rating}
								placeholder="0-5"
								class="w-24 px-4 py-2.5 rounded-lg border"
								style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
							/>
							{#if rating}
								<span style="color: #fbbf24;">
									{'★'.repeat(Math.floor(parseFloat(rating) || 0))}{(parseFloat(rating) || 0) % 1 >= 0.5 ? '½' : ''}
								</span>
							{/if}
						</div>
					</div>

					<!-- Genre & Format -->
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label for="genre" class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Genre</label>
							<select
								id="genre"
								bind:value={genreId}
								class="w-full px-3 py-2 rounded-lg border text-sm"
								style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
							>
								<option value="">Select...</option>
								{#each data.options.genres as genre}
									<option value={genre.id.toString()}>{genre.name}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="format" class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Format</label>
							<select
								id="format"
								bind:value={formatId}
								class="w-full px-3 py-2 rounded-lg border text-sm"
								style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);"
							>
								<option value="">Select...</option>
								{#each data.options.formats as format}
									<option value={format.id.toString()}>{format.name}</option>
								{/each}
							</select>
						</div>
					</div>

					<!-- Tags -->
					{#if data.options.tags.length > 0}
						<div>
							<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Tags</label>
							<div class="flex flex-wrap gap-1">
								{#each data.options.tags as tag}
									<button
										type="button"
										class="px-2 py-1 text-xs rounded-full transition-all"
										style="
											background: {selectedTagIds.includes(tag.id) ? (tag.color || '#6c757d') : 'var(--bg-tertiary)'};
											color: {selectedTagIds.includes(tag.id) ? 'white' : 'var(--text-secondary)'};
											border: 1px solid {selectedTagIds.includes(tag.id) ? (tag.color || '#6c757d') : 'var(--border-color)'};
										"
										onclick={() => toggleTag(tag.id)}
									>
										{tag.name}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Additional Details (collapsible) -->
			<details class="rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
				<summary class="px-4 py-3 cursor-pointer font-medium" style="color: var(--text-primary);">
					Additional Details
				</summary>
				<div class="px-4 pb-4 space-y-4">
					<!-- Identifiers -->
					<div>
						<h4 class="text-sm font-medium mb-2" style="color: var(--text-primary);">Identifiers</h4>
						<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">ISBN-13</label>
								<input type="text" bind:value={isbn13} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);" />
							</div>
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">ISBN-10</label>
								<input type="text" bind:value={isbn10} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);" />
							</div>
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">ASIN</label>
								<input type="text" bind:value={asin} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);" />
							</div>
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">Goodreads ID</label>
								<input type="text" bind:value={goodreadsId} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);" />
							</div>
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">Google Books ID</label>
								<input type="text" bind:value={googleBooksId} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);" />
							</div>
						</div>
					</div>

					<!-- Publication details -->
					<div>
						<h4 class="text-sm font-medium mb-2" style="color: var(--text-primary);">Publication</h4>
						<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">Publisher</label>
								<input type="text" bind:value={publisher} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);" />
							</div>
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">Year</label>
								<input type="number" min="1000" max="2100" bind:value={publishYear} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);" />
							</div>
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">Pages</label>
								<input type="number" bind:value={pageCount} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);" />
							</div>
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">Language</label>
								<select bind:value={language} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);">
									{#each languages as lang}
										<option value={lang}>{lang}</option>
									{/each}
								</select>
							</div>
						</div>
					</div>

					<!-- Dates -->
					<div>
						<h4 class="text-sm font-medium mb-2" style="color: var(--text-primary);">Dates</h4>
						<div class="grid grid-cols-3 gap-3">
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">Release Date</label>
								<input type="date" bind:value={releaseDate} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);" />
							</div>
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">Started Reading</label>
								<input type="date" bind:value={startReadingDate} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);" />
							</div>
							<div>
								<label class="block text-xs mb-1" style="color: var(--text-muted);">Completed</label>
								<input type="date" bind:value={completedDate} class="w-full px-3 py-2 rounded-lg border text-sm" style="background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary);" />
							</div>
						</div>
					</div>
				</div>
			</details>

			<!-- Submit buttons -->
			<div class="flex gap-3 pt-4 sticky bottom-0 py-4" style="background: var(--bg-primary);">
				<button
					type="button"
					class="px-6 py-2.5 rounded-lg transition-colors"
					style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);"
					onclick={goBackToUpload}
				>
					Back
				</button>
				<button
					type="submit"
					disabled={isSubmitting || !title.trim() || (data.isPublic && !uploadedFile)}
					class="flex-1 px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
					style="background: {data.isPublic ? '#10b981' : 'var(--accent)'}; color: white;"
				>
					{#if isSubmitting}
						<Loader2 class="w-5 h-5 animate-spin" />
						Adding...
					{:else if data.isPublic && !uploadedFile}
						<AlertCircle class="w-5 h-5" />
						File Required
					{:else if data.isPublic}
						<Globe class="w-5 h-5" />
						Add to Public Library
					{:else}
						<BookOpen class="w-5 h-5" />
						Add Book
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>

<!-- Click outside handler for dropdowns -->
{#if showAuthorDropdown || showSeriesDropdown}
	<button
		type="button"
		class="fixed inset-0 z-10"
		onclick={() => { showAuthorDropdown = false; showSeriesDropdown = false; }}
		aria-label="Close dropdown"
	></button>
{/if}

<!-- Metadata Search Modal -->
<MetadataSearchModal
	open={showMetadataModal}
	initialTitle={title}
	initialAuthor={selectedAuthors[0]?.name || ''}
	initialIsbn={isbn13 || isbn10 || ''}
	onClose={() => showMetadataModal = false}
	onApply={applyMetadataResult}
/>
