# Features Overview

BookShelf V2 is packed with features to help you manage, read, and enjoy your book collection.

## Core Features

### 📚 Book Management
- Manual book entry with rich metadata
- Import from Goodreads, Audible, and CSV
- Organize with tags, genres, and series
- Bulk editing and operations
- Advanced search and filtering

### 📖 Built-in Ebook Reader
- Support for EPUB, PDF, and CBZ/CBR formats
- Multiple themes (light, dark, sepia)
- Bookmarks and annotations
- Reading progress automatically saved
- Font size and zoom controls
- Page/chapter navigation

### 🎯 Reading Goals & Challenges
Six types of reading challenges:
1. **Total Books** - Read X books this year
2. **Genre Challenge** - Read from specific genres
3. **Author Challenge** - Discover new authors
4. **Format Goals** - Read audiobooks, ebooks, or physical books
5. **Page Count** - Total pages read
6. **Monthly Targets** - Books per month

Track progress with visual indicators and completion badges.

### 📊 Reading Analytics
- **Reading Heatmap** - GitHub-style contribution graph for reading
- **Statistics Dashboard** - Books read, pages completed, time spent
- **Reading Timeline** - Visual history of your reading journey
- **Top Lists** - Most-read authors, genres, and tags
- **Reading Streaks** - Track consecutive reading days

### 🔍 Metadata & Discovery

#### Automatic Metadata Fetching
Pull book details from 6 providers:
- Google Books
- Open Library
- Goodreads
- Hardcover
- Amazon
- ComicVine (for comics)

#### Author Information
Fetch author biographies from:
- Wikipedia
- Speculative Fiction Fandom (SF Database)

#### Book Discovery
- **Similar Books** - Based on authors, series, and genres
- **AI Recommendations** - OpenAI-powered suggestions
- **Browse by Author/Series/Genre**

### ✨ Smart Collections (Magic Shelves)
Create dynamic collections that auto-populate based on rules:

```
Currently Reading
└─ status = "reading"

Sci-Fi Classics
└─ genre = "Science Fiction" AND published < 1990

Unread Series Books
└─ status = "to-read" AND series != null
```

Supports complex conditions with AND/OR logic.

### 🌐 OPDS Catalog
Access your library from e-reader apps:
- Calibre
- KOReader
- Moon+ Reader
- Marvin
- Chunky (comics)

Feed URL: `http://your-server:3000/opds`

### 📥 BookDrop Auto-Import
Drop ebook files into a watched folder and BookShelf:
1. Automatically detects new files
2. Extracts metadata from the file
3. Attempts to fetch additional metadata
4. Adds to your library

Supports: EPUB, PDF, CBZ, CBR, MOBI

### 👥 Multi-user Support
- Admin and Member roles
- Per-user reading progress
- Shared library or private collections
- Public widgets for embedding stats on blogs

### 🎨 User Interface
- **Dark Mode** - System preference detection
- **Responsive Design** - Desktop and mobile
- **Quick Actions** - Hover over book cards for instant actions
- **Collapsible Sidebar** - More space for your books
- **Keyboard Shortcuts** - Fast navigation

## Feature Status

| Feature | Status |
|---------|--------|
| Ebook Reader (EPUB/PDF/CBZ) | ✅ Stable |
| Reading Progress Tracking | ✅ Stable |
| Reading Goals (6 types) | ✅ Stable |
| Reading Heatmap | ✅ Stable |
| Smart Collections | ✅ Stable |
| Metadata Providers (6 sources) | ✅ Stable |
| Author Wikipedia Fetch | ✅ Stable |
| Similar Books | ✅ Stable |
| AI Recommendations | ✅ Stable |
| OPDS Catalog | ✅ Stable |
| BookDrop Auto-Import | ✅ Stable |
| Public Library | ✅ Stable |
| Public Widgets | ✅ Stable |
| Multi-user | ✅ Stable |
| Dark Theme | ✅ Stable |

## Coming Soon

See our [Roadmap](https://github.com/yourusername/BookShelfV2/blob/main/ROADMAP.md) for planned features:
- Catalog Manager with ISBN scanner
- File naming pattern customization
- KOReader sync integration
- Enhanced statistics and insights

## Explore Features

Learn more about specific features:
- [Smart Collections](/features/smart-collections)
- [Reading Goals](/features/reading-goals)
- [Metadata Providers](/features/metadata)
- [OPDS Catalog](/features/opds)
- [BookDrop](/features/bookdrop)
- [AI Recommendations](/features/ai-recommendations)
