# BookShelf V2

**Your personal book library, beautifully organized.**

BookShelf is a self-hosted web app for book lovers who want to track their reading, organize their digital library, and discover patterns in their reading habits. Think of it as your cozy digital bookshelf that lives on your own server.

---

## What Can It Do?

### Organize Your Collection
- Add books manually or import from Goodreads, Audible, or CSV
- Organize with **tags**, **shelves**, and **series** tracking
- Create **Smart Collections** that auto-populate based on rules you set

### Read Your Ebooks
- Built-in reader for **EPUB**, **PDF**, and **CBZ/comics**
- Themes, zoom, bookmarks, and progress sync across devices
- Your reading position is always saved

### Track Your Reading
- Set **reading goals**: books per year, pages per month, genres to explore
- See your **reading heatmap** (like GitHub's contribution graph, but for books!)
- Watch your reading streaks grow

### Fetch Metadata Automatically
- Pull book details from **Google Books**, **Open Library**, **Goodreads**, and **Hardcover**
- Grab author bios from **Wikipedia**
- Cover images, descriptions, page counts - all fetched for you

### More Goodies
- **OPDS catalog** for e-reader apps like Calibre, KOReader, Moon+ Reader
- **BookDrop** folder watching - drop files in a folder, they appear in your library
- **Public Library** for bulk imports and shared collections
- **Multi-user** with admin/member roles
- **Dark mode** because of course

---

## Quick Start (Docker)

The easiest way to run BookShelf:

```bash
# 1. Create a directory for BookShelf
mkdir bookshelf && cd bookshelf

# 2. Download the compose file
curl -O https://raw.githubusercontent.com/iamernie/BookShelfV2/main/docker-compose.yml

# 3. Create your .env file
cat > .env << EOF
SESSION_SECRET=$(openssl rand -hex 32)
ORIGIN=http://localhost:3000
PUID=$(id -u)
PGID=$(id -g)
EOF

# 4. Start it up!
docker compose up -d
```

Open **http://localhost:3000** and create your account.

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SESSION_SECRET` | Yes | - | Random string for session encryption |
| `ORIGIN` | Yes | `http://localhost:3000` | Your server URL |
| `PORT` | No | `3000` | Server port |
| `PUID` / `PGID` | No | `1000` | User/group ID for file permissions |

**Tip:** Run `id` to find your UID/GID for proper file permissions.

### Volumes

BookShelf stores data in these locations:

| Volume | Purpose |
|--------|---------|
| `/data` | SQLite database |
| `/logs` | Application logs |
| `/app/static/covers` | Book cover images |
| `/app/static/ebooks` | Uploaded ebook files |

---

## Running Locally (Development)

```bash
# Clone and install
git clone https://github.com/iamernie/BookShelfV2.git
cd BookShelfV2
npm install

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

Visit **http://localhost:5173** (Vite's default port).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | SvelteKit 2, Svelte 5, TailwindCSS |
| Backend | SvelteKit API routes |
| Database | SQLite + Drizzle ORM |
| Ebook Reader | epub.js, PDF.js, JSZip |
| Deployment | Docker, GitHub Actions |

---

## Screenshots

*Coming soon!*

---

## Migrating from V1?

V2 is a complete rewrite with a fresh database schema. We're working on a migration tool - stay tuned!

---

## Contributing

Found a bug? Have a feature idea? Open an issue or PR!

Check out [docs/ROADMAP.md](docs/ROADMAP.md) for planned features and what's in progress.

---

## License

MIT - Do what you want, just don't blame me if it eats your homework.

---

**Happy reading!**
