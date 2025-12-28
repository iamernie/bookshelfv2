# BookShelf V2 - Development Roadmap

This document outlines feature status and planned improvements.

---

## Feature Status Overview

### ✅ Completed Features (V1 & BookLore Parity)

| Feature | Description | Status |
|---------|-------------|--------|
| **Ebook Reader** | Built-in EPUB/PDF/CBZ reader with themes, zoom, progress | ✅ Completed |
| **Reading Progress Tracking** | Save/restore reading position, percentage | ✅ Completed |
| **Enhanced Metadata Providers** | Google Books, Open Library, Goodreads, Hardcover, Amazon, ComicVine | ✅ Completed |
| **Metadata Lookup UI** | Search modal with provider tabs, field selection | ✅ Completed |
| **Author Metadata Fetch** | Wikipedia & Speculative Fiction Fandom integration | ✅ Completed |
| **Reading Goals** | 6 challenge types (books, genres, authors, formats, pages, monthly) | ✅ Completed |
| **Smart Collections** | Rule-based dynamic shelves (Magic Shelves) | ✅ Completed |
| **OPDS Catalog** | Full OPDS 1.2 feed for e-reader apps | ✅ Completed |
| **BookDrop Auto-Import** | Folder watching + queue management | ✅ Completed |
| **Bulk Operations** | Multi-select with tag/status/delete actions | ✅ Completed |
| **Public Library** | Separate library type for bulk imports | ✅ Completed |
| **Audible Import** | Import listening history from Audible | ✅ Completed |
| **CSV/Goodreads Import** | Import with series extraction, duplicate detection | ✅ Completed |
| **Export** | JSON and CSV export formats | ✅ Completed |
| **Author Duplicate Detection** | Find and merge duplicate authors | ✅ Completed |
| **Docker & CI/CD** | Docker Compose + GitHub Actions | ✅ Completed |
| **Dark Theme** | Full dark mode with localStorage persistence | ✅ Completed |
| **Statistics Dashboard** | Charts, timelines, reading analytics | ✅ Completed |
| **Quick Edit** | Hover overlay for rating/status changes | ✅ Completed |
| **Sortable List Headers** | Click columns to sort | ✅ Completed |
| **Inline Series Notes** | Edit series notes from book page | ✅ Completed |
| **Admin Console** | Log viewer with filtering | ✅ Completed |
| **Multi-user with Roles** | Admin/member roles, permissions | ✅ Completed |
| **User Management UI** | Admin user CRUD, role assignment, account unlock | ✅ Completed |
| **User Preferences** | Per-user theme, view settings, reader preferences | ✅ Completed |
| **Account Settings** | Profile editing, password change, preferences | ✅ Completed |
| **System Theme Support** | Light/Dark/System theme with OS preference sync | ✅ Completed |
| **Catalog Manager** | Unified interface for authors, genres, tags, series, narrators, formats | ✅ Completed |
| **Bulk Edit Modal** | Multi-field bulk editing (status, tags, genre, format, narrator, series, author) | ✅ Completed |
| **Reading Activity Heatmap** | GitHub-style yearly reading calendar with streaks | ✅ Completed |
| **Collapsible Sidebar** | Collapse sidebar to icon-only mode with localStorage persistence | ✅ Completed |
| **BookCard Hover Actions** | Quick access buttons (read, info, menu) on book cover hover | ✅ Completed |
| **Book Detail Tabs** | Tabbed interface with Details and Similar Books sections | ✅ Completed |
| **Similar Books** | Recommendations based on shared authors, series, genres | ✅ Completed |
| **Filter Mode Setting** | AND vs OR toggle for combining multiple filters | ✅ Completed |
| **Series View Mode** | Group books by series in grid view with collapsible sections | ✅ Completed |
| **File Naming Patterns** | Template-based file organization with placeholders and auto-organize | ✅ Completed |
| **User Signup Flow** | Public registration with email verification, invite codes, admin approval | ✅ Completed |
| **Invite Code System** | Admin-managed invite codes with usage limits and expiration | ✅ Completed |
| **Status Bar Quick Edit** | Clickable full-width status bar on BookCard with dropdown for quick status changes | ✅ Completed |
| **OIDC/SSO Authentication** | Single Sign-On with Authentik, Keycloak, custom providers | ✅ Completed |
| **Per-User Personal Libraries** | Each user has their own private book collection with sharing options | ✅ Completed |
| **Library Sharing** | Share your library with family/friends with read, read_write, or full permissions | ✅ Completed |

---

## 🚧 In Progress / Planned

### Pre-Release Checklist
- [x] Ebook Reader (EPUB, PDF, CBZ)
- [x] Reading Progress Tracking
- [x] Enhanced Metadata Providers
- [x] Author Wikipedia/Fandom Fetch
- [x] Docker Compose setup
- [x] GitHub Actions CI/CD
- [x] Public Library feature
- [x] Audible Import
- [x] Add logo
- [x] Prep README.md
- [x] Review menus for consistency
- [x] Better Login Page with password reset
- [x] Setup Wizard (first-run experience)
- [x] Database Repair Tools
- [x] Diagnostic Page
- [x] Public Widgets
- [x] AI Recommendations

---

## Planned Features

### High Priority

| Feature | Description | Status |
|---------|-------------|--------|
| **Setup Wizard** | First-run wizard for Docker deployments | ✅ Completed |
| **Database Repair Tools** | Orphan cleanup, duplicate detection, schema repair | ✅ Completed |
| **Diagnostic Page** | System health, storage usage, migration status | ✅ Completed |
| **Catalog Manager** | Unified interface for authors, genres, tags, series, narrators, formats with bulk ops | ✅ Completed |
| **Default Sort/View Preferences** | Configurable default sort field, direction, view mode per user | ✅ Completed |
| **File Naming Patterns** | Template-based file organization with {title}, {authors}, {series} placeholders | ✅ Completed |
| **Write Metadata to File** | Embed metadata into EPUB/PDF files | Planned |
| **Provider Priority Matrix** | Per-field metadata provider priority (1st-4th) with library overrides | Planned |

### Medium Priority

| Feature | Description | Complexity |
|---------|-------------|------------|
| **KOReader Sync** | Sync progress with KOReader devices | Medium |
| **Public Widgets** | Embeddable widgets for blogs (V1 feature) | ✅ Completed |
| **AI Recommendations** | OpenAI-powered book suggestions (V1 feature) | ✅ Completed |
| **OIDC Authentication** | SSO with Authentik, Keycloak, etc. | ✅ Completed |
| **Per-User Libraries** | Each user has their own private book collection | ✅ Completed |
| **Library Sharing** | Share libraries with family/friends, permission levels | ✅ Completed |
| **Email Book Sharing** | Send ebooks via email, Kindle support | Medium |
| **Better Login Page** | Improved design, password reset flow | ✅ Completed |
| **User Signup Flow** | Self-registration with email verification, invite codes, admin approval | ✅ Completed |
| **Series View Mode** | Group books by series in grid view | ✅ Completed |
| **Auto-Move Files on Update** | Rename/move files based on metadata changes | Medium |
| **Public Reviews Download** | Fetch and display Amazon/Goodreads reviews | Medium |
| **Reader Settings Scope** | Global vs per-book reader preferences | Medium |
| **Default Sort/View Preferences** | Configurable default sort field, direction, view mode | ✅ Completed |
| **Filter Mode Setting** | AND vs OR for combining filters | ✅ Completed |

### Lower Priority

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Barcode Scanner** | ISBN lookup via device camera for quick book adding | Medium |
| **Infinite Scroll** | Virtual scrolling for large book lists | Medium |
| **Kobo Device Sync** | Native Kobo integration (BookLore feature) | High |
| **Real-Time Updates (SSE)** | Live notifications for imports, multi-user | Medium |
| **Community Reviews** | Display Goodreads reviews on book pages | Low |
| **Metadata Field Locking** | Prevent auto-refresh from overwriting edits | Low |
| **EPUB Font Options** | Book Default/Serif/Sans Serif/Roboto/Cursive/Monospace | Low |
| **EPUB Flow Mode** | Paginated vs scrolled reading | Low |
| **EPUB/PDF Page Spread** | Single page vs double page view | Low |
| **PDF Page Zoom Options** | Auto Zoom/Page Fit/Page Width/Actual Size | Low |
| **CBX Fit Mode** | Fit Page/Width/Height/Actual Size/Automatic | Low |
| **CBX Scroll Mode** | Paginated vs infinite scroll for comics | Low |
| **Cover Cropping Options** | Vertical/horizontal auto-crop with aspect ratio threshold | Low |
| **Max File Upload Size** | Configurable upload limit in settings | Low |
| **Library-Specific Overrides** | Per-library sort/view/metadata preferences | Low |
| **Douban Metadata Provider** | Chinese book metadata source | Low |

---

## Improvement Phases

### File Organization
- Consolidate static file paths (covers, ebooks, backups)
- Clean up orphaned files on book deletion
- Add storage usage reporting in admin

### Settings Overhaul ✅
- Centralize all settings in one admin page ✅
- Separate admin (system) settings from user preferences ✅
- User management UI for admins ✅
- Per-user preferences with theme, view, reader settings ✅
- Add settings validation and defaults ✅
- Environment variable documentation

### Diagnostic Tools ✅
- System health dashboard
- Database integrity checks
- Migration status and repair tools
- Storage usage breakdown

---

## Known Bugs & Issues

*No critical bugs currently tracked. Add issues here as they're discovered.*

| Bug | Severity | Status |
|-----|----------|--------|
| — | — | — |

---

## Feature Comparison: V2 vs V1 vs BookLore

| Feature | V2 | V1 | BookLore |
|---------|----|----|----------|
| EPUB Reader | ✅ | ✅ | ✅ |
| PDF Reader | ✅ | ✅ | ✅ |
| CBZ/Comic Reader | ✅ | ✅ | ✅ |
| Reading Progress | ✅ | ✅ | ✅ |
| Reading Heatmap | ✅ | ❌ | ✅ |
| Metadata Providers | ✅ 6 sources | ✅ 2 sources | ✅ 5 sources |
| Amazon Metadata | ✅ | ❌ | ✅ |
| ComicVine Metadata | ✅ | ❌ | ✅ |
| Author Wikipedia | ✅ | ✅ | ✅ |
| Reading Goals | ✅ 6 types | ✅ 6 types | ❌ |
| Smart Collections | ✅ | ❌ | ✅ |
| OPDS Catalog | ✅ | ❌ | ✅ |
| BookDrop | ✅ | ❌ | ✅ |
| Public Library | ✅ | ❌ | ✅ |
| Audible Import | ✅ | ✅ | ❌ |
| Public Widgets | ✅ | ✅ | ❌ |
| AI Recommendations | ✅ | ✅ | ✅ |
| Collapsible Sidebar | ✅ | ❌ | ✅ |
| Similar Books | ✅ | ❌ | ✅ |
| Catalog Manager | ✅ | ❌ | ✅ |
| File Naming Patterns | ✅ | ❌ | ✅ |
| Write Metadata to File | ❌ | ❌ | ✅ |
| Provider Priority Matrix | ❌ | ❌ | ✅ |
| Series View Mode | ✅ | ❌ | ✅ |
| Reader Settings Scope | ❌ | ❌ | ✅ |
| Public Reviews | ❌ | ❌ | ✅ |
| Barcode Scanner | ❌ | ✅ | ❌ |
| Infinite Scroll | ❌ | ✅ | ✅ |
| KOReader Sync | ❌ | ❌ | ✅ |
| Kobo Sync | ❌ | ❌ | ✅ |
| OIDC/SSO | ✅ | ❌ | ✅ |
| Per-User Libraries | ✅ | ❌ | ✅ |
| Library Sharing | ✅ | ❌ | ✅ |
| Email Sharing | ❌ | ❌ | ✅ |
| Docker | ✅ | ✅ | ✅ |
| Dark Theme | ✅ | ✅ | ✅ |

---

## Implementation Notes

### Setup Wizard ✅ (Completed)

First-run experience for Docker deployments:

1. **Welcome** - Introduction and requirements check
2. **Database** - Verify/create database connection
3. **Admin Account** - Create first admin user
4. **Complete** - Summary and redirect to login

Detection: Check if `users` table is empty, redirect to `/setup` if so.

### Diagnostic Page ✅ (Completed)

Admin-only system diagnostics at `/admin/diagnostics`:

- **System Status** - Overall health status (healthy/warning/error)
- **Database Info** - Size, path, connection status
- **Storage Usage** - Cover and ebook file counts and sizes
- **Data Summary** - Counts for books, authors, series, genres, users, sessions
- **Issue Detection** - Orphaned relationships, invalid references, expired sessions
- **Repair Tools** - One-click fixes for detected issues

### Catalog Manager ✅ (Completed)

Unified metadata management interface at `/catalog`:

**Tabs for each entity type:**
- Authors, Genres, Tags, Series, Publishers, Languages, Narrators

**Features per tab:**
- Sortable table with search/filter
- Book count per entity
- Multi-select with bulk operations
- Quick actions: View books, Edit, Delete

**Bulk Operations:**
- Delete selected ✅
- Merge selected (combine duplicates) ✅
- Bulk edit from book pages (status, tags, genre, format, narrator, series, author) ✅

**Future Smart Features:**
- Fuzzy duplicate detection (suggest "J.R.R. Tolkien" = "JRR Tolkien")
- Bulk metadata fetch (e.g., fetch Wikipedia bios for selected authors)
- Relationship visualization (author → series → books graph)
- Entity import/export (backup just authors or tags)

### User Management & Preferences ✅ (Completed)

Multi-user system with role-based access and personal preferences:

**Admin User Management (`/admin/users`):**
- List all users with role stats
- Create new users with role assignment
- Edit user profiles and roles
- Delete users (with cascade cleanup)
- Unlock locked accounts
- Search and pagination

**User Account (`/account`):**
- View and edit profile information
- Change password with current password verification

**User Preferences (`/account/settings`):**
- Theme selection (Light/Dark/System with OS sync)
- Default books view (Grid/List/Table)
- Default sort field and direction
- Books per page setting
- Reader preferences (theme, font, size, line height)
- Notification toggles (goal reminders, email)

**System Settings (`/admin/settings`):**
- Application-wide configuration
- Storage paths
- Library settings
- OPDS catalog settings
- Import behavior
- Metadata providers
- AI recommendations configuration

### File Naming Patterns (Planned)

Template-based file organization at `/admin/settings/patterns`:

**Default Pattern:**
```
{authors}/{series}/>{seriesIndex}. >{title}< - {authors}>< ({year})>
```

**Available Placeholders:**
- `{title}` - Book title
- `{subtitle}` - Book subtitle
- `{authors}` - Author name(s)
- `{year}` - Publication year
- `{series}` - Series name
- `{seriesIndex}` - Series number (e.g., 01)
- `{isbn13}` - ISBN-13

**Optional Blocks:**
- Wrap in `<...>` to make optional (excluded if placeholder empty)
- Example: `<{seriesIndex} - >{title}` outputs "01 - Dune" or just "Dune"

**Library-Specific Overrides:**
- Different patterns per genre/library

### User Signup Flow ✅ (Completed)

Public registration system with multiple security options:

**Registration Settings (`/admin/settings`):**
- Enable/disable public signups
- Require email verification
- Require invite code
- Require admin approval
- Default role for new users

**Invite Code System (`/admin/invite-codes`):**
- Generate codes with format BOOK-XXXX-XXXX
- Set optional max uses per code
- Set optional expiration date
- Activate/deactivate codes
- Track usage count
- Label codes for organization

**Admin Approval Workflow:**
- New users marked as "pending" when approval required
- Admin panel shows pending approvals count
- Approve or reject users from invite codes page
- Rejected users cannot log in

**Email Verification:**
- Verification email sent on signup (if email configured)
- 24-hour token expiration
- Resend verification option
- Unverified users cannot log in

### Per-User Personal Libraries ✅ (Completed)

Multi-user private book collections with sharing capabilities:

**Database Changes:**
- Added `ownerId` column to books table (references users.id)
- Created `library_shares` table for sharing permissions
- Migration auto-assigns existing books to admin user (id=1)

**Permission Levels:**
- `read` - View books and download ebooks only
- `read_write` - Add/edit/remove books (except delete)
- `full` - Full access including delete permissions

**Sharing Features:**
- Share your library with other users
- Accept/view libraries shared with you
- Change permission levels anytime
- Remove shares

**Access Control:**
- New users start with empty library
- Users only see their own books + shared libraries
- Permission checks on all book operations
- Ebook downloads restricted to accessible books

**UI (`/account/settings`):**
- "Library Sharing" section in user settings
- View/manage who you've shared with
- View libraries shared with you
- Share library modal with user selection and permission picker

---

## Tech Stack

- **Frontend**: SvelteKit 2, Svelte 5 (runes), TailwindCSS
- **Backend**: SvelteKit API routes, Drizzle ORM
- **Database**: SQLite (better-sqlite3)
- **Reader**: epub.js for EPUB rendering
- **Deployment**: Docker, GitHub Actions

---

## Contributing

See the pre-release checklist for items that need attention. Most high-priority features are now complete - remaining work includes adding a logo and reviewing menu consistency.
