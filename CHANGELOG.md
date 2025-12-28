# Changelog

All notable changes to BookShelf V2 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2025-12-27

### Added
- **Email/SMTP Settings in UI** - Configure email settings directly from the admin panel
  - New "Email" tab in Settings with SMTP configuration (host, port, SSL/TLS, credentials)
  - Hybrid configuration: environment variables take precedence over UI settings
  - Shows "Configured via Environment Variables" notice when using env vars
  - Test email functionality to verify SMTP configuration
  - Supports common providers (Gmail, Mailgun, SendGrid, SES, etc.)

### Changed
- **Redesigned Settings Page** - New tabbed interface for cleaner navigation
  - Tabs: General, Storage, Metadata, OPDS, Import, Users, Email, SSO, AI
  - SSO tab links to dedicated OIDC provider management page
  - Each tab contains only relevant settings, reducing clutter
- **Reorganized Sidebar** - Cleaner admin navigation
  - Added collapsible "Admin" section for admin users
  - Admin section includes: Users, Invite Codes, BookDrop, Diagnostics, Settings
  - Removed redundant "System Settings" from bottom of sidebar

### Fixed
- Database migration now properly handles settings table schema changes from V1
- User password migration from V1 databases (passwordHash → password column)

## [0.4.4] - 2025-12-27

### Added
- Amazon metadata provider settings (enable/disable, domain selection)
- Comic Vine metadata provider settings (enable/disable, API key)

## [0.4.3] - 2025-12-27

### Added
- OIDC/SSO settings link on admin settings page

## [0.4.2] - 2025-12-27

### Fixed
- Cover images and ebooks now properly served in Docker deployments
  - Added dynamic file serving routes for `/covers/` and `/ebooks/`
  - Fixes issue where runtime-mounted volumes weren't accessible via static paths

## [0.4.1] - 2025-12-27

### Fixed
- V1 to V2 migration now correctly marks existing users as email-verified
  - Existing V1 users no longer blocked from login due to missing email verification

### Added
- Password reset CLI script for Docker deployments
  - Usage: `docker exec -it bookshelf-v2 node scripts/reset-password.js <email> <new-password>`

## [0.4.0] - 2025-12-27

### Added
- **OIDC/SSO Authentication** - Single Sign-On support via OpenID Connect
  - Support for multiple OIDC providers (Authentik, Keycloak, Google, GitHub, etc.)
  - Provider presets for quick configuration (Google, GitHub, Authentik, Keycloak)
  - Admin UI for provider management at `/admin/settings/oidc`
  - Account linking in user settings - connect/disconnect OIDC providers
  - First-time OIDC user flow with option to link existing account or create new
  - Local login always available as fallback
  - Secure state/nonce handling for CSRF protection

- **Database Migration System**
  - Automatic pre-migration backups before schema changes
  - Upgrade progress page at `/upgrade` with real-time status
  - Safe V1 to V2 database upgrades
  - Case-insensitive table name handling

## [0.3.0] - 2025-12-27

### Added
- Multi-user system with roles (admin, member)
- User signup with email verification
- Invite code system for controlled registration
- Admin approval workflow for new users
- Catalog manager for genres, formats, narrators, tags, and statuses

### Changed
- Improved UI consistency across admin pages
- Enhanced settings organization

## [0.2.0] - 2025-12-26

### Added
- EPUB reader with progress tracking
- PDF reader support
- CBZ comic reader
- Reading progress persistence
- EPUB metadata extraction on upload

### Changed
- Improved book detail modal
- Enhanced file upload handling

## [0.1.0] - 2025-12-25

### Added
- Initial release with feature parity to V1
- Book management (CRUD, search, filters)
- Author management with Wikipedia import
- Series management with gap tracking
- Reading status tracking
- Reading goals and challenges
- Statistics dashboard
- CSV/JSON import and export
- Audible library import
- OPDS feed support
- Dark mode
- Mobile-responsive design
