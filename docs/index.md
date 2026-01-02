---
layout: home

hero:
  name: BookShelf V2
  text: Your personal book library
  tagline: Beautifully organized, self-hosted, and built for book lovers
  image:
    src: /logo.png
    alt: BookShelf V2
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/yourusername/BookShelfV2

features:
  - icon: 📚
    title: Organize Your Collection
    details: Add books manually or import from Goodreads, Audible, or CSV. Organize with tags, genres, and series tracking.
  
  - icon: 📖
    title: Built-in Ebook Reader
    details: Read EPUB, PDF, and CBZ files with themes, bookmarks, and automatic progress sync.
  
  - icon: 🎯
    title: Reading Goals
    details: Set and track 6 types of reading challenges - books per year, genre goals, author challenges, and more.
  
  - icon: 🔍
    title: Smart Metadata
    details: Fetch book details from 6 providers including Google Books, Open Library, Goodreads, and Amazon.
  
  - icon: 🤖
    title: AI Recommendations
    details: Get personalized book suggestions powered by OpenAI based on your reading history.
  
  - icon: 📊
    title: Reading Analytics
    details: Heatmaps, statistics, timelines, and insights into your reading patterns and habits.
  
  - icon: 🌐
    title: OPDS Catalog
    details: Access your library from e-reader apps like Calibre, KOReader, and Moon+ Reader.
  
  - icon: 🎨
    title: Modern Interface
    details: Dark mode, responsive design, quick actions, and a collapsible sidebar for focused reading.
  
  - icon: 👥
    title: Multi-user Support
    details: Admin and member roles, public widgets, and shared collections for the whole family.
---

## Quick Start

:::code-group
```bash [Docker]
mkdir bookshelf && cd bookshelf
curl -O https://raw.githubusercontent.com/yourusername/BookShelfV2/main/docker-compose.yml

cat > .env << EOF
SESSION_SECRET=$(openssl rand -hex 32)
ORIGIN=http://localhost:3000
PUID=$(id -u)
PGID=$(id -g)
EOF

docker compose up -d
```

```bash [NPM]
git clone https://github.com/yourusername/BookShelfV2.git
cd BookShelfV2
npm install
cp .env.example .env
npm run dev
```
:::

Open **http://localhost:3000** and follow the setup wizard!

## What's Inside?

- ✅ **Ebook Reader** (EPUB/PDF/CBZ)
- ✅ **Reading Progress Tracking**
- ✅ **Reading Goals** (6 types)
- ✅ **Reading Heatmap**
- ✅ **Smart Collections**
- ✅ **Metadata Providers** (6 sources)
- ✅ **Similar Books**
- ✅ **AI Recommendations**
- ✅ **OPDS Catalog**
- ✅ **BookDrop Auto-Import**
- ✅ **Multi-user**
- ✅ **Dark Theme**

## Tech Stack

- **Frontend**: SvelteKit 2, Svelte 5 (runes), TailwindCSS
- **Backend**: SvelteKit API routes
- **Database**: SQLite + Drizzle ORM
- **Ebook Reader**: epub.js, PDF.js, JSZip
- **Deployment**: Docker, GitHub Actions
