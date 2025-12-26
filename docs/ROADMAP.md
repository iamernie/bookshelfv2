# BookShelf V2 - Future Development Roadmap

This document outlines planned features and implementation details for future phases.

---

## Priority Matrix

| Feature | User Value | Complexity | Status |
|---------|------------|------------|--------|
| Public Library | High | Medium | In Progress |
| Sortable List Headers | High | Low | ✅ Completed |
| Quick Edit on BookCard | High | Low | ✅ Completed |
| Date Formatting Standardization | Medium | Low | ✅ Completed |
| Git Exclusions (covers/ebooks/db) | High | Low | ✅ Completed |
| File Organization (covers/ebooks) | High | Medium | Planned |
| Settings Review & Wiring | High | Medium | Planned |
| Reading Goals (V1 parity) | High | Low | ✅ Completed |
| Better Stats (V1 parity) | High | Medium | Planned |
| Docker & GitHub Actions | High | Medium | ✅ Completed |
| Setup Wizard | High | Medium | Planned |
| Database Migration/Repair Tool | High | Medium | Planned |
| Diagnostic Page | Medium | Low | Planned |
| Better Login Page | Medium | Low | Planned |
| User Signup Flow | Medium | Low | Planned |
| Inline Series Notes | Medium | Low | ✅ Completed |
| Multi-User Permissions | High | High | Planned |
| OIDC Authentication | Medium | Medium | Planned |
| Email Notifications | Medium | Medium | Planned |
| KOReader Sync | Medium | Medium | Planned |
| Reading Sessions | Medium | Medium | Planned |
| Real-Time (SSE) | Medium | Medium | Planned |
| Recommendations | Low | High | Planned |

---

## Bugs & Issues

| Issue | Priority | Status |
|-------|----------|--------|
| Public Library list view doesn't work | High | ✅ Fixed |
| TypeScript errors in codebase | Medium | ✅ Fixed |
| Menus need review for consistency | Low | Open |

---

## Pre-Release Checklist

- [x] Fix Public Library list view
- [x] Clean up TypeScript errors
- [x] Standardize date formatting
- [x] Ensure covers, database, ebooks excluded from git
- [ ] Add logo
- [ ] Prep README.md
- [ ] Review menus for consistency
- [x] Docker Compose setup
- [x] GitHub Actions CI/CD
- [ ] Review BookLore & V1 for feature parity

---

## Phase 6: Public Library (In Progress)

Separate "Public Library" from personal collection for bulk ebook imports. Books in public library don't affect personal stats until explicitly added.

### Concept

When importing thousands of ebooks via BookDrop, they go to a "Public Library" where:
- They're tracked but don't impact personal reading stats
- Series completion percentages only count personal books
- Dashboard stats show "X books in my library (Y total tracked)"
- Users can browse and "Add to My Library" to make them personal

### Database Schema

```sql
ALTER TABLE books ADD COLUMN libraryType TEXT DEFAULT 'personal';
-- Values: 'personal' | 'public'

CREATE INDEX idx_books_libraryType ON books(libraryType);
```

### Implementation Plan

**1. Migration:**
- Add `libraryType` column with default `'personal'` (backward compatible)
- All existing books remain personal

**2. BookDrop Updates:**
- Add setting for default library type on import
- Default to `'public'` for bulk imports
- Show library type badge in queue

**3. Stats Filtering:**
- Update all stats queries to filter by `libraryType = 'personal'`
- Series completion: only count personal books
- Dashboard: show dual counts where appropriate

**4. UI Updates:**
- Add "Public Library" browse page
- "Add to My Library" button on book cards/details
- Filter toggle on books page (My Library / Public / All)
- Visual indicator for public vs personal books

**5. Bulk Operations:**
- "Add to Library" bulk action for public books
- "Move to Public" bulk action for personal books

### Files to Create/Modify

```
migrations/
  YYYYMMDD_add_library_type.js

src/lib/server/services/
  bookService.ts (add libraryType filter)
  statsService.ts (filter by personal)

src/routes/api/books/
  [id]/library/+server.ts (toggle library type)

src/routes/library/
  +page.svelte (Public Library browse)

src/lib/components/book/
  BookCard.svelte (add library badge, add-to-library action)
  LibraryToggle.svelte (quick toggle component)
```

---

## Phase 6.1: Quick Edit on BookCard (Planned)

Enable quick editing of common fields directly from BookCard without opening full edit page.

### Features

- Hover/tap reveals quick action overlay
- One-click rating (star picker)
- One-click status change (dropdown)
- Tag toggle (add/remove common tags)
- Works in both grid and list views

### Implementation

```svelte
<!-- BookCard quick actions overlay -->
<div class="quick-actions">
  <StarRating value={book.rating} onRate={handleRate} />
  <StatusDropdown value={book.statusId} onChange={handleStatus} />
  <TagToggle tags={book.tags} onToggle={handleTagToggle} />
</div>
```

---

## Phase 6.2: Inline Series Notes from Book Page (✅ Completed)

When viewing a book that belongs to a series, allow editing series notes inline.

### Features

- Show series notes section on book detail page (if book has series)
- Click to edit series notes without leaving book page
- Updates series record via API
- Useful for tracking series-level info while reviewing books

### Implementation (Completed)

- ✅ Added `comments` field to series data in `bookService.ts`
- ✅ Added inline editing state and functions in book detail page
- ✅ Added series notes section with inline editing UI
- ✅ Uses existing API: `PUT /api/series/:id` with comments field

---

## Phase 9: Multi-User System with Permissions

Full multi-user support with granular permission controls. Enables shared libraries with access control.

### User Roles & Permissions

```typescript
enum Permission {
  VIEW_BOOKS = 'view_books',
  ADD_BOOKS = 'add_books',
  EDIT_BOOKS = 'edit_books',
  DELETE_BOOKS = 'delete_books',
  MANAGE_ENTITIES = 'manage_entities',
  IMPORT_EXPORT = 'import_export',
  UPLOAD_EBOOKS = 'upload_ebooks',
  READ_EBOOKS = 'read_ebooks',
  VIEW_STATS = 'view_stats',
  MANAGE_USERS = 'manage_users',
  MANAGE_SETTINGS = 'manage_settings',
}

const ROLES = {
  admin: ['*'],
  editor: [
    'view_books', 'add_books', 'edit_books', 'manage_entities',
    'import_export', 'upload_ebooks', 'read_ebooks', 'view_stats'
  ],
  member: [
    'view_books', 'add_books', 'edit_books',
    'upload_ebooks', 'read_ebooks', 'view_stats'
  ],
  viewer: ['view_books', 'read_ebooks'],
  guest: ['view_books']
};
```

### Database Schema Updates

```sql
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'member';
ALTER TABLE users ADD COLUMN permissions TEXT;
ALTER TABLE users ADD COLUMN isActive INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN lastLoginAt TEXT;
ALTER TABLE users ADD COLUMN invitedBy INTEGER REFERENCES users(id);
ALTER TABLE users ADD COLUMN avatarUrl TEXT;

CREATE TABLE user_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'member',
  invitedBy INTEGER REFERENCES users(id),
  expiresAt TEXT NOT NULL,
  usedAt TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entityType TEXT,
  entityId INTEGER,
  details TEXT,
  ipAddress TEXT,
  createdAt TEXT NOT NULL
);
```

### Implementation Files

```
src/lib/server/services/
  userService.ts
  permissionService.ts
  invitationService.ts
  activityService.ts

src/lib/server/utils/
  permissions.ts
  auth.ts (update)

src/routes/admin/
  users/+page.svelte
  users/[id]/+page.svelte
  users/invite/+page.svelte
  activity/+page.svelte

src/routes/api/admin/
  users/+server.ts
  users/[id]/+server.ts
  invitations/+server.ts
```

### Features

1. **User Management UI** (Admin only)
   - List all users with role, status, last login
   - Edit user role/permissions
   - Deactivate/reactivate users
   - Delete users (with data handling options)

2. **Invitation System**
   - Admin sends invite via email
   - Invite link with expiring token
   - New user sets password on first visit

3. **Permission Middleware**
   ```typescript
   export function requirePermission(permission: Permission) {
     return (event) => {
       if (!event.locals.user) throw redirect(302, '/login');
       if (!hasPermission(event.locals.user, permission)) {
         throw error(403, 'Insufficient permissions');
       }
     };
   }
   ```

4. **Activity Logging**
   - Track all significant actions
   - Filterable activity log for admins

---

## Phase 10: OIDC Authentication (SSO)

Support external identity providers for single sign-on.

### Supported Providers

- Generic OIDC (any compliant provider)
- Authentik
- Keycloak
- Google OAuth
- GitHub OAuth
- Pocket ID

### Database Schema

```sql
CREATE TABLE oauth_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  clientId TEXT NOT NULL,
  clientSecret TEXT NOT NULL,
  issuerUrl TEXT,
  authorizationUrl TEXT,
  tokenUrl TEXT,
  userInfoUrl TEXT,
  scopes TEXT DEFAULT 'openid profile email',
  isEnabled INTEGER DEFAULT 1,
  autoCreateUsers INTEGER DEFAULT 0,
  defaultRole TEXT DEFAULT 'member',
  displayOrder INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE user_oauth_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  providerId INTEGER NOT NULL REFERENCES oauth_providers(id),
  providerUserId TEXT NOT NULL,
  providerEmail TEXT,
  providerData TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE(providerId, providerUserId)
);
```

### Implementation Files

```
src/lib/server/services/
  oauthService.ts
  oidcService.ts

src/routes/auth/
  oauth/[provider]/+server.ts
  oauth/[provider]/callback/+server.ts

src/routes/login/+page.svelte (update with OAuth buttons)

src/routes/admin/
  oauth/+page.svelte
  oauth/[id]/+page.svelte
```

### OAuth Flow

1. User clicks "Sign in with [Provider]"
2. Redirect to provider's authorization URL
3. User authenticates with provider
4. Provider redirects back with authorization code
5. Exchange code for tokens
6. Fetch user info from provider
7. Match to existing user or create new (if enabled)
8. Create session and redirect to app

### OIDC Discovery

```typescript
async function discoverOIDCEndpoints(issuerUrl: string) {
  const config = await fetch(`${issuerUrl}/.well-known/openid-configuration`).then(r => r.json());
  return {
    authorizationUrl: config.authorization_endpoint,
    tokenUrl: config.token_endpoint,
    userInfoUrl: config.userinfo_endpoint,
    jwksUrl: config.jwks_uri
  };
}
```

---

## Phase 12: Email Book Sharing

Send books directly via email from the interface.

### Features

1. **Send to Kindle** - Auto-format for Kindle email addresses
2. **Share with Friend** - Email book with custom message
3. **Email Queue** - Handle multiple sends gracefully
4. **Delivery Tracking** - Track sent emails

### Database Schema

```sql
CREATE TABLE email_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bookId INTEGER REFERENCES books(id),
  recipientEmail TEXT NOT NULL,
  recipientName TEXT,
  subject TEXT NOT NULL,
  body TEXT,
  attachmentPath TEXT,
  status TEXT DEFAULT 'pending',
  errorMessage TEXT,
  sentAt TEXT,
  createdAt TEXT NOT NULL,
  createdBy INTEGER REFERENCES users(id)
);

CREATE TABLE user_email_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER REFERENCES users(id),
  email TEXT NOT NULL,
  label TEXT,
  isKindle INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL
);
```

### Implementation Files

```
src/lib/server/services/
  emailService.ts (extend)
  emailQueueService.ts

src/routes/api/books/[id]/
  share/+server.ts

src/lib/components/book/
  ShareBookModal.svelte
  EmailAddressBook.svelte
```

### Kindle Integration

- Detect @kindle.com addresses
- Convert EPUB to MOBI if needed
- Set proper subject line for Kindle

---

## Phase 13: KOReader Progress Sync

Sync reading progress with KOReader devices.

### KOSync API

```
POST /api/kosync/users/create     # Register device
POST /api/kosync/users/auth       # Authenticate
PUT /api/kosync/syncs/progress    # Update progress
GET /api/kosync/syncs/progress/:document  # Get progress
```

### Database Schema

```sql
CREATE TABLE koreader_devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER REFERENCES users(id),
  deviceName TEXT NOT NULL,
  deviceId TEXT NOT NULL UNIQUE,
  lastSyncAt TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE koreader_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deviceId INTEGER REFERENCES koreader_devices(id),
  bookId INTEGER REFERENCES books(id),
  document TEXT NOT NULL,
  progress REAL NOT NULL,
  percentage REAL,
  device TEXT,
  timestamp INTEGER,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE(deviceId, document)
);
```

### Implementation Files

```
src/routes/api/kosync/
  users/create/+server.ts
  users/auth/+server.ts
  syncs/progress/+server.ts
  syncs/progress/[document]/+server.ts

src/lib/server/services/
  koreaderService.ts
```

### Features

1. Device registration
2. Bi-directional progress sync
3. Book matching by hash or filename
4. Multi-device support

---

## Phase 15: Reading Session Tracking

Track detailed reading sessions for analytics.

### Database Schema

```sql
CREATE TABLE reading_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER REFERENCES users(id),
  bookId INTEGER REFERENCES books(id),
  startedAt TEXT NOT NULL,
  endedAt TEXT,
  durationSeconds INTEGER,
  startProgress REAL,
  endProgress REAL,
  startPage INTEGER,
  endPage INTEGER,
  device TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE reading_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER REFERENCES users(id),
  bookId INTEGER REFERENCES books(id),
  totalTimeSeconds INTEGER DEFAULT 0,
  sessionsCount INTEGER DEFAULT 0,
  lastReadAt TEXT,
  currentProgress REAL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE(userId, bookId)
);
```

### Implementation Files

```
src/lib/server/services/
  readingSessionService.ts

src/routes/api/reading/
  sessions/+server.ts
  progress/+server.ts

src/lib/components/reader/
  SessionTracker.svelte
```

### Features

1. Auto start/stop sessions
2. Idle detection (pause tracking when inactive)
3. Progress sync from sessions
4. Analytics (time spent, velocity, peak times)
5. BeaconAPI fallback for reliable session end

---

## Phase 16: Real-Time Notifications (SSE)

Real-time updates via Server-Sent Events.

### Use Cases

1. Import progress
2. Library updates (multi-tab/user)
3. BookDrop notifications
4. Background task status

### Implementation (SSE)

```typescript
// src/routes/api/events/+server.ts
export async function GET({ locals }) {
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      eventEmitter.on('book:created', (book) => send('book:created', book));
      eventEmitter.on('import:progress', (progress) => send('import:progress', progress));
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

### Client Integration

```typescript
// src/lib/stores/realtime.ts
function createRealtimeStore() {
  let eventSource: EventSource | null = null;

  function connect() {
    eventSource = new EventSource('/api/events');

    eventSource.addEventListener('book:created', (e) => {
      const book = JSON.parse(e.data);
      toasts.success(`New book added: ${book.title}`);
      invalidateAll();
    });
  }

  function disconnect() {
    eventSource?.close();
  }

  return { connect, disconnect };
}
```

---

## Phase 17: Advanced Features & Polish

### Community Reviews Integration

- Fetch reviews from Goodreads, Amazon
- Display aggregated ratings
- Cache reviews with TTL

### Book Recommendations

- "Similar books" based on genre, author, tags
- "Because you read X" suggestions
- Collaborative filtering (if multi-user)

### Private Notes

- Per-book notes visible only to user
- Rich text editor
- Note search

### Mobile App Considerations

- PWA manifest
- Offline support (service worker)
- Touch-optimized UI
- Native app wrapper (Capacitor/Tauri)

---

## Phase 7: File Organization (Planned)

Better organization of cover images and ebook files with structured folder hierarchy.

### Proposed Structure

**Public Library:**
```
/static/covers/public/{author}/{series}/{book-slug}.jpg
/static/ebooks/public/{author}/{series}/{book-slug}.epub
```

**Personal Libraries:**
```
/static/covers/users/{userId}/{author}/{series}/{book-slug}.jpg
/static/ebooks/users/{userId}/{author}/{series}/{book-slug}.epub
```

### Implementation

- Slugify author, series, and book names for filesystem safety
- Handle books without series (skip series folder)
- Migration script to reorganize existing files
- Update file path references in database
- Settings for custom path patterns

---

## Phase 8: Settings System Overhaul (Planned)

Review and wire up all settings, with distinction between personal and site-wide settings.

### Settings Categories

**Site-Wide (Admin Only):**
- Storage paths (covers, ebooks, database)
- OPDS configuration
- Email/SMTP settings
- Import defaults
- Registration settings (open/invite-only/closed)

**Personal (Per-User):**
- Display preferences (books per page, default sort)
- Theme preference
- Email notification preferences
- Default status for new books

### Implementation

- Separate `site_settings` and `user_settings` tables
- Settings service with proper access control
- Settings UI with tabs for different categories

---

## Phase 11: Setup Wizard (Planned)

First-run setup wizard for initial installation.

### Steps

1. **Welcome** - Introduction and requirements check
2. **Database** - Create or connect to database
3. **Admin Account** - Create first admin user
4. **Storage** - Configure paths for covers/ebooks
5. **Optional** - SMTP, OPDS, other settings
6. **Complete** - Summary and redirect to login

### Implementation

- Detect first run (no users in database)
- Lock wizard after completion
- Skip wizard if already configured

---

## Phase 14: Diagnostic & Admin Tools (Planned)

Admin pages for system health and maintenance.

### Diagnostic Page

- Database connection status
- Storage paths and disk usage
- Migration status
- Recent errors from logs
- System info (Node version, dependencies)

### Database Tools

- Run pending migrations
- Repair common schema issues
- Orphaned file cleanup
- Export/backup functionality
- Import from V1 database

---

## Dependencies to Add

```json
{
  "chokidar": "^3.5.3",    // Already added for BookDrop
  "nodemailer": "^6.9.x",  // Already installed
  "jose": "^5.2.0"         // JWT handling for OIDC
}
```
