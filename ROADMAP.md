# BookShelf V2 Roadmap

This document outlines planned features, improvements, and future direction for BookShelf V2.

## Completed

### Core Features
- [x] Book management (CRUD, search, filters, bulk operations)
- [x] Author management with Wikipedia metadata import
- [x] Series management with book ordering and gap tracking
- [x] Genre, format, narrator, and tag management
- [x] Reading status tracking with DNF support
- [x] Reading goals and challenges
- [x] Statistics and analytics dashboard
- [x] Cover image handling (upload, auto-download)

### User System
- [x] Multi-user authentication
- [x] Role-based access (admin, member)
- [x] Email verification for signups
- [x] Password reset via email
- [x] Invite codes for controlled registration
- [x] Admin approval workflow
- [x] **OIDC/SSO authentication** (Authentik, Keycloak, Google, GitHub, etc.)
- [x] Account linking for OIDC providers

### Import/Export
- [x] CSV export (books, authors, series)
- [x] CSV import (Goodreads format)
- [x] JSON full backup and restore
- [x] Audible HTML library import

### Ebook Features
- [x] EPUB reader with progress persistence
- [x] PDF viewer
- [x] CBZ comic reader
- [x] Metadata extraction from EPUB files
- [x] File naming patterns for organization

### Other
- [x] OPDS catalog feed
- [x] Dark mode
- [x] Mobile-responsive design
- [x] Public widgets (embeddable)
- [x] API documentation (Swagger UI)
- [x] Database migration system with automatic backups
- [x] Upgrade progress page for V1 to V2 migrations

---

## In Progress

*Nothing currently in active development*

---

## Planned

### Short Term
- [ ] Barcode/ISBN scanner (mobile camera)
- [ ] AI-powered recommendations
- [ ] Public landing page (optional)
- [ ] "What's New" changelog modal

### Medium Term
- [ ] Reading analytics (time tracking, pace)
- [ ] Book club features (shared lists, discussions)
- [ ] Wishlist with price tracking
- [ ] Goodreads sync (two-way)
- [ ] Custom fields for books

### Long Term
- [ ] Mobile app (PWA or native)
- [ ] Social features (follow users, public profiles)
- [ ] Multi-library support
- [ ] Plugin/extension system
- [ ] Audiobook playback integration

---

## Ideas / Under Consideration

- LibraryThing import
- Kindle sync
- Read-aloud (TTS) for ebooks
- Book lending tracker
- Series completion notifications
- Reading streaks and achievements
- Integration with local library catalogs
- Book recommendations from friends
- Collaborative reading lists

---

## Contributing

Have a feature request? Open an issue on GitHub with the `enhancement` label.
