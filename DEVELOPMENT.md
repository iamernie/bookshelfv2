# BookShelf V2 - Development Standards Guide

## Project Overview

BookShelf V2 is a complete rewrite of the BookShelf book library management application.

**Stack:**
- SvelteKit (framework)
- TypeScript (language)
- Drizzle ORM (database)
- SQLite (database engine)
- Tailwind CSS (styling)

---

## Project Structure

```
BookShelfV2/
├── src/
│   ├── lib/
│   │   ├── server/              # Server-only code
│   │   │   ├── db/
│   │   │   │   ├── schema.ts    # Drizzle schema definitions
│   │   │   │   ├── index.ts     # Database connection
│   │   │   │   └── migrations/  # Migration files
│   │   │   ├── services/        # Business logic
│   │   │   │   ├── bookService.ts
│   │   │   │   ├── authorService.ts
│   │   │   │   ├── seriesService.ts
│   │   │   │   ├── authService.ts
│   │   │   │   ├── lookupService.ts    # ISBN lookup
│   │   │   │   ├── importService.ts
│   │   │   │   ├── exportService.ts
│   │   │   │   ├── epubService.ts
│   │   │   │   ├── settingsService.ts
│   │   │   │   └── statsService.ts
│   │   │   └── utils/
│   │   │       ├── auth.ts      # Auth helpers
│   │   │       ├── validation.ts
│   │   │       └── files.ts     # File handling
│   │   ├── components/          # Svelte components
│   │   │   ├── ui/              # Generic UI components
│   │   │   │   ├── Modal.svelte
│   │   │   │   ├── Toast.svelte
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   ├── Select.svelte
│   │   │   │   ├── Pagination.svelte
│   │   │   │   ├── Skeleton.svelte
│   │   │   │   ├── ConfirmDialog.svelte
│   │   │   │   └── EmptyState.svelte
│   │   │   ├── book/            # Book-specific components
│   │   │   │   ├── BookCard.svelte
│   │   │   │   ├── BookRow.svelte
│   │   │   │   ├── BookModal.svelte
│   │   │   │   ├── BookForm.svelte
│   │   │   │   ├── BookFilters.svelte
│   │   │   │   ├── BookGrid.svelte
│   │   │   │   ├── Rating.svelte
│   │   │   │   └── CoverUpload.svelte
│   │   │   ├── bulk/            # Bulk operation components
│   │   │   │   ├── BulkActionBar.svelte
│   │   │   │   ├── BulkTagModal.svelte
│   │   │   │   └── BulkAuthorModal.svelte
│   │   │   ├── layout/          # Layout components
│   │   │   │   ├── Navbar.svelte
│   │   │   │   ├── Sidebar.svelte
│   │   │   │   └── Breadcrumbs.svelte
│   │   │   ├── pickers/         # Selection components
│   │   │   │   ├── AuthorPicker.svelte
│   │   │   │   ├── SeriesPicker.svelte
│   │   │   │   └── TagPicker.svelte
│   │   │   ├── stats/           # Statistics components
│   │   │   │   ├── StatsCard.svelte
│   │   │   │   ├── GoalProgress.svelte
│   │   │   │   └── Timeline.svelte
│   │   │   └── reader/          # Ebook reader components
│   │   │       ├── EpubReader.svelte
│   │   │       └── ReaderControls.svelte
│   │   ├── stores/              # Svelte stores (global state)
│   │   │   ├── auth.ts
│   │   │   ├── toast.ts
│   │   │   ├── selection.ts     # Multi-select state
│   │   │   └── settings.ts
│   │   ├── types/               # TypeScript types
│   │   │   ├── book.ts
│   │   │   ├── author.ts
│   │   │   ├── series.ts
│   │   │   └── index.ts
│   │   └── utils/               # Shared utilities
│   │       ├── format.ts        # Date/number formatting
│   │       ├── search.ts        # Search helpers
│   │       └── api.ts           # Fetch wrapper
│   ├── routes/
│   │   ├── +layout.svelte       # Root layout
│   │   ├── +layout.server.ts    # Auth check, load settings
│   │   ├── +page.svelte         # Dashboard
│   │   ├── +page.server.ts
│   │   ├── login/
│   │   ├── books/
│   │   │   ├── +page.svelte     # Book list
│   │   │   ├── +page.server.ts
│   │   │   └── [id]/
│   │   │       ├── +page.svelte # Book detail
│   │   │       └── +page.server.ts
│   │   ├── authors/
│   │   ├── series/
│   │   ├── genres/
│   │   ├── tags/
│   │   ├── stats/
│   │   ├── reader/[id]/
│   │   ├── import/
│   │   ├── settings/
│   │   ├── admin/
│   │   └── api/                 # API routes
│   │       ├── books/
│   │       │   ├── +server.ts   # GET all, POST new
│   │       │   └── [id]/
│   │       │       └── +server.ts # GET, PUT, DELETE one
│   │       ├── authors/
│   │       ├── series/
│   │       ├── search/
│   │       ├── lookup/
│   │       └── auth/
│   └── app.html
├── static/
│   ├── placeholder.png
│   └── favicon.ico
├── data/                        # Runtime data (gitignored)
│   ├── database.sqlite
│   ├── covers/
│   ├── ebooks/
│   └── backups/
├── drizzle/                     # Drizzle migrations
├── tests/
├── SPEC.md                      # Full feature specification
├── DEVELOPMENT.md               # This file
├── drizzle.config.ts
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Coding Standards

### TypeScript

1. **Strict mode enabled** - No `any` unless absolutely necessary
2. **Explicit return types** on exported functions
3. **Use interfaces** for object shapes, types for unions/primitives

```typescript
// Good
interface Book {
  id: number;
  title: string;
  rating: number | null;
}

export function getBook(id: number): Promise<Book | null> {
  // ...
}

// Bad
export function getBook(id: any) {
  // ...
}
```

### Svelte Components

1. **One component per file**
2. **Props at the top** using `$props()` rune
3. **Derived state** with `$derived` rune
4. **Effects** with `$effect` rune (use sparingly)

```svelte
<script lang="ts">
  import type { Book } from '$lib/types';

  // Props first
  let { book, onEdit, onDelete }: {
    book: Book;
    onEdit: (book: Book) => void;
    onDelete: (id: number) => void;
  } = $props();

  // Derived state
  let displayTitle = $derived(book.title || 'Untitled');

  // Local state
  let isHovered = $state(false);
</script>
```

### API Routes

1. **Always return JSON** from API routes
2. **Consistent error format**
3. **Validate input** before processing
4. **Use appropriate HTTP methods and status codes**

```typescript
// src/routes/api/books/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBooks, createBook } from '$lib/server/services/bookService';

export const GET: RequestHandler = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '24');

  const result = await getBooks({ page, limit });
  return json(result);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const data = await request.json();

  // Validate
  if (!data.title?.trim()) {
    throw error(400, { message: 'Title is required' });
  }

  const book = await createBook(data);
  return json(book, { status: 201 });
};
```

### Database Queries

1. **Use Drizzle's type-safe queries**
2. **Keep queries in service files**, not in routes
3. **Handle relations explicitly**

```typescript
// src/lib/server/services/bookService.ts
import { db } from '$lib/server/db';
import { books, bookAuthors, authors } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getBookWithAuthors(id: number) {
  const result = await db
    .select()
    .from(books)
    .leftJoin(bookAuthors, eq(books.id, bookAuthors.bookId))
    .leftJoin(authors, eq(bookAuthors.authorId, authors.id))
    .where(eq(books.id, id));

  // Transform result...
  return transformBookWithAuthors(result);
}
```

### File Organization

1. **Server-only code** in `$lib/server/` - never imported client-side
2. **Shared types** in `$lib/types/`
3. **Components** organized by feature, not by type
4. **One export per file** where possible

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase.svelte | `BookCard.svelte` |
| Files (modules) | camelCase.ts | `bookService.ts` |
| Files (routes) | lowercase with hyphens | `reading-goals/` |
| Variables | camelCase | `bookCount` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Types/Interfaces | PascalCase | `interface Book` |
| Database tables | camelCase (plural) | `books`, `bookAuthors` |
| Database columns | camelCase | `coverImageUrl` |
| CSS classes | Tailwind utilities | `class="flex items-center"` |

---

## State Management

### When to Use What

| State Type | Use Case | Example |
|------------|----------|---------|
| Component state (`$state`) | Local UI state | `isOpen`, `searchQuery` |
| Derived (`$derived`) | Computed from other state | `filteredBooks` |
| Props | Parent-to-child data | `book`, `onSave` |
| Stores | Cross-component state | `user`, `toasts`, `selectedBooks` |
| Server load | Initial page data | Book list, settings |

### Store Pattern

```typescript
// src/lib/stores/selection.ts
import { writable, derived } from 'svelte/store';

function createSelectionStore() {
  const { subscribe, set, update } = writable<Set<number>>(new Set());

  return {
    subscribe,
    toggle: (id: number) => update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    }),
    clear: () => set(new Set()),
    selectAll: (ids: number[]) => set(new Set(ids))
  };
}

export const selectedBooks = createSelectionStore();
export const hasSelection = derived(selectedBooks, $s => $s.size > 0);
export const selectionCount = derived(selectedBooks, $s => $s.size);
```

---

## API Design

### REST Conventions

| Action | Method | Route | Response |
|--------|--------|-------|----------|
| List | GET | `/api/books` | `{ items: [], total: n }` |
| Get one | GET | `/api/books/:id` | `{ id, title, ... }` |
| Create | POST | `/api/books` | `{ id, title, ... }` (201) |
| Update | PUT | `/api/books/:id` | `{ id, title, ... }` |
| Delete | DELETE | `/api/books/:id` | `{ success: true }` |

### Query Parameters

```
GET /api/books?page=1&limit=24&sort=title&order=asc&status=1&genre=5&q=search
```

### Error Responses

```json
{
  "error": {
    "message": "Book not found",
    "code": "NOT_FOUND"
  }
}
```

---

## Component Patterns

### Modal Pattern

Single modal component handles both view and edit modes:

```svelte
<!-- BookModal.svelte -->
<script lang="ts">
  let {
    book,
    mode = 'view',
    onClose,
    onSave
  }: {
    book: Book | null;
    mode: 'view' | 'edit' | 'add';
    onClose: () => void;
    onSave: (data: BookFormData) => Promise<void>;
  } = $props();

  let currentMode = $state(mode);
</script>

{#if book || currentMode === 'add'}
  <Modal onClose={onClose}>
    {#if currentMode === 'view'}
      <BookDetails {book} onEdit={() => currentMode = 'edit'} />
    {:else}
      <BookForm {book} onSave={onSave} onCancel={() => currentMode = 'view'} />
    {/if}
  </Modal>
{/if}
```

### List + Detail Pattern

```svelte
<!-- +page.svelte (books list) -->
<script lang="ts">
  let { data } = $props();
  let selectedBook = $state<Book | null>(null);
  let modalMode = $state<'view' | 'edit' | 'add' | null>(null);
</script>

<BookGrid
  books={data.books}
  onBookClick={(book) => { selectedBook = book; modalMode = 'view'; }}
/>

{#if modalMode}
  <BookModal
    book={selectedBook}
    mode={modalMode}
    onClose={() => { selectedBook = null; modalMode = null; }}
  />
{/if}
```

---

## Testing Strategy

1. **Unit tests** for services and utilities
2. **Component tests** for complex components
3. **E2E tests** for critical user flows

```
tests/
├── unit/
│   ├── services/
│   │   └── bookService.test.ts
│   └── utils/
│       └── format.test.ts
├── components/
│   └── BookCard.test.ts
└── e2e/
    ├── auth.test.ts
    ├── books.test.ts
    └── import.test.ts
```

---

## Migration from V1

### Database Migration

1. V2 uses same SQLite database format
2. Drizzle introspection can generate schema from existing DB
3. New tables/columns added via Drizzle migrations

### Data Compatibility

- Keep same table names where possible
- Keep same column names
- Junction tables (bookAuthors, bookSeries) unchanged
- Settings table compatible

### Migration Script

```typescript
// scripts/migrate-v1-data.ts
// - Copy database file
// - Run any necessary transformations
// - Verify data integrity
```

---

## Environment Variables

```env
# .env
DATABASE_PATH=./data/database.sqlite
COVERS_PATH=./data/covers
EBOOKS_PATH=./data/ebooks
SESSION_SECRET=your-secret-here

# Optional
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass
```

---

## Git Workflow

1. **Main branch**: Production-ready code
2. **Feature branches**: `feature/book-modal`, `feature/ebook-reader`
3. **Commits**: Conventional commits (`feat:`, `fix:`, `refactor:`)

---

## Performance Guidelines

1. **Lazy load** heavy components (reader, charts)
2. **Pagination** for all lists
3. **Debounce** search inputs
4. **Skeleton loaders** during data fetching
5. **Image optimization** for covers
6. **Cache** expensive computations

---

## Security Checklist

- [ ] All routes check authentication
- [ ] Input validation on all endpoints
- [ ] Password hashing with bcrypt
- [ ] Session management with secure cookies
- [ ] CSRF protection
- [ ] Rate limiting on auth endpoints
- [ ] File upload validation
- [ ] SQL injection prevention (Drizzle handles this)

---

## Quick Reference

### Create a new API endpoint

1. Create file in `src/routes/api/[resource]/+server.ts`
2. Export GET/POST/PUT/DELETE handlers
3. Use service layer for business logic
4. Return JSON responses

### Create a new page

1. Create folder in `src/routes/[page]/`
2. Add `+page.svelte` for UI
3. Add `+page.server.ts` for data loading
4. Use layout for consistent structure

### Create a new component

1. Create file in appropriate `src/lib/components/` subfolder
2. Use TypeScript for props
3. Keep styles in component with Tailwind
4. Export from index if reusable

### Add a database table

1. Add schema in `src/lib/server/db/schema.ts`
2. Run `npx drizzle-kit generate`
3. Run `npx drizzle-kit migrate`
