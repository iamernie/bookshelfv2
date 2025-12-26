# BookShelf V2 - Completed Features Changelog

This document details all completed features with their implementation specifics.

---

## Reading Goals V1 Parity (Completed)

Enhanced reading goals system with full challenge types support, matching V1 functionality.

### Challenge Types

Six challenge types to track diverse reading goals:

| Type | Description | Unit | Default Target |
|------|-------------|------|----------------|
| Books | Read a target number of books | books | 12 |
| Genres | Read books from different genres | genres | 6 |
| Authors | Read books by different authors | authors | 12 |
| Formats | Read books in different formats | formats | 3 |
| Pages | Read a target number of pages | pages | 5000 |
| Monthly | Read consistently every month | months | 2 books/month |

### Goals Page Features

- Hero section showing main book count goal progress
- Monthly breakdown visualization (12-month grid)
- Challenge cards grid with individual progress tracking
- Add/edit/delete challenges with visual feedback
- Challenge type selection with descriptions
- Progress bars and completion badges

### Dashboard Integration

- Reading goal widget on dashboard homepage
- Shows main book goal progress with pace status
- Displays active challenges summary (up to 3)
- Link to full goals page

### Files Created/Modified

**Service (`src/lib/server/services/goalsService.ts`):**
- Added `CHALLENGE_TYPES` constant with all challenge definitions
- Added `ChallengeType` and `ChallengeProgress` types
- Added progress calculation functions for each challenge type:
  - `calculateGenresProgress()` - distinct genres read
  - `calculateAuthorsProgress()` - distinct authors read
  - `calculateFormatsProgress()` - distinct formats read
  - `calculatePagesProgress()` - total pages read
  - `calculateMonthlyProgress()` - months meeting target
- Added `getChallengesForYear()` - get all challenges with progress
- Added `getGoalForDashboard()` - dashboard data formatter
- Added `createChallenge()` - create new challenge with type

**Server (`src/routes/stats/goals/+page.server.ts`):**
- Added `challenges` and `challengeTypes` to page data
- Added `createChallenge` form action
- Updated `updateGoal` to handle all challenge target fields

**UI (`src/routes/stats/goals/+page.svelte`):**
- Added challenge cards section with progress visualization
- Added "Add Challenge" form with type selection
- Added inline editing for challenge targets
- Added challenge-specific icons (Book, Layers, Users, Shapes, FileText, CalendarCheck)

**Dashboard (`src/routes/+page.svelte` & `+page.server.ts`):**
- Added `getGoalForDashboard()` call to load data
- Added reading goal widget with main progress and challenges summary
- Added pace status indicators (ahead/behind/on track)

---

## Docker & GitHub Actions (Completed)

Added Docker containerization and GitHub Actions CI/CD pipeline for automated builds and deployment.

### Docker Setup

**Multi-stage Dockerfile:**
- Builder stage compiles SvelteKit application
- Production stage uses minimal Alpine image with only production dependencies
- PUID/PGID support for proper file ownership in containers
- Uses `su-exec` for running as non-root user
- Health check endpoint at `/health`

**docker-compose.yml (Production):**
- Pulls from GitHub Container Registry
- Named volumes for data persistence:
  - `bookshelf_data` - SQLite database
  - `bookshelf_logs` - Application logs
  - `bookshelf_covers` - Book cover images
  - `bookshelf_ebooks` - Ebook files
- Configurable via environment variables
- Health check with 30s interval

**docker-compose.test.yml (Development):**
- Builds from local source
- Uses bind mounts for easy testing
- Runs on port 6465 to avoid conflicts
- Debug logging enabled

### GitHub Actions

**docker-publish.yml Workflow:**
- Triggers on version tags (`v*.*.*`), releases, and manual dispatch
- Builds and pushes to GitHub Container Registry (GHCR)
- Semantic versioning tags (major, minor, patch, latest)
- GitHub Actions cache for faster builds

### Files Created

- `Dockerfile` - Multi-stage build for production
- `docker-compose.yml` - Production deployment config
- `docker-compose.test.yml` - Local testing config
- `docker-entrypoint.sh` - Permission handling entrypoint
- `.dockerignore` - Excludes unnecessary files from image
- `.github/workflows/docker-publish.yml` - CI/CD workflow
- `src/routes/health/+server.ts` - Health check endpoint
- `testing/docker/` - Local testing volume directories

### Files Modified

- `.env.example` - Added Docker-related variables (PUID, PGID, ORIGIN)

### Usage

**Production (from GHCR):**
```bash
docker-compose up -d
```

**Local Testing:**
```bash
docker-compose -f docker-compose.test.yml up --build
```

---

## Phase 6.2: Inline Series Notes from Book Page (Completed)

Added inline editable series notes to the book detail page. When viewing a book that belongs to a series, users can now view and edit series notes directly without navigating away.

### Features

- Series notes section appears below the series link on book detail page
- Click to edit notes inline with textarea
- Save/Cancel buttons for confirmation
- Updates the series record via existing API

### Implementation

**Files Modified:**
- `src/lib/server/services/bookService.ts`
  - Added `comments` field to series type in `BookWithRelations` interface
  - Added `comments: series.comments` to series query in both `getBooks()` and `getBookById()` functions

- `src/routes/books/[id]/+page.svelte`
  - Added `editingSeriesNotes`, `savingSeriesNotes`, `editSeriesNotesValue` state variables
  - Added `startEditSeriesNotes()`, `saveSeriesNotes()`, `cancelSeriesNotesEdit()` functions
  - Added series notes section UI with inline editing pattern (matches existing summary/notes pattern)
  - Notes displayed below each series link, indented to align with series content

### API Used

- `PUT /api/series/{id}` with `{ comments: "..." }` body

---

## Phase 5.3: Quick Edit, Date Formatting & Git Cleanup (Completed)

Improved UX with quick edit functionality, standardized date handling, and proper git exclusions.

### Quick Edit on BookCard

Hover over any book card to reveal a quick edit button. Click it to open an overlay for rapid rating and status changes without leaving the page.

**Features:**
- Pencil icon appears on hover (top-right of cover)
- Click to open overlay with:
  - 5-star rating picker (click to rate, hover preview)
  - Status buttons for quick status changes
  - Current rating and status highlighted
- Works on Dashboard and Books pages
- API updates via PATCH to `/api/books/{id}`
- Automatic page refresh after changes

**Files Created:**
- `src/lib/components/book/QuickEditOverlay.svelte` - Overlay component with rating and status controls

**Files Modified:**
- `src/lib/components/book/BookCard.svelte` - Added quickEdit prop, overlay integration
- `src/routes/books/+page.svelte` - Enabled quick edit with handleQuickEdit function
- `src/routes/+page.svelte` - Enabled quick edit on Dashboard
- `src/routes/+page.server.ts` - Added statuses to Dashboard data

### Date Formatting Standardization

Created centralized date utilities to ensure consistent date handling across the application.

**Utility Functions (`src/lib/utils/date.ts`):**
- `formatDate(dateStr, format)` - Display dates consistently ("December 12, 2023" by default)
- `toInputDate(dateStr)` - Convert DB format to HTML input format (YYYY-MM-DD)
- `fromInputDate(inputDate)` - Convert HTML input back to ISO for DB storage
- `formatRelativeDate(dateStr)` - "2 days ago" style formatting
- `getCurrentInputDate()` / `getCurrentISODate()` - Current date helpers

**Files Updated to Use Utility:**
- `src/routes/books/[id]/+page.svelte`
- `src/routes/authors/[id]/+page.svelte`
- `src/routes/authors/[id]/edit/+page.svelte`
- `src/lib/components/author/AuthorModal.svelte`
- `src/lib/components/book/BookModal.svelte`
- `src/routes/books/[id]/edit/+page.svelte`
- `src/routes/stats/+page.svelte`

### TypeScript Error Fixes

Fixed all 11 TypeScript errors across 8 files:
- `loggerService.ts` - Cast winston info fields to proper types
- `fileWatcherService.ts` - Handle unknown error type properly
- `AuthorModal.svelte` - Cast e.currentTarget to HTMLImageElement
- `DynamicIcon.svelte` - Added color prop
- `BulkActionBar` usage - Added missing totalCount and onClearSelection props
- `searchService.ts` - Added icon field to status type
- `shelves/[id]/+page.svelte` - Added default values for sortField/sortOrder

### Git Exclusions

Updated `.gitignore` to properly exclude user content:

```gitignore
# Database files
*.sqlite
*.sqlite-journal
*.sqlite-wal
*.sqlite-shm

# User content
static/covers/
!static/covers/.gitkeep
!static/covers/placeholder.png
static/ebooks/
!static/ebooks/.gitkeep

# Testing databases
testing/databases/*.sqlite
testing/databases/*.sqlite-*
```

**Cleanup:**
- Removed tracked covers, ebooks, and database files from git history
- Added `.gitkeep` files to maintain empty directories

---

## Phase 5.2: Dashboard & List View Consistency (Completed)

Standardized book display components across the application for consistent UI.

### Changes Made

**Dashboard Improvements:**
- Dashboard now uses `BookCard` component for "Currently Reading" and "Recently Added" sections
- Full book metadata displayed (author, series, rating, status, tags, ebook indicator)
- Updated page server to fetch complete `BookCardData` via `getBooksCardData()` helper
- Added user library filtering to respect Public Library feature
- Updated text colors to use CSS theme variables for dark mode support

**My Books List View:**
- List view now uses `BookRow` and `BookListHeader` components (matching author/series pages)
- Proper column layout: Title, Series, Status, Format, Rating, Genre, Tags
- Added `toBookCardData()` helper to convert `BookWithRelations` to `BookCardData`
- Grid view also uses the shared helper for consistency

**Sortable Column Headers:**
- `BookListHeader` now supports clickable column headers for sorting
- Click column to sort by that field, click again to toggle asc/desc
- Sort indicators (arrows) show current sort field and direction
- Sorting disabled when `onSort` prop not provided (backwards compatible)
- Added support for sorting by related fields: series, status, format, genre
- Backend uses subqueries for efficient related-field sorting

**Backend Sort Extensions:**
- Extended `GetBooksOptions.sort` to include: `series`, `status`, `format`, `genre`
- Sorting by related entities uses SQL subqueries for efficiency
- Updated page server to accept new sort field types

**Files Modified:**
- `src/routes/+page.svelte` - Dashboard uses BookCard with full metadata
- `src/routes/+page.server.ts` - Fetch complete BookCardData, library filtering
- `src/routes/books/+page.svelte` - List view uses BookRow/BookListHeader, sort handler
- `src/routes/books/+page.server.ts` - Accept new sort field types
- `src/lib/components/book/BookListHeader.svelte` - Sortable columns with indicators
- `src/lib/server/services/bookService.ts` - Extended sort options with subqueries

---

## Phase 5.1: UI Polish & Consistency (Completed)

Improved UI consistency across entity pages with better list views and bulk operations.

### Changes Made

**List View Improvements:**
- Redesigned `BookRow.svelte` with CSS Grid layout for table-like appearance
- Added columns: Title/Author, Series (#), Status, Format, Rating, Genre, Tags
- Created `BookListHeader.svelte` for column headers with select-all checkbox
- Responsive design hides less important columns on smaller screens
- Added grid/list view toggle to author and series detail pages

**Bulk Operations Fix:**
- Fixed 500 error on author/series pages caused by incorrect modal props
- Updated bulk modals to use `{#if}` conditional rendering pattern
- Added tags and statuses data fetching to author and series page loaders

**Naming Consistency:**
- Renamed "Shelves" section in sidebar to "Statuses" (shows reading statuses)
- Renamed "Magic Shelves" to "Smart Collections" throughout the app
- Updated icons from `Sparkles` to `Wand2` for Smart Collections
- Updated navbar, sidebar, and `/shelves` page labels

**Genre Display:**
- Genres in sidebar now show custom icons (if set) using DynamicIcon
- Genres display with their assigned colors
- Updated layout server to fetch genre `color` and `icon` fields

**Files Modified:**
- `src/lib/components/book/BookRow.svelte` - Complete redesign with grid layout
- `src/lib/components/book/BookListHeader.svelte` - New component
- `src/lib/components/layout/Sidebar.svelte` - Renamed sections, genre icons
- `src/lib/components/layout/Navbar.svelte` - Updated Collections label
- `src/routes/shelves/+page.svelte` - Smart Collections terminology
- `src/routes/+layout.server.ts` - Added genre color/icon to query
- `src/routes/authors/[id]/+page.server.ts` - Added tags/statuses data
- `src/routes/authors/[id]/+page.svelte` - Added list view header
- `src/routes/series/[id]/+page.server.ts` - Added tags/statuses data
- `src/routes/series/[id]/+page.svelte` - Fixed bulk modal props, added header

---

## Phase 4.5: Entity Detail Pages (Completed)

Series and Author detail pages with compact layout and inline editing.

**Files Created:**
- `src/routes/series/[id]/+page.svelte` - Series detail page
- `src/routes/series/[id]/edit/+page.svelte` - Series edit page
- `src/routes/authors/[id]/+page.svelte` - Author detail page
- `src/routes/authors/[id]/edit/+page.svelte` - Author edit page

**Features:**
- Compact stats bar with inline stats (X/Y read, rating, percentage)
- Progress bar with completion status
- Details grid with 3 columns: Description/Bio, Notes, Tags/Series
- Inline editing for text fields (click-to-edit with Save/Cancel)
- Tag picker toggle for quick tag management
- Universal BookCard component for book grids

---

## Phase 4.4: Book Edit Page Redesign (Completed)

Converted book edit from modal to dedicated page with tabbed interface.

**Files Created/Modified:**
- `src/routes/books/[id]/edit/+page.svelte` - Book edit page
- `src/routes/books/[id]/edit/+page.server.ts` - Edit page data loader

**Features:**
- Tabbed interface (Basic, Summary, IDs, Cover, Status, Ebook)
- Multi-book/omnibus support (bookNumEnd field for series)
- Compact, space-efficient form layout
- Sidebar with cover preview and quick rating
- Author/series picker with search
- ISBN/title auto-lookup from Open Library & Google Books

---

## Bulk Operations (Completed)

Multi-select books and perform batch operations.

**Files Created:**
- `src/lib/stores/selection.ts` - Selection state store with toggle, selectAll, clear
- `src/lib/components/bulk/BulkActionBar.svelte` - Floating action bar with tag/status/delete buttons
- `src/lib/components/bulk/BulkTagModal.svelte` - Add/remove tags from multiple books
- `src/lib/components/bulk/BulkStatusModal.svelte` - Change status for multiple books
- `src/lib/components/bulk/BulkDeleteModal.svelte` - Delete confirmation with "DELETE" typing requirement
- `src/routes/api/books/bulk/tags/+server.ts` - Bulk tag add/remove endpoint
- `src/routes/api/books/bulk/status/+server.ts` - Bulk status change endpoint
- `src/routes/api/books/bulk/delete/+server.ts` - Bulk delete endpoint (with file cleanup)

**Features:**
- Select mode toggle on books page
- Select all / deselect all functionality
- Bulk add/remove tags with mode toggle
- Bulk status change with visual status picker
- Bulk delete with safety confirmation (type "DELETE")
- Automatic file cleanup (covers and ebooks) on delete

---

## Magic Shelves (Completed)

Dynamic, rule-based collections that automatically show books matching filter criteria.

**Database Schema:**
```sql
CREATE TABLE magicshelves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'bookmark',
  iconColor TEXT DEFAULT '#6c757d',
  filterJson TEXT NOT NULL,
  sortField TEXT DEFAULT 'title',
  sortOrder TEXT DEFAULT 'asc',
  isPublic INTEGER DEFAULT 0,
  userId INTEGER REFERENCES users(id),
  displayOrder INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);
```

**Files Created:**
- `src/lib/server/services/magicShelfService.ts` - Complete service with filter rule types, CRUD, dynamic SQL query builder
- `src/routes/api/shelves/+server.ts` - GET all, POST new shelf
- `src/routes/api/shelves/[id]/+server.ts` - GET, PUT, DELETE shelf
- `src/routes/api/shelves/[id]/books/+server.ts` - GET books matching shelf rules
- `src/routes/api/shelves/preview/+server.ts` - POST to preview filter without saving
- `src/lib/components/shelves/ShelfRuleBuilder.svelte` - Visual rule builder UI
- `src/lib/components/shelves/ShelfCard.svelte` - Shelf preview card with book count
- `src/lib/components/shelves/ShelfModal.svelte` - Create/edit modal
- `src/routes/shelves/+page.svelte` - Shelf list page
- `src/routes/shelves/[id]/+page.svelte` - Shelf detail page with book grid

**Filter Rule Schema:**
```typescript
interface FilterRule {
  field: string;           // 'statusId', 'rating', 'authorId', etc.
  operator: FilterOperator; // 'equals', 'contains', 'greater_than', etc.
  value: string | number | string[] | number[] | null;
}

interface FilterGroup {
  logic: 'AND' | 'OR';
  rules: (FilterRule | FilterGroup)[];
}
```

**Supported Filter Fields:**
- title, statusId, genreId, formatId, rating, pageCount, publishYear
- authorId, seriesId, tagId, narratorId (junction table queries)
- completedDate, startReadingDate, releaseDate, createdAt
- ebookPath, coverImageUrl (has/doesn't have)
- isbn13, language, publisher

---

## Ebook Import (Completed)

Drag-and-drop ebook file import with automatic metadata extraction.

**Files Created:**
- `src/lib/server/services/ebookMetadataService.ts` - Metadata extraction service
- `src/routes/api/import/ebooks/+server.ts` - Upload, preview, execute import
- `src/routes/import/+page.svelte` - Updated with "Ebooks" tab

**Supported Formats:**
- EPUB (full metadata extraction from OPF)
- PDF (filename parsing)
- MOBI (filename parsing)
- AZW/AZW3 (filename parsing)
- CBZ (ComicInfo.xml + first image as cover)
- CBR (ComicInfo.xml + first image as cover)

**Import Flow:**
1. Drag files onto drop zone or click to browse
2. Click "Upload & Preview" to extract metadata
3. Review and edit title/authors for each file
4. Select which files to import
5. Files saved to `/static/ebooks/`, covers to `/static/covers/`

---

## Settings Page (Completed)

Configurable application settings including storage paths with customizable file organization patterns.

**Files Created:**
- `src/lib/server/services/settingsService.ts` - Settings management service
- `src/routes/api/settings/+server.ts` - Settings API
- `src/routes/settings/+page.server.ts` and `+page.svelte` - Settings UI

**Available Settings:**

| Category | Key | Default | Description |
|----------|-----|---------|-------------|
| storage | `storage.covers_path` | `./static/covers` | Cover image directory |
| storage | `storage.ebooks_path` | `./static/ebooks` | Ebook file directory |
| storage | `storage.ebook_path_pattern` | `{filename}` | Ebook file organization |
| library | `library.name` | `BookShelf` | Library name for OPDS |
| display | `display.books_per_page` | `24` | Books per page |
| display | `display.default_sort` | `title` | Default sort field |
| opds | `opds.enabled` | `true` | Enable OPDS catalog |
| import | `import.auto_detect_series` | `true` | Auto-detect series |

**Path Pattern Placeholders:**
- `{author}` - Primary author name
- `{series}` - Series name (if available)
- `{title}` - Book title
- `{format}` - File format
- `{filename}` - Original filename with hash

---

## Logging & Error Management (Completed)

Winston-based logging infrastructure with daily log rotation and admin console.

**Files Created:**
- `src/lib/server/services/loggerService.ts` - Winston logger configuration
- `src/hooks.server.ts` - Request logging, global error handler
- `src/routes/admin/console/+page.svelte` - Admin console UI
- `src/routes/api/admin/logs/+server.ts` - Logs API

**Features:**
- Log levels: error, warn, info, http, debug
- Console output (colorized) and file output (JSON)
- Daily log rotation with configurable retention
- In-memory log buffer (500 entries) for admin console
- Real-time log viewing with auto-refresh
- Click level to filter, text search by context
- Expandable entries for full metadata/stack traces

**Admin Console Access:**
- Available at `/admin/console` (admin users only)
- Accessed via user dropdown menu (Admin → Console)

---

## OPDS Catalog (Completed)

OPDS 1.2 feed for e-reader apps like KOReader, Moon+ Reader, Calibre.

**Files Created:**
- `src/lib/server/services/opdsService.ts` - Complete OPDS 1.2 feed generation
- `src/routes/opds/+server.ts` - Root catalog
- `src/routes/opds/books/+server.ts` - All books feed
- `src/routes/opds/books/recent/+server.ts` - Recently added
- `src/routes/opds/search/+server.ts` - Search
- `src/routes/opds/authors/+server.ts` and `[id]/+server.ts`
- `src/routes/opds/series/+server.ts` and `[id]/+server.ts`
- `src/routes/opds/genres/+server.ts` and `[id]/+server.ts`

**Authentication:**
- HTTP Basic Auth required for all `/opds/*` routes
- Uses existing user credentials (email + password)

**Feed Structure:**
```
/opds                    # Root catalog (navigation)
├── /opds/books          # All books (acquisition, paginated)
├── /opds/books/recent   # Recently added books
├── /opds/search?q=term  # Search results
├── /opds/authors        # Authors list (navigation)
├── /opds/series         # Series list (navigation)
└── /opds/genres         # Genres list (navigation)
```

---

## Statistics Dashboard (Completed)

Comprehensive reading statistics and analytics dashboard.

**Files Created/Modified:**
- `src/lib/server/services/statsService.ts` - Stats aggregation service
- `src/lib/server/services/goalsService.ts` - Reading goals service
- `src/routes/stats/+page.svelte` - Stats dashboard UI
- `src/routes/stats/goals/+page.svelte` - Reading goals management

**Dashboard Features:**
- Stat cards (total books, read, pages, avg rating)
- Monthly reading bar chart
- Status distribution with progress bars
- Rating distribution histogram
- Top authors with clickable links
- Genre tags with clickable links
- Reading timeline with year navigation
- Highlight cards (longest book, best rated, most read author)

**Reading Goals Features:**
- Current year goal with large progress display
- Pace tracking (ahead/behind/on track)
- Monthly breakdown visualization
- CRUD for all goals

---

## BookDrop (Completed)

Automatic ebook import with folder watching and upload queue management.

**Database Schema:**
```sql
CREATE TABLE bookdrop_queue (
  id INTEGER PRIMARY KEY,
  userId INTEGER REFERENCES users(id),
  filename TEXT NOT NULL,
  filePath TEXT NOT NULL,
  fileSize INTEGER,
  fileHash TEXT,
  source TEXT DEFAULT 'upload',
  status TEXT DEFAULT 'pending',
  bookId INTEGER REFERENCES books(id),
  metadata TEXT,
  coverData TEXT,
  errorMessage TEXT,
  processedAt TEXT,
  createdAt TEXT
);

CREATE TABLE bookdrop_settings (
  id INTEGER PRIMARY KEY,
  userId INTEGER REFERENCES users(id),
  folderPath TEXT,
  enabled INTEGER DEFAULT 1,
  autoImport INTEGER DEFAULT 0,
  afterImport TEXT DEFAULT 'move',
  processedFolder TEXT,
  afterSkip TEXT DEFAULT 'keep',
  skippedFolder TEXT,
  defaultStatusId INTEGER,
  defaultFormatId INTEGER
);
```

**Files Created:**
- `src/lib/server/services/bookdropService.ts` - Queue management service
- `src/lib/server/services/fileWatcherService.ts` - Folder watcher (chokidar)
- `src/routes/api/bookdrop/+server.ts` - Queue list API
- `src/routes/api/bookdrop/upload/+server.ts` - File upload
- `src/routes/api/bookdrop/[id]/+server.ts` - Item actions
- `src/routes/api/bookdrop/bulk/+server.ts` - Bulk actions
- `src/routes/api/bookdrop/settings/+server.ts` - Settings API
- `src/routes/admin/bookdrop/+page.svelte` - BookDrop admin UI

**Features:**
- Upload via UI: Drag & drop or file picker
- Folder Watching: Configure path to auto-detect new ebooks
- Metadata Extraction: Title, author, cover, ISBN from EPUB/CBZ
- Preview Mode: Review before importing (default)
- Auto-Import Mode: Optional automatic import
- Edit Before Import: Modify title, author, status, format, genre
- Bulk Actions: Import all, skip selected, delete selected
- Duplicate Detection: Uses file hash
- Post-Import Actions: Keep, move, or delete original files

---

## Import/Export (Completed)

**Import Features:**
- CSV parsing with quote handling
- Goodreads format auto-detection
- Series extraction from titles ("Title (Series, #1)")
- Author fuzzy matching
- Duplicate detection (ISBN, Goodreads ID, ASIN, fuzzy title/author)
- Book lookup via Open Library + Google Books APIs
- Audible HTML import with cover URL reconstruction
- Entity dropdowns with "Add new" option

**Export Features:**
- Full BookShelf CSV format
- Goodreads-compatible CSV format
- JSON export with complete entity lists
- Configurable include/exclude options
- Export UI at /export

---

## UI/UX Features (Completed)

- **Dark Theme** - CSS variables with light/dark toggle, localStorage persistence
- **Persistent Sidebar** - Navigation with genre/status counts, collapsible sections
- **Top Navbar** - Global search (Cmd/Ctrl+K), quick add, theme toggle, user menu
- **Book Detail Page** - Large cover, genre tags, metadata layout, action buttons
- **Enhanced Book Grid** - Series number badges, compact cards
- **Filters Sidebar** - Collapsible filter sections on book list page
- **Mobile Responsive** - Mobile sidebar overlay, responsive layouts
- **Keyboard Shortcuts** - Global search (Cmd/Ctrl+K)

---

## Core CRUD (Completed)

- Authentication (login/logout, sessions, account lockout)
- Books CRUD with modal view/edit
- Authors CRUD with book counts
- Series CRUD with book counts
- Tags CRUD with system tags (Favorite, Wishlist)
- Genres CRUD with colors/icons, display order
- Formats CRUD (Hardcover, Paperback, Ebook, Audiobook)
- Narrators CRUD with bio, URL
- Statuses management (Read, Reading, To Read, DNF, etc.)

---

## Search & Discovery (Completed)

- **Global Search** - Full-text with autocomplete, keyboard shortcut (Cmd/Ctrl+K)
- **Advanced Search Page** - Multi-criteria filtering
- **Sorting** - By title, author, date added, rating, completed date, release date, page count
