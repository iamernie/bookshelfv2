# Admin Guide

## Chapter 8: The Librarian's Control Room

```
    🔐 ════════════════════════════════════ 🔐
    ║   Settings • Users • BookDrop         ║
    🔐 ════════════════════════════════════ 🔐
```

Welcome, Administrator! Here's where you configure everything.

---

## Accessing Admin

Click your profile → **Admin**, or go to `/admin`.

Only users with **Admin** role can access.

---

## Settings Overview

![Admin Settings](../images/admin-settings.png)
*All configuration in one place*

| Tab | Purpose |
|-----|---------|
| **General** | App name, public catalog |
| **Storage** | File paths, limits |
| **Metadata** | Provider configuration |
| **OPDS** | E-reader catalog |
| **Import** | Default import options |
| **Users** | Registration settings |
| **Email** | SMTP configuration |
| **SSO** | OIDC/OAuth login |
| **AI** | OpenAI integration |

---

## User Management

![Admin Users](../images/admin-users.png)
*Manage who uses BookShelf*

### Roles

| Role | Access |
|------|--------|
| **Admin** | Full access |
| **Librarian** | Manage books & users |
| **Member** | Own books only |

### Actions

- **Create** — Add new users
- **Edit** — Change roles, reset passwords
- **Disable** — Block login (preserves data)
- **Delete** — Remove completely

---

## Invite Codes

Control registration:

1. Create codes with limited uses
2. Set expiration dates
3. Share: `your-bookshelf.com/auth/signup?code=ABC123`

---

## BookDrop

Automatic ebook importing:

![BookDrop](../images/admin-bookdrop.png)
*Auto-import configuration*

1. Enable BookDrop
2. Set watch folder (e.g., `/data/bookdrop`)
3. Drop ebook files in
4. BookShelf imports automatically!

**Supported:** `.epub`, `.pdf`, `.cbz`

---

## Backup & Restore

### Backup

1. **Export → JSON Backup**
2. Download the file
3. Store safely!

**Also backup:** `/app/static/covers` and `/app/static/ebooks`

### Restore

1. **Import → JSON Backup**
2. Upload your backup
3. Done!

---

## Quick Commands

```bash
# View logs
docker logs bookshelf-v2 --tail 100

# Restart
docker restart bookshelf-v2

# Shell access
docker exec -it bookshelf-v2 /bin/sh

# Reset password
docker exec -it bookshelf-v2 node scripts/reset-password.js admin newpassword

# Health check
curl http://localhost:3000/health
```

---

## Important Paths

| Path | Purpose |
|------|---------|
| `/data` | Database, backups |
| `/logs` | Application logs |
| `/app/static/covers` | Cover images |
| `/app/static/ebooks` | Ebook files |

---

## Security Tips

1. **Strong SESSION_SECRET** — Use `openssl rand -hex 32`
2. **HTTPS in production** — Use a reverse proxy (Nginx, Caddy)
3. **Regular backups** — Daily JSON + weekly file backups
4. **Keep updated** — `docker pull ghcr.io/iamernie/bookshelfv2:latest`

---

<div align="center">

**[← OPDS & Integrations](./opds-integrations.md)** | **[Index](./index.md)**

</div>
