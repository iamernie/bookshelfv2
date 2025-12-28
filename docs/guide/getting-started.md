# Getting Started

## Chapter 1: Your Journey Begins Here

```
     ___________
    /          /|
   /__________/ |
   |  📚     | |
   | BookShelf| |
   |    V2   | /
   |_________|/
```

Welcome, brave bibliophile! In just a few minutes, you'll have your very own book management kingdom up and running.

---

## Installation Options

| Method | Best For | Difficulty |
|--------|----------|------------|
| [Docker (Recommended)](#docker-recommended) | Most users | Easy |
| [Docker Compose](#docker-compose) | Power users | Easy |
| [Manual Installation](#manual-installation) | Developers | Moderate |

---

## Docker (Recommended)

### Step 1: Pull the Image

```bash
docker pull ghcr.io/iamernie/bookshelfv2:latest
```

### Step 2: Generate a Secret Key

```bash
openssl rand -hex 32
```

### Step 3: Run the Container

```bash
docker run -d \
  --name bookshelf-v2 \
  -p 3000:3000 \
  -e SESSION_SECRET=your-generated-secret-here \
  -e ORIGIN=http://localhost:3000 \
  -v bookshelf_data:/data \
  -v bookshelf_logs:/logs \
  -v bookshelf_covers:/app/static/covers \
  -v bookshelf_ebooks:/app/static/ebooks \
  ghcr.io/iamernie/bookshelfv2:latest
```

### Step 4: Open the Gates!

Navigate to `http://localhost:3000` in your browser.

---

## Docker Compose

Create a `docker-compose.yml`:

```yaml
services:
  bookshelf:
    image: ghcr.io/iamernie/bookshelfv2:latest
    container_name: bookshelf-v2
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - SESSION_SECRET=${SESSION_SECRET}
      - ORIGIN=${ORIGIN:-http://localhost:3000}
      - PUID=${PUID:-1000}
      - PGID=${PGID:-1000}
    volumes:
      - bookshelf_data:/data
      - bookshelf_logs:/logs
      - bookshelf_covers:/app/static/covers
      - bookshelf_ebooks:/app/static/ebooks

volumes:
  bookshelf_data:
  bookshelf_logs:
  bookshelf_covers:
  bookshelf_ebooks:
```

And a `.env` file:

```bash
SESSION_SECRET=your-super-secret-key-here
ORIGIN=http://localhost:3000
PUID=1000
PGID=1000
```

Then run:

```bash
docker-compose up -d
```

---

## Manual Installation

### Prerequisites

- Node.js 18+
- npm or pnpm

### Steps

```bash
# Clone
git clone https://github.com/iamernie/BookShelfV2.git
cd BookShelfV2

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your settings

# Initialize database
npm run db:push

# Build and run
npm run build
npm run preview
```

---

## First-Time Setup

When you first access BookShelf, you'll create your admin account:

![First Time Setup](../images/first-setup.png)
*Create your admin account to get started*

1. **Username**: Your login name
2. **Email**: For password recovery
3. **Password**: Make it strong!

---

## Adding Your First Book

1. Click **+ Add Book** in the navigation
2. Start typing the title or ISBN
3. Select from the search results
4. Click **Add to Library**

![Add Book Search](../images/add-book-search.png)
*BookShelf searches 6 metadata sources for you*

That's it! Cover, author, and details are fetched automatically.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SESSION_SECRET` | Yes | - | Session encryption key |
| `ORIGIN` | Yes* | - | Full URL (http://localhost:3000) |
| `PORT` | No | 3000 | Server port |
| `DATABASE_PATH` | No | ./data/database.sqlite | SQLite location |
| `PUID` | No | 1000 | User ID for file ownership |
| `PGID` | No | 1000 | Group ID for file ownership |

---

## What's Next?

- **[Managing Your Library](./managing-books.md)** — Learn all the ways to organize
- **[Import Your Data](./import-export.md)** — Bring in your Goodreads library

---

<div align="center">

**[← Back to Index](./index.md)** | **[Next: Managing Your Library →](./managing-books.md)**

</div>
