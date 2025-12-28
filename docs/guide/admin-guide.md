# Admin Guide

## Chapter 8: The Librarian's Secret Handbook

```
    🔐 ═══════════════════════════════════════ 🔐
    ║                                           ║
    ║   ADMIN PANEL                            ║
    ║   ───────────────────                    ║
    ║   Where the magic happens...             ║
    ║   and settings get configured.           ║
    ║                                           ║
    🔐 ═══════════════════════════════════════ 🔐
```

Welcome, Administrator! This is your control room. Handle with care, great power, and all that jazz.

---

## Accessing Admin

Only users with **Admin** role can access admin features.

1. Click your profile icon
2. Select **Admin**

Or navigate directly to:
```
https://your-bookshelf.com/admin
```

![Admin Dashboard](../images/admin-dashboard.png)
*The admin control center*

---

## Admin Sidebar

Your navigation hub:

| Section | Purpose |
|---------|---------|
| **Settings** | App configuration |
| **Users** | User management |
| **Invite Codes** | Registration control |
| **BookDrop** | Auto-import config |
| **Console** | Log viewer |
| **Diagnostics** | System health |

---

## Settings

The big one! All configuration lives here.

### Settings Tabs

![Settings Page](../images/admin-settings-tabs.png)
*Organized settings by category*

| Tab | Contents |
|-----|----------|
| **General** | App name, URL, basic settings |
| **Storage** | File paths, limits |
| **Metadata** | Provider configuration |
| **OPDS** | Catalog settings |
| **Import** | Default import options |
| **Users** | Registration, roles |
| **Email** | SMTP configuration |
| **SSO** | OIDC/OAuth settings |
| **AI** | OpenAI integration |

---

### General Settings

![General Settings](../images/settings-general.png)
*Basic app configuration*

| Setting | Description |
|---------|-------------|
| **App Name** | Displayed in header, title |
| **Site URL** | Your full URL (for links) |
| **Public Catalog** | Enable public browsing |
| **Allow Registration** | Open signup |
| **Require Invite** | Need code to register |

### Storage Settings

![Storage Settings](../images/settings-storage.png)
*File and database paths*

| Setting | Default | Description |
|---------|---------|-------------|
| **Database Path** | /data/bookshelf.sqlite | SQLite location |
| **Covers Path** | /app/static/covers | Cover images |
| **Ebooks Path** | /app/static/ebooks | Uploaded ebooks |
| **Backups Path** | /data/backups | Backup files |
| **Max Upload Size** | 100MB | Ebook size limit |

### Metadata Settings

Configure your metadata providers:

![Metadata Settings](../images/settings-metadata.png)
*Provider configuration*

For each provider:
- **Enable/Disable** — Toggle usage
- **API Key** — If required
- **Priority** — Search order

**Provider API Keys:**

| Provider | Key Required? |
|----------|--------------|
| Google Books | Optional (higher limits with key) |
| Open Library | No |
| Goodreads | Yes (scraping) |
| Hardcover | Yes |
| Amazon | Yes (PAAPI) |
| Comic Vine | Yes |

### OPDS Settings

![OPDS Settings](../images/settings-opds.png)
*E-reader catalog configuration*

| Setting | Description |
|---------|-------------|
| **Enable OPDS** | Turn on/off catalog |
| **Require Auth** | Need login to access |
| **Books Per Page** | Pagination size |
| **Include Read** | Show finished books |

### Import Defaults

![Import Settings](../images/settings-import.png)
*Default behaviors for imports*

| Setting | Options |
|---------|---------|
| **Default Status** | To Read, etc. |
| **Fetch Covers** | On/Off |
| **Fetch Metadata** | On/Off |
| **Create Authors** | Auto-create new |
| **Duplicate Handling** | Skip, Merge, Create |

### User Settings

![User Settings](../images/settings-users.png)
*Registration and role configuration*

| Setting | Description |
|---------|-------------|
| **Allow Registration** | Public signup |
| **Require Invite** | Need invite code |
| **Require Email Verification** | Confirm email |
| **Default Role** | New user role |

### Email Setup

![Email Settings](../images/settings-email.png)
*SMTP configuration*

```
Host:     smtp.example.com
Port:     587
Username: your-email@example.com
Password: ••••••••••
From:     bookshelf@example.com
TLS:      ✓ Enable
```

**Test button** — Send a test email to verify!

### SSO Configuration

![SSO Settings](../images/settings-sso.png)
*OIDC/OAuth setup*

For OIDC providers:

| Field | Description |
|-------|-------------|
| **Client ID** | From your provider |
| **Client Secret** | Keep this secret! |
| **Issuer URL** | Provider's URL |
| **Redirect URI** | Your callback URL |

**Pre-configured providers:**
- Google
- GitHub

**Generic OIDC:**
- Any compliant provider

### AI Settings

![AI Settings](../images/settings-ai.png)
*OpenAI integration*

| Setting | Description |
|---------|-------------|
| **OpenAI API Key** | Your API key |
| **Model** | gpt-4, gpt-3.5-turbo |
| **Max Tokens** | Response length limit |

---

## User Management

Control who uses your BookShelf:

### Viewing Users

![Users List](../images/admin-users-list.png)
*All registered users*

Each user shows:
- Username
- Email
- Role
- Last active
- Books count

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, all settings |
| **Librarian** | Manage books, users |
| **Member** | Own books only |

### Creating Users

1. Click **+ Add User**
2. Fill in details:

![Create User](../images/admin-create-user.png)
*Adding a new user*

3. Set role
4. Send welcome email (optional)

### Editing Users

1. Click a user row
2. Edit modal opens:

![Edit User](../images/admin-edit-user.png)
*Modify user settings*

- Change role
- Reset password
- Disable account

### Disabling vs Deleting

| Action | What Happens |
|--------|--------------|
| **Disable** | Can't login, data preserved |
| **Delete** | Removed, data deleted |

Prefer **Disable** for problematic users — you can re-enable later!

---

## Invite Codes

Control registration with invite codes:

### Creating Codes

![Invite Codes](../images/admin-invite-codes.png)
*Manage registration access*

1. Click **+ New Code**
2. Configure:

| Option | Description |
|--------|-------------|
| **Code** | Auto-generated or custom |
| **Uses** | How many times usable |
| **Expires** | Expiration date |
| **Role** | Role for new users |

### Sharing Codes

Give users the signup URL:
```
https://your-bookshelf.com/auth/signup?code=ABC123
```

Or they can enter the code on the signup page.

### Tracking Usage

See who used each code:
- Total uses
- Remaining uses
- Users created

---

## BookDrop

Automatic ebook importing:

![BookDrop Settings](../images/admin-bookdrop.png)
*Auto-import configuration*

### How BookDrop Works

1. Configure a "watch" folder
2. Drop ebook files into it
3. BookShelf automatically:
   - Detects new files
   - Extracts metadata
   - Creates book entries
   - Moves files to library

### Setup

1. Go to **Admin → BookDrop**
2. Enable BookDrop
3. Set watch folder path:

```
/data/bookdrop
```

### Options

| Option | Description |
|--------|-------------|
| **Watch Folder** | Where to monitor |
| **Auto-Process** | Immediate or manual |
| **Delete After Import** | Remove from watch folder |
| **Default Status** | For imported books |

### Processing Queue

![BookDrop Queue](../images/bookdrop-queue.png)
*Files waiting to be processed*

See pending files:
- Filename
- Status
- Detected metadata
- Actions

### Supported Formats

BookDrop handles:
- `.epub`
- `.pdf`
- `.cbz`

---

## Console (Log Viewer)

See what's happening:

![Admin Console](../images/admin-console.png)
*Application logs*

### Log Levels

| Level | Meaning |
|-------|---------|
| **INFO** | Normal operations |
| **WARN** | Potential issues |
| **ERROR** | Something broke |
| **DEBUG** | Detailed info |

### Filtering Logs

- By level
- By date range
- By keyword

### Common Log Entries

```
INFO: User 'admin' logged in
INFO: Book 'The Hobbit' added by admin
WARN: Metadata provider timeout
ERROR: Database connection failed
```

### Log Files

Logs are stored in:
```
/logs/bookshelf.log
```

Rotated daily with 14-day retention.

---

## Diagnostics

System health checks:

![Diagnostics Page](../images/admin-diagnostics.png)
*System health overview*

### Database Stats

| Stat | Description |
|------|-------------|
| **Books** | Total count |
| **Authors** | Unique authors |
| **File Size** | Database size |
| **Last Vacuum** | Optimization date |

### Storage Usage

| Path | Usage |
|------|-------|
| **Covers** | 150 MB / 500 files |
| **Ebooks** | 2.3 GB / 100 files |
| **Backups** | 50 MB / 10 files |

### Health Checks

| Check | Status |
|-------|--------|
| **Database** | ✅ Connected |
| **File System** | ✅ Writable |
| **Email** | ⚠️ Not configured |
| **OPDS** | ✅ Active |

### Actions

| Action | Purpose |
|--------|---------|
| **Vacuum Database** | Optimize storage |
| **Clear Cache** | Reset cached data |
| **Rebuild Covers** | Regenerate thumbnails |
| **Test Email** | Verify SMTP |

---

## Backup & Restore

### Creating Backups

![Backup Interface](../images/admin-backup.png)
*Backup your data*

1. Go to **Export → JSON Backup**
2. Click **Download**
3. Save the file safely!

### What's Backed Up

- All database records
- Book metadata
- User accounts
- Settings
- Magic shelves

**Note:** Ebook files and covers are NOT in JSON backup. Backup those folders separately!

### Restoring

1. Go to **Import → JSON Backup**
2. Upload backup file
3. Confirm restoration

⚠️ **Warning:** This replaces all existing data!

### Automated Backups

Set up a cron job:

```bash
# Daily backup at 2 AM
0 2 * * * curl -X POST https://localhost:3000/api/backup
```

---

## Security Best Practices

### Session Secret

Always use a strong, unique secret:
```bash
openssl rand -hex 32
```

### Password Policy

Encourage strong passwords:
- Minimum 8 characters
- Mix of characters

### HTTPS

Always run behind HTTPS in production!

Use a reverse proxy like:
- Nginx
- Caddy
- Traefik

### Regular Updates

Keep BookShelf updated:
```bash
docker pull ghcr.io/iamernie/bookshelfv2:latest
docker-compose up -d
```

### Backup Strategy

- Daily JSON backups
- Weekly file backups
- Off-site storage

---

## Troubleshooting

### "Database locked"

SQLite can lock during writes:
- Wait and retry
- Restart the container
- Check disk space

### "Permission denied" on files

Fix with PUID/PGID:
```bash
PUID=1000
PGID=1000
```

Match your host user!

### Email not sending

1. Check SMTP settings
2. Use the Test button
3. Check spam folder
4. Verify credentials

### SSO not working

1. Verify redirect URI exactly matches
2. Check client ID/secret
3. Ensure provider is configured correctly

### High memory usage

- Large libraries may use more RAM
- Consider increasing container limits
- Vacuum the database

---

## Admin Cheat Sheet

### Quick Commands

```bash
# View logs
docker logs bookshelf-v2 --tail 100

# Restart
docker restart bookshelf-v2

# Shell access
docker exec -it bookshelf-v2 /bin/sh

# Reset admin password
docker exec -it bookshelf-v2 node scripts/reset-password.js admin newpassword
```

### Important Paths

| Path | Purpose |
|------|---------|
| `/data` | Database, backups |
| `/logs` | Application logs |
| `/app/static/covers` | Cover images |
| `/app/static/ebooks` | Ebook files |

### Quick Health Check

```bash
curl http://localhost:3000/health
```

Should return:
```json
{"status": "ok"}
```

---

<div align="center">

**[← OPDS & Integrations](./opds-integrations.md)** | **[Index](./index.md)**

</div>
