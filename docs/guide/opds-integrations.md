# OPDS & Integrations

## Chapter 7: Connecting Your Book Universe

```
    ┌─────────────────────────────────────────┐
    │     📱 E-READERS   🔗 APPS   🌐 WEB    │
    └─────────────────────────────────────────┘
```

Connect your e-reader, fetch metadata, and integrate with other tools.

---

## OPDS Catalog

### What is OPDS?

A standard that lets e-readers browse your library!

**Compatible Apps:**
- Calibre (desktop)
- KOReader (e-ink)
- Moon+ Reader (Android)
- PocketBook readers

### Setup

1. **Admin → Settings → OPDS**
2. Toggle **Enable OPDS**
3. Copy your URL: `https://your-bookshelf.com/opds`

![OPDS Settings](../images/opds-settings.png)
*Configure your catalog*

### Connecting KOReader

1. Open KOReader → OPDS catalog
2. Add new catalog
3. Enter your BookShelf OPDS URL
4. Browse and download!

---

## Metadata Providers

BookShelf fetches book info from **6 sources**:

| Provider | Best For |
|----------|----------|
| **Google Books** | Modern books, ISBNs |
| **Open Library** | Classic literature |
| **Goodreads** | User ratings |
| **Hardcover** | New releases |
| **Amazon** | Everything |
| **Comic Vine** | Comics |

Configure in **Admin → Settings → Metadata**.

---

## Wikipedia Integration

Auto-fetch author biographies:

1. Open an author page
2. Click **Fetch from Wikipedia**
3. Bio, dates, and photo imported!

---

## AI Recommendations

Get smart suggestions using OpenAI:

1. **Admin → Settings → AI** — Add API key
2. Go to **Recommendations**
3. Click **Get AI Suggestions**
4. Receive personalized picks based on your reading!

---

## Email Notifications

Set up for password reset and notifications:

1. **Admin → Settings → Email**

![Email Settings](../images/email-settings.png)
*SMTP configuration*

2. Enter SMTP details (host, port, credentials)
3. Test the connection
4. Save

---

## SSO / Single Sign-On

Login with Google, GitHub, or any OIDC provider:

1. **Admin → Settings → SSO**
2. Enter Client ID and Secret from your provider
3. Configure redirect URL
4. Users can now login with their existing accounts!

---

## API Access

Build your own integrations:

**Endpoint:** `https://your-bookshelf.com/api`

**Swagger Docs:** `https://your-bookshelf.com/docs`

Example:
```bash
curl https://your-bookshelf.com/api/books
```

---

<div align="center">

**[← Import & Export](./import-export.md)** | **[Index](./index.md)** | **[Next: Admin Guide →](./admin-guide.md)**

</div>
