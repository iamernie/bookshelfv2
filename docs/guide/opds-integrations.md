# OPDS & Integrations

## Chapter 7: Connecting Your Book Universe

```
    ┌─────────────────────────────────────────┐
    │     📱 E-READERS   🔗 APPS   🌐 WEB    │
    │  ─────────────────────────────────────  │
    │                                         │
    │   BookShelf connects to everything!    │
    │                                         │
    └─────────────────────────────────────────┘
```

BookShelf doesn't live in isolation. Connect your e-reader, embed widgets on your blog, and integrate with other tools!

---

## OPDS Catalog

### What is OPDS?

**O**pen **P**ublication **D**istribution **S**ystem — a fancy way of saying "your e-reader can browse your BookShelf library!"

Compatible apps include:
- **Calibre** (desktop)
- **KOReader** (e-ink devices)
- **Moon+ Reader** (Android)
- **Marvin** (iOS)
- **PocketBook** readers
- **Kobo** (with KOReader)
- **Aldiko** (Android)

### Enabling OPDS

1. Go to **Admin → Settings → OPDS**

![OPDS Settings](../images/opds-settings.png)
*Configure your OPDS feed*

2. Toggle **Enable OPDS**
3. Optionally set authentication
4. Copy your OPDS URL

### Your OPDS URL

```
https://your-bookshelf.com/opds
```

Or with authentication:
```
https://username:password@your-bookshelf.com/opds
```

### Connecting Calibre

The most popular desktop book manager:

1. Open Calibre
2. Click **Connect/Share → Get Books**
3. Add new catalog

![Calibre OPDS Setup](../images/calibre-opds-setup.png)
*Adding BookShelf to Calibre*

4. Enter your OPDS URL
5. Browse and download!

### Connecting KOReader

For Kindle/Kobo with KOReader:

1. Open KOReader
2. Go to **OPDS catalog**
3. Add new catalog

![KOReader OPDS](../images/koreader-opds.png)
*KOReader catalog setup*

4. Enter your BookShelf OPDS URL
5. Browse your library on your e-reader!

### Connecting Moon+ Reader

For Android:

1. Open Moon+ Reader
2. Menu → **Net Library**
3. Add OPDS catalog
4. Enter your URL

### OPDS Features

What you can do:

| Feature | Description |
|---------|-------------|
| **Browse** | Navigate by author, series, genre |
| **Search** | Find books across your library |
| **Download** | Get ebooks directly to device |
| **Covers** | View cover images |
| **Metadata** | See book details |

### OPDS Catalog Structure

Your OPDS feed provides:

```
/opds
├── /new          → Recently added
├── /authors      → Browse by author
├── /series       → Browse by series
├── /genres       → Browse by genre
├── /search       → Search endpoint
└── /book/[id]    → Individual book details
```

---

## Public Catalog

Share your reading without admin access:

![Public Catalog](../images/public-catalog.png)
*A beautiful public view of your library*

### Enabling Public Catalog

1. **Admin → Settings → General**
2. Toggle **Public Catalog**
3. Configure visibility

### Catalog URL

```
https://your-bookshelf.com/catalog
```

### What's Visible

| Element | Public? |
|---------|---------|
| Book covers | ✅ |
| Titles & Authors | ✅ |
| Your ratings | Optional |
| Private notes | ❌ Never |
| Ebook downloads | Optional |

### Public Shelves

Share specific collections:

1. Edit a Magic Shelf
2. Enable **Public**
3. Share the URL

```
https://your-bookshelf.com/catalog/shelf/favorites
```

---

## Widgets

Embed your reading on other sites!

### Currently Reading Widget

Show what you're reading on your blog:

![Currently Reading Widget](../images/widget-currently-reading.png)
*Live widget showing current reads*

**Get the code:**

1. Go to **Admin → Widgets**
2. Select **Currently Reading**
3. Copy embed code

```html
<iframe
  src="https://your-bookshelf.com/widget/currently-reading"
  width="300"
  height="400"
  frameborder="0">
</iframe>
```

### Recent Reads Widget

Show your recently finished books:

![Recent Reads Widget](../images/widget-recent-reads.png)
*Your latest completions*

### Reading Goal Widget

Display your yearly progress:

![Reading Goal Widget](../images/widget-reading-goal.png)
*52 books challenge progress*

### Customizing Widgets

Options available:

| Option | Values |
|--------|--------|
| **Theme** | Light, Dark, Auto |
| **Size** | Small, Medium, Large |
| **Count** | Number of books shown |
| **Show Rating** | Yes, No |
| **Show Author** | Yes, No |

---

## Metadata Providers

BookShelf fetches data from 6 sources:

### Google Books

![Google Books Provider](../images/provider-google.png)

- Best for: Modern books, ISBNs
- Data quality: Good
- Speed: Fast

### Open Library

![Open Library Provider](../images/provider-openlibrary.png)

- Best for: Classic literature
- Data quality: Variable
- Speed: Medium

### Goodreads

![Goodreads Provider](../images/provider-goodreads.png)

- Best for: User ratings, reviews
- Data quality: Excellent
- Speed: Medium

### Hardcover

![Hardcover Provider](../images/provider-hardcover.png)

- Best for: Modern releases
- Data quality: Good
- Speed: Fast

### Amazon

![Amazon Provider](../images/provider-amazon.png)

- Best for: Everything, especially ebooks
- Data quality: Excellent
- Speed: Fast

### Comic Vine

![Comic Vine Provider](../images/provider-comicvine.png)

- Best for: Comics, graphic novels
- Data quality: Excellent for comics
- Speed: Medium

### Configuring Providers

1. Go to **Admin → Settings → Metadata**

![Metadata Provider Settings](../images/metadata-provider-settings.png)
*Enable and prioritize providers*

2. Enable/disable providers
3. Set priority order
4. Add API keys if required

### Provider Priority

BookShelf queries providers in order:

1. Tries first provider
2. Falls back to second if no result
3. Continues until match found

Reorder based on your collection type!

---

## Wikipedia Integration

Auto-fetch author biographies:

![Author Wikipedia Bio](../images/author-wikipedia-bio.png)
*Automatically populated author info*

### How It Works

1. Open an author page
2. Click **Fetch from Wikipedia**
3. BookShelf finds the matching article
4. Biography is imported!

### What's Fetched

- Short biography
- Birth/death dates
- Profile image
- Wikipedia link

---

## AI Recommendations

Get smart suggestions using OpenAI:

### Setup

1. Go to **Admin → Settings → AI**
2. Enter your OpenAI API key
3. Save

![AI Settings](../images/ai-settings.png)
*Configure AI integration*

### Using AI Recommendations

1. Navigate to **Recommendations**
2. Click **Get AI Suggestions**
3. Review personalized picks

![AI Recommendations](../images/ai-recommendations-result.png)
*Smart suggestions based on your reading*

### How It Works

BookShelf sends:
- Your top-rated books
- Preferred genres
- Authors you love

AI returns:
- Similar books you might enjoy
- Reasoning for each suggestion

---

## Email Notifications

Set up email for:
- Password reset
- Account verification
- Reading goal reminders

### SMTP Setup

1. **Admin → Settings → Email**

![Email Settings](../images/email-settings.png)
*Configure your mail server*

2. Enter SMTP details:

| Setting | Example |
|---------|---------|
| **Host** | smtp.gmail.com |
| **Port** | 587 |
| **Username** | you@gmail.com |
| **Password** | app-password |
| **From Address** | bookshelf@yourdomain.com |

3. **Test** the connection
4. Save

### Gmail Setup

For Gmail:
1. Enable 2FA on your Google account
2. Create an App Password
3. Use that password (not your regular one)

### Notifications Available

| Notification | Description |
|--------------|-------------|
| **Password Reset** | Reset forgotten passwords |
| **Welcome Email** | New user registration |
| **Goal Reminders** | Reading goal nudges |
| **Weekly Digest** | Reading summary |

---

## SSO / OIDC

Single sign-on with:
- Google
- GitHub
- Keycloak
- Authentik
- Any OIDC provider

### Setup

1. **Admin → Settings → SSO**

![SSO Settings](../images/sso-settings.png)
*Configure OIDC authentication*

2. Enter provider details:
   - Client ID
   - Client Secret
   - Issuer URL
   - Redirect URL

### Google Login

1. Create project in Google Cloud Console
2. Enable OAuth consent screen
3. Create OAuth 2.0 credentials
4. Add to BookShelf settings

### GitHub Login

1. Go to GitHub Developer Settings
2. Create new OAuth App
3. Add credentials to BookShelf

### Generic OIDC

Works with any provider that supports OIDC:
- Keycloak
- Authentik
- Auth0
- Okta

---

## API Access

Build your own integrations:

### API Endpoint

```
https://your-bookshelf.com/api
```

### Documentation

Swagger UI available at:

```
https://your-bookshelf.com/docs
```

![API Docs](../images/api-docs-swagger.png)
*Interactive API documentation*

### Example: Get All Books

```bash
curl https://your-bookshelf.com/api/books \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example: Add a Book

```bash
curl -X POST https://your-bookshelf.com/api/books \
  -H "Content-Type: application/json" \
  -d '{"title": "The Hobbit", "author": "J.R.R. Tolkien"}'
```

### Authentication

API uses session cookies or bearer tokens.

---

## Backup Integrations

### Automatic Backups

Set up scheduled backups:

1. Configure backup path
2. Set schedule (daily/weekly)
3. Backups saved automatically

### Cloud Storage

Sync backups to:
- Dropbox
- Google Drive
- S3
- Any mounted storage

Use a simple cron job:
```bash
0 2 * * * cp /data/backups/* /mnt/backup-drive/
```

---

## Integration Tips

### OPDS Best Practices

- Use authentication for security
- Keep your OPDS URL private
- Works best with direct ebook files attached

### Widget Performance

- Widgets cache data
- Updates every 5 minutes
- Minimal server impact

### Metadata Strategy

- Enable multiple providers
- Set sensible priority
- Save API calls for rare books

---

<div align="center">

**[← Import & Export](./import-export.md)** | **[Index](./index.md)** | **[Next: Admin Guide →](./admin-guide.md)**

</div>
