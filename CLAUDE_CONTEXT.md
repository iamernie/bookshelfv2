# Claude Context - BookShelf V2

This document provides context for continuing development on BookShelf V2. Read this first when starting a new session.

## Project Overview

BookShelf V2 is a **complete rewrite** of BookShelf V1, a personal book library management application. The rewrite was initiated because V1 became a "mish mash of features pieced together" that was hard to maintain and wasn't API-first.

## Tech Stack

- **Framework**: SvelteKit (with Svelte 5 runes)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite + Drizzle ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide Svelte

## Key Documents

1. **[SPEC.md](./SPEC.md)** - Complete feature specification from V1:
   - All database tables and relationships
   - All API endpoints to implement
   - All pages/routes
   - Feature checklist
   - UI components needed

2. **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Coding standards:
   - Project structure
   - TypeScript patterns
   - Svelte 5 component patterns
   - API design conventions
   - State management approach

## Current State (as of Dec 24, 2024)

### Completed ✅

1. **Project scaffold** - SvelteKit project with TypeScript
2. **Database schema** - Complete Drizzle schema matching V1:
   - `src/lib/server/db/schema.ts` - All tables defined
   - `src/lib/server/db/index.ts` - Database connection
3. **Core components**:
   - `src/lib/components/ui/Modal.svelte` - Reusable modal
   - `src/lib/components/ui/Toast.svelte` - Toast notifications
   - `src/lib/components/book/BookCard.svelte` - Book card display
   - `src/lib/components/layout/Navbar.svelte` - Navigation bar
4. **Stores**:
   - `src/lib/stores/toast.ts` - Toast notification store
5. **Types**:
   - `src/lib/types/index.ts` - Shared TypeScript types
6. **Routes**:
   - `/` - Dashboard with stats (page + server load)
   - `/books` - Book list with grid view (page + server load)
   - `/api/books` - Books API (GET list, POST create)
7. **Styling** - Tailwind CSS with custom utility classes in `app.css`
8. **Build** - Project builds successfully

### Not Yet Started ❌

- Authentication system (login/logout/sessions)
- Author pages and API
- Series pages and API
- Tags, Genres, Formats, Narrators pages
- Statistics pages
- Ebook reader integration
- Import/Export functionality
- Admin panel
- Settings management
- Most API endpoints (see SPEC.md for full list)

## Database Connection

The V1 database at `/home/ernie/projects/BookShelfV1/testing/databases/current.sqlite` can be used for testing. The schema is compatible.

Set `DATABASE_PATH` environment variable or it defaults to `./data/database.sqlite`.

## Running the Project

```bash
# Install dependencies
npm install

# Run type checking
npm run check

# Start dev server
npm run dev

# Build for production
npm run build

# Generate Drizzle migrations
npm run db:generate

# Run migrations
npm run db:migrate
```

## Key Architectural Decisions

1. **API-First**: All data operations go through `/api/*` endpoints
2. **Single Modal Pattern**: One modal component for view/edit (not two like V1)
3. **Shared Types**: Use `$lib/types` for types shared between components
4. **Server-Only Code**: Database/business logic in `$lib/server/` only
5. **Svelte 5 Runes**: Using `$state`, `$derived`, `$props()` syntax

## V1 Location

The original V1 codebase is at `/home/ernie/projects/BookShelfV1/` if you need to reference existing implementations.

## Important V1 Features to Preserve

From the user's perspective, these are critical:

1. **Multi-author support** - Books can have multiple authors with roles
2. **Multi-series support** - Books can belong to multiple series (omnibus editions)
3. **Ebook reader** - Read EPUBs directly in the app
4. **Bulk operations** - Multi-select and bulk edit books
5. **Tag system** - Custom tags with colors/icons
6. **Reading goals** - Yearly targets and challenges
7. **Import/Export** - CSV (Goodreads), JSON backup, Audible import

## What to Work On Next

Suggested priority order:

1. **Authentication** - Login/logout, session management, protected routes
2. **Authors CRUD** - Pages and API for managing authors
3. **Series CRUD** - Pages and API for managing series
4. **Book form** - Add/edit book modal with all fields
5. **Search** - Full-text search across books
6. **More pages** - Tags, Genres, Stats, etc.

## Common Patterns

### Creating a new page

```typescript
// src/routes/authors/+page.server.ts
import type { PageServerLoad } from './$types';
import { db, authors } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  const allAuthors = await db.select().from(authors);
  return { authors: allAuthors };
};
```

```svelte
<!-- src/routes/authors/+page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

{#each data.authors as author}
  <div>{author.name}</div>
{/each}
```

### Creating a new API endpoint

```typescript
// src/routes/api/authors/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, authors } from '$lib/server/db';

export const GET: RequestHandler = async () => {
  const items = await db.select().from(authors);
  return json({ items });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  if (!data.name?.trim()) {
    throw error(400, { message: 'Name is required' });
  }
  const [newAuthor] = await db.insert(authors).values({
    name: data.name.trim()
  }).returning();
  return json(newAuthor, { status: 201 });
};
```

## Notes for Claude

- User prefers concise responses
- User knows both React and Svelte, chose Svelte for less boilerplate
- User wants clean, maintainable code - V1 got messy
- Build must pass before considering work complete
- Check `npm run check` for TypeScript errors
- Warnings are OK, errors are not
