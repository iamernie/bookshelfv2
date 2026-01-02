# Installation

There are two main ways to install BookShelf V2: Docker (recommended) or local development setup.

## Docker Installation (Recommended)

The easiest and most reliable way to run BookShelf.

### Step 1: Create Directory

```bash
mkdir bookshelf && cd bookshelf
```

### Step 2: Download Docker Compose File

```bash
curl -O https://raw.githubusercontent.com/yourusername/BookShelfV2/main/docker-compose.yml
```

Or create `docker-compose.yml` manually:

```yaml
version: '3.8'

services:
  bookshelf:
    image: ghcr.io/yourusername/bookshelf-v2:latest
    container_name: bookshelf
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
      - ./logs:/logs
      - ./covers:/app/static/covers
      - ./ebooks:/app/static/ebooks
      - ./bookdrop:/app/bookdrop
    environment:
      - SESSION_SECRET=${SESSION_SECRET}
      - ORIGIN=${ORIGIN}
      - PORT=3000
      - PUID=${PUID}
      - PGID=${PGID}
    restart: unless-stopped
```

### Step 3: Create Environment File

```bash
cat > .env << EOF
SESSION_SECRET=$(openssl rand -hex 32)
ORIGIN=http://localhost:3000
PUID=$(id -u)
PGID=$(id -g)
EOF
```

### Step 4: Start BookShelf

```bash
docker compose up -d
```

### Step 5: Access BookShelf

Open your browser to **http://localhost:3000**

The setup wizard will guide you through creating your admin account.

## Local Development Installation

For developers who want to contribute or customize BookShelf.

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/BookShelfV2.git
cd BookShelfV2
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
SESSION_SECRET=your-random-secret-here
ORIGIN=http://localhost:5173
PORT=5173
DATABASE_PATH=./database.sqlite
```

### Step 4: Start Development Server

```bash
npm run dev
```

Visit **http://localhost:5173**

## Verifying Installation

After installation, you should:

1. See the setup wizard on first visit
2. Be able to create an admin account
3. Access the main library interface

## Troubleshooting

### Docker: Permission Issues

If you see file permission errors:

```bash
# Find your user/group ID
id -u  # Returns PUID
id -g  # Returns PGID

# Update .env with these values
PUID=1000
PGID=1000
```

### Docker: Port Already in Use

Change the port in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Use 3001 instead
```

Update `ORIGIN` in `.env`:
```bash
ORIGIN=http://localhost:3001
```

### Local: Database Errors

Ensure SQLite3 is installed:

```bash
# Ubuntu/Debian
sudo apt-get install sqlite3

# macOS
brew install sqlite3
```

## Next Steps

- [Configuration](/guide/configuration) - Customize your setup
- [Managing Books](/guide/managing-books) - Add your first books
- [Docker Setup](/guide/docker) - Advanced Docker configuration
