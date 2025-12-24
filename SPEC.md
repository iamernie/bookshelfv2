# BookShelf V2 - Complete Specification

## Overview

This document captures all features from BookShelf V1 that must be implemented in V2.

---

## Tech Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Database**: SQLite + Drizzle ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide (or FontAwesome)

---

## Database Schema

### Core Tables

#### books
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| title | TEXT NOT NULL | |
| rating | REAL | 0-5, supports half stars |
| coverImageUrl | TEXT | Local path |
| originalCoverUrl | TEXT | External URL fallback |
| bookNum | INTEGER | Position in series |
| bookNumEnd | INTEGER | For omnibus (e.g., books 1-3) |
| summary | TEXT | |
| comments | TEXT | Personal notes |
| releaseDate | DATE | |
| startReadingDate | DATE | |
| completedDate | DATE | |
| isbn10 | TEXT | |
| isbn13 | TEXT | |
| asin | TEXT | Amazon ID |
| goodreadsId | TEXT | |
| googleBooksId | TEXT | |
| pageCount | INTEGER | |
| publisher | TEXT | |
| publishYear | INTEGER | |
| language | TEXT | Default: English |
| edition | TEXT | |
| purchasePrice | REAL | |
| dnfPage | INTEGER | Did Not Finish tracking |
| dnfPercent | INTEGER | |
| dnfReason | TEXT | |
| dnfDate | DATE | |
| ebookPath | TEXT | Path to ebook file |
| ebookFormat | TEXT | epub, pdf, cbz |
| readingProgress | TEXT | JSON for reader state |
| lastReadAt | DATETIME | |
| statusId | INTEGER FK | |
| genreId | INTEGER FK | |
| formatId | INTEGER FK | |
| narratorId | INTEGER FK | |
| createdAt | DATETIME | |
| updatedAt | DATETIME | |

#### authors
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| bio | TEXT | |
| birthDate | DATE | |
| deathDate | DATE | |
| birthPlace | TEXT | |
| photoUrl | TEXT | |
| website | TEXT | |
| wikipediaUrl | TEXT | |
| createdAt | DATETIME | |
| updatedAt | DATETIME | |

#### series
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| title | TEXT NOT NULL | |
| description | TEXT | |
| numBooks | INTEGER | Expected book count |
| comments | TEXT | Personal notes |
| statusId | INTEGER FK | Series status |
| genreId | INTEGER FK | |
| createdAt | DATETIME | |
| updatedAt | DATETIME | |

#### genres
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| description | TEXT | |
| color | TEXT | Hex code |
| icon | TEXT | Icon class |
| slug | TEXT UNIQUE | URL-friendly |
| displayOrder | INTEGER | |

#### statuses (Book Statuses)
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| key | TEXT UNIQUE | READ, CURRENT, NEXT, DNF, WISHLIST, PARKED |
| isSystem | BOOLEAN | Cannot delete system statuses |
| color | TEXT | |
| icon | TEXT | |
| sortOrder | INTEGER | |

#### seriesStatuses
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| key | TEXT | |
| isSystem | BOOLEAN | |
| color | TEXT | |
| icon | TEXT | |

#### narrators
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| bio | TEXT | |
| url | TEXT | |

#### formats
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | Paperback, Hardcover, Ebook, Audiobook |

#### tags
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT UNIQUE | |
| color | TEXT | Default: #6c757d |
| icon | TEXT | |
| isSystem | BOOLEAN | Favorite, Wishlist are system |

#### users
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| username | TEXT UNIQUE | |
| email | TEXT UNIQUE | |
| password | TEXT | Hashed |
| role | TEXT | admin, editor, user |
| firstName | TEXT | |
| lastName | TEXT | |
| failedLoginAttempts | INTEGER | |
| lockoutUntil | DATETIME | |
| resetToken | TEXT | |
| resetTokenExpires | DATETIME | |

#### settings
| Column | Type | Notes |
|--------|------|-------|
| key | TEXT PK | |
| value | TEXT | |
| type | TEXT | string, number, boolean, json |
| category | TEXT | |
| label | TEXT | |
| description | TEXT | |
| isSystem | BOOLEAN | |

#### readingGoals
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| year | INTEGER | |
| targetBooks | INTEGER | |
| booksRead | INTEGER | |
| isActive | BOOLEAN | |
| challengeType | TEXT | books, genres, authors, formats, pages, monthly |
| name | TEXT | |

### Junction Tables

#### bookAuthors
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| bookId | INTEGER FK | |
| authorId | INTEGER FK | |
| role | TEXT | Author, Co-Author, Editor, Translator, Illustrator |
| isPrimary | BOOLEAN | |
| displayOrder | INTEGER | |
| UNIQUE(bookId, authorId) | | |

#### bookSeries
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| bookId | INTEGER FK | |
| seriesId | INTEGER FK | |
| bookNum | REAL | Supports 2.5 for novellas |
| bookNumEnd | INTEGER | For omnibus |
| isPrimary | BOOLEAN | |
| displayOrder | INTEGER | |
| UNIQUE(bookId, seriesId) | | |

#### bookTags
| Column | Type | Notes |
|--------|------|-------|
| bookId | INTEGER FK | |
| tagId | INTEGER FK | |
| UNIQUE(bookId, tagId) | | |

#### seriesTags
| Column | Type | Notes |
|--------|------|-------|
| seriesId | INTEGER FK | |
| tagId | INTEGER FK | |
| UNIQUE(seriesId, tagId) | | |

---

## API Endpoints

All endpoints return JSON. Authentication via session cookie.

### Books
```
GET    /api/books              # List (with search, filter, pagination)
GET    /api/books/:id          # Get one with relations
POST   /api/books              # Create
PUT    /api/books/:id          # Update
DELETE /api/books/:id          # Delete
PUT    /api/books/:id/rating   # Update rating
PUT    /api/books/:id/status   # Update status
PUT    /api/books/:id/notes    # Update notes
GET    /api/books/:id/authors  # Get book's authors
PUT    /api/books/:id/authors  # Set book's authors
GET    /api/books/:id/tags     # Get book's tags
PUT    /api/books/:id/tags     # Set book's tags
```

### Bulk Operations
```
PUT    /api/books/bulk/status     # Bulk status update
DELETE /api/books/bulk            # Bulk delete
POST   /api/books/bulk/tags/add   # Bulk add tags
POST   /api/books/bulk/tags/remove
POST   /api/books/bulk/author/add
POST   /api/books/bulk/author/remove
PUT    /api/books/bulk/narrator
PUT    /api/books/bulk/dates
```

### Authors
```
GET    /api/authors
GET    /api/authors/:id
POST   /api/authors
PUT    /api/authors/:id
DELETE /api/authors/:id
GET    /api/authors/:id/books
PUT    /api/authors/:id/metadata
POST   /api/authors/:id/wikipedia/import
```

### Series
```
GET    /api/series
GET    /api/series/:id
POST   /api/series
PUT    /api/series/:id
DELETE /api/series/:id
GET    /api/series/:id/books
PUT    /api/series/:id/notes
PUT    /api/series/:id/status
PUT    /api/series/:id/bulk-update-books
GET    /api/series/:id/tags
```

### Other Resources
```
GET/POST/PUT/DELETE /api/genres/:id
GET/POST/PUT/DELETE /api/formats/:id
GET/POST/PUT/DELETE /api/narrators/:id
GET/PUT             /api/statuses/:id
GET/POST/PUT/DELETE /api/series-statuses/:id
GET/POST/PUT/DELETE /api/tags/:id
POST                /api/tags/toggle  # Toggle tag on book
```

### Search
```
GET /api/search?q=...           # Full-text search
GET /api/search/autocomplete    # Search suggestions
GET /api/search/advanced        # Multi-field search
```

### Ebooks
```
GET  /api/ebooks/:id/file       # Serve ebook file
GET  /api/ebooks/:id/progress   # Get reading progress
POST /api/ebooks/:id/progress   # Save reading progress
POST /api/ebooks/:id/upload     # Upload ebook
DELETE /api/ebooks/:id          # Remove ebook
POST /api/ebooks/extract-metadata
```

### Import/Export
```
GET  /api/export/csv
GET  /api/export/json
POST /api/import/csv/preview
POST /api/import/csv/execute
POST /api/import/audible/preview
POST /api/import/audible/execute
POST /api/import/json
```

### Stats & Goals
```
GET  /api/stats
GET  /api/stats/genres
GET  /api/stats/timeline
GET  /api/reading-goals
GET  /api/reading-goals/current
PUT  /api/reading-goals/current
GET  /api/reading-goals/challenges
POST /api/reading-goals/challenges
PUT  /api/reading-goals/challenges/:id
DELETE /api/reading-goals/challenges/:id
```

### Recommendations
```
GET  /api/recommendations/book/:id
GET  /api/recommendations/general
GET  /api/recommendations/ai
POST /api/recommendations/ai/add-to-library
```

### Admin
```
GET  /api/admin/users
POST /api/admin/users
PUT  /api/admin/users/:id
DELETE /api/admin/users/:id
POST /api/admin/database/backup
POST /api/admin/database/scan
POST /api/admin/database/sanitize
GET  /api/admin/settings
PUT  /api/admin/settings/:key
POST /api/admin/email/test
```

### Auth
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/register
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

### Lookup
```
GET /api/lookup/isbn/:isbn
GET /api/lookup/search?q=...
```

---

## Pages / Routes

### Public
- `/login`
- `/register` (if enabled)
- `/forgot-password`
- `/reset-password/:token`
- `/` (landing page if enabled)

### Protected
- `/` or `/dashboard`
- `/books` - Grid/list view with filters
- `/books/add`
- `/books/:id` - Book detail (could be modal or page)
- `/authors`
- `/authors/:id`
- `/series`
- `/series/:id`
- `/series/gaps` - Gap timeline
- `/genres`
- `/genres/:id`
- `/formats`
- `/formats/:id`
- `/narrators`
- `/narrators/:id`
- `/tags`
- `/tags/:id`
- `/search`
- `/stats`
- `/stats/timeline`
- `/stats/goals`
- `/reader/:id` - Ebook reader
- `/import`
- `/recommendations`
- `/settings`
- `/admin/users`
- `/admin/database`
- `/admin/logs`

---

## Features Checklist

### Book Management
- [ ] Add/Edit/Delete books
- [ ] Search (full-text, autocomplete)
- [ ] Advanced search (multi-field)
- [ ] Grid and list views
- [ ] Pagination (configurable per-page)
- [ ] Sorting (title, author, date, rating)
- [ ] Filtering (status, genre, format, tag, author, series)
- [ ] Book detail modal/page
- [ ] Rating (0-5, half stars)
- [ ] DNF tracking (page, percent, reason)
- [ ] Personal notes/comments
- [ ] Cover upload
- [ ] Cover auto-download from APIs

### Multi-Author Support
- [ ] Multiple authors per book
- [ ] Author roles (Author, Co-Author, Editor, etc.)
- [ ] Primary author designation
- [ ] Display order control

### Series Support
- [ ] Multiple series per book (omnibus)
- [ ] Book numbers (with decimal support)
- [ ] Book number ranges (1-3)
- [ ] Primary series
- [ ] Series status
- [ ] Series gap timeline
- [ ] Bulk update books in series

### Reading Tracking
- [ ] Status tracking (Read, Current, Next, DNF, Wishlist, Parked)
- [ ] Start/completion dates
- [ ] Reading timeline visualization
- [ ] Reading goals (yearly)
- [ ] Reading challenges (genre, author, format, pages, monthly)

### Ebook Reader
- [ ] EPUB support
- [ ] PDF support
- [ ] CBZ support
- [ ] Reading progress persistence
- [ ] Metadata extraction
- [ ] Upload ebooks to books

### Tagging
- [ ] Custom tags with colors/icons
- [ ] System tags (Favorite, Wishlist)
- [ ] Tag books and series
- [ ] Filter by tags
- [ ] Bulk tag operations

### Bulk Operations
- [ ] Multi-select books
- [ ] Bulk status update
- [ ] Bulk delete
- [ ] Bulk add/remove tags
- [ ] Bulk add/remove authors
- [ ] Bulk set narrator
- [ ] Bulk set dates

### Import/Export
- [ ] CSV export (books, authors, series)
- [ ] CSV import (Goodreads format)
- [ ] JSON full backup
- [ ] JSON restore
- [ ] Audible HTML import
- [ ] Import preview before commit
- [ ] ISBN lookup during import

### Integrations
- [ ] ISBN lookup (OpenLibrary, Google Books)
- [ ] Cover download from APIs
- [ ] Wikipedia author import
- [ ] External links (Goodreads, Amazon, Google Books)

### Statistics
- [ ] Total books, pages
- [ ] Books by genre/format/author
- [ ] Reading timeline
- [ ] Goal progress
- [ ] Year comparison

### User Management
- [ ] User authentication
- [ ] Roles (admin, editor, user)
- [ ] Password reset via email
- [ ] Account lockout after failed logins
- [ ] Session management

### Admin
- [ ] User CRUD
- [ ] Database backup/restore
- [ ] Database health scan
- [ ] Duplicate detection/merge
- [ ] Log viewer
- [ ] Settings management

### Settings
- [ ] App branding (name, logo, colors)
- [ ] Display settings (per-page, date format)
- [ ] Import defaults
- [ ] Email configuration
- [ ] Security settings
- [ ] Widget settings

### Other Features
- [ ] Barcode scanner for ISBN
- [ ] Public widgets (embeddable)
- [ ] Public landing page
- [ ] Recommendations (basic + AI)
- [ ] "What's New" changelog modal
- [ ] Dark mode (nice to have)

---

## UI Components Needed

### Layout
- `Layout.svelte` - App shell with nav
- `Navbar.svelte` - Navigation
- `Sidebar.svelte` - Optional sidebar
- `Breadcrumbs.svelte`

### Books
- `BookCard.svelte` - Grid card
- `BookRow.svelte` - Table row
- `BookModal.svelte` - View/Edit combined
- `BookForm.svelte` - Form fields
- `BookFilters.svelte` - Filter controls
- `BookGrid.svelte` - Grid container
- `BookList.svelte` - Table container

### Common
- `Modal.svelte` - Reusable modal
- `Toast.svelte` - Notifications
- `Pagination.svelte`
- `SearchInput.svelte` - With autocomplete
- `Rating.svelte` - Star rating
- `TagPicker.svelte`
- `AuthorPicker.svelte`
- `SeriesPicker.svelte`
- `CoverUpload.svelte`
- `EmptyState.svelte`
- `Skeleton.svelte` - Loading states
- `ConfirmDialog.svelte`

### Bulk Operations
- `BulkActionBar.svelte`
- `BulkTagModal.svelte`
- `BulkAuthorModal.svelte`
- `BulkDatesModal.svelte`

### Stats
- `StatsCard.svelte`
- `GoalProgress.svelte`
- `Timeline.svelte`
- `Chart.svelte`

### Reader
- `EpubReader.svelte`
- `PdfReader.svelte`
- `ReaderControls.svelte`

---

## Migration Plan

1. Set up new SvelteKit project
2. Create Drizzle schema
3. Build API routes
4. Build core components
5. Implement pages one by one
6. Test with existing database
7. Write migration script for data

---

## Notes

- Keep SQLite for simplicity and portability
- API-first design for all operations
- Single modal for book view/edit (not two like V1)
- Consider server-side rendering for SEO on public pages
- Progressive enhancement - works without JS where possible
