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
| **Reading Activity Heatmap** | GitHub-style yearly reading calendar with streaks | ✅ Completed |

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

### Medium Priority

| Feature | Description | Complexity |
|---------|-------------|------------|
| **KOReader Sync** | Sync progress with KOReader devices | Medium |
| **Public Widgets** | Embeddable widgets for blogs (V1 feature) | ✅ Completed |
| **AI Recommendations** | OpenAI-powered book suggestions (V1 feature) | ✅ Completed |
| **OIDC Authentication** | SSO with Authentik, Keycloak, etc. | Medium |
| **Email Book Sharing** | Send ebooks via email, Kindle support | Medium |
| **Better Login Page** | Improved design, password reset flow | ✅ Completed |
| **User Signup Flow** | Self-registration option | Low |

### Lower Priority

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Kobo Device Sync** | Native Kobo integration (BookLore feature) | High |
| **Real-Time Updates (SSE)** | Live notifications for imports, multi-user | Medium |
| **Community Reviews** | Display Goodreads reviews on book pages | Low |
| **Metadata Field Locking** | Prevent auto-refresh from overwriting edits | Low |

---

## Improvement Phases

### File Organization
- Consolidate static file paths (covers, ebooks, backups)
- Clean up orphaned files on book deletion
- Add storage usage reporting in admin

### Settings Overhaul
- Centralize all settings in one admin page
- Add settings validation and defaults
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
| KOReader Sync | ❌ | ❌ | ✅ |
| Kobo Sync | ❌ | ❌ | ✅ |
| OIDC/SSO | ❌ | ❌ | ✅ |
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
