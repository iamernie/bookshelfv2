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

Welcome, brave bibliophile! In just a few minutes, you'll have your very own book management kingdom up and running. Let's do this!

---

## Installation Options

Choose your own adventure:

| Method | Best For | Difficulty |
|--------|----------|------------|
| [Docker (Recommended)](#docker-recommended) | Most users | Easy |
| [Docker Compose](#docker-compose) | Power users | Easy |
| [Manual Installation](#manual-installation) | Developers | Moderate |

---

## Docker (Recommended)

The quickest path to bookish bliss!

### Step 1: Pull the Image

```bash
docker pull ghcr.io/iamernie/bookshelfv2:latest
```

### Step 2: Generate a Secret Key

```bash
# This is your session secret - keep it safe!
openssl rand -hex 32
```

Copy that output. You'll need it.

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

![First Time Setup](../images/first-time-setup.png)
*The first-time setup screen — where legends are born*

---

## Docker Compose

For those who like their configuration in a nice, tidy file:

### Step 1: Create Your Config

Create a new directory and add these files:

**docker-compose.yml:**
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
      - DATABASE_PATH=/data/bookshelf.sqlite
      - LOG_DIR=/logs
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

**.env:**
```bash
# Generate with: openssl rand -hex 32
SESSION_SECRET=your-super-secret-key-here

# Your server's URL
ORIGIN=http://localhost:3000

# Match your host user (run 'id' to find these)
PUID=1000
PGID=1000
```

### Step 2: Launch!

```bash
docker-compose up -d
```

### Step 3: Check the Logs (Optional)

```bash
docker-compose logs -f bookshelf
```

You should see something like:
```
bookshelf-v2  | 🚀 BookShelf V2 starting...
bookshelf-v2  | ✅ Database connected
bookshelf-v2  | 📚 Server running at http://0.0.0.0:3000
```

---

## Manual Installation

For developers and the terminally curious:

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/iamernie/BookShelfV2.git
cd BookShelfV2
```

### Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:
```bash
SESSION_SECRET=generate-a-random-string-here
ORIGIN=http://localhost:3000
```

### Step 4: Initialize the Database

```bash
npm run db:push
```

### Step 5: Build and Run

```bash
npm run build
npm run preview
```

Or for development with hot reload:
```bash
npm run dev
```

---

## First-Time Setup

When you first access BookShelf, you'll be greeted by the setup wizard:

### Create Your Admin Account

![Create Admin Account](../images/setup-admin-account.png)
*Choose your username wisely — this is your library card for life!*

1. **Username**: Your login name (letters, numbers, underscores)
2. **Email**: For password recovery (if you set up email later)
3. **Password**: Make it strong! We don't want book thieves getting in

### Initial Configuration

After creating your account, you'll land on the dashboard:

![Empty Dashboard](../images/empty-dashboard.png)
*Your library awaits! Time to add some books.*

---

## Adding Your First Book

Let's break in that new library card!

### Quick Add: The Fast Path

1. Click the **+ Add Book** button in the top navigation

![Add Book Button](../images/add-book-button.png)
*The button that starts your collection*

2. Start typing the title...

![Metadata Search](../images/metadata-search-modal.png)
*BookShelf searches 6 sources to find your book's info*

3. Select your book from the results

4. Click **Add to Library**

That's it! BookShelf automatically fetches:
- Cover image
- Author info
- Publication details
- Description
- Page count
- ISBN

### Manual Add: Full Control

Sometimes you need to add a book that's not in any database (that rare first edition from a local author, perhaps?):

1. Click **+ Add Book**
2. Click **Add Manually** tab

![Manual Add Form](../images/manual-add-book.png)
*All the fields, ready for your input*

3. Fill in whatever info you have
4. Click **Add Book**

---

## What's Next?

You're officially set up! Here's where to go from here:

### Essential Reading (pun intended)

- **[Managing Your Library](./managing-books.md)** — Learn all the ways to organize your books
- **[Reading Goals](./goals-and-stats.md)** — Set up your first reading challenge

### Power User Paths

- **[Import Your Library](./import-export.md)** — Bring in data from Goodreads, Audible, or CSV
- **[Magic Shelves](./magic-shelves.md)** — Create smart collections that organize themselves

### Admin Territory

- **[Configure Email](./admin-guide.md#email-setup)** — For password recovery
- **[Set Up SSO](./admin-guide.md#sso-configuration)** — If you're using Google/GitHub login

---

## Troubleshooting

### Container Won't Start?

Check your SESSION_SECRET is set:
```bash
docker logs bookshelf-v2
```

### Can't Access the Web UI?

1. Verify the container is running: `docker ps`
2. Check the port isn't blocked: `curl http://localhost:3000`
3. Make sure ORIGIN matches your access URL

### Database Errors?

```bash
# Inside the container
docker exec -it bookshelf-v2 /bin/sh
npm run db:push
```

### Still Stuck?

- Check the [GitHub Issues](https://github.com/iamernie/BookShelfV2/issues)
- Look at recent logs: `docker logs --tail 100 bookshelf-v2`

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SESSION_SECRET` | Yes | - | Session encryption key |
| `ORIGIN` | Yes* | - | Full URL (http://localhost:3000) |
| `PORT` | No | 3000 | Server port |
| `DATABASE_PATH` | No | ./data/database.sqlite | SQLite file location |
| `LOG_DIR` | No | ./logs | Log file directory |
| `PUID` | No | 1000 | User ID for file ownership |
| `PGID` | No | 1000 | Group ID for file ownership |

*Required in production

---

<div align="center">

**[← Back to Index](./index.md)** | **[Next: Managing Your Library →](./managing-books.md)**

</div>
