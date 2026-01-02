# Configuration

BookShelf can be configured through environment variables and application settings.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SESSION_SECRET` | Random string for session encryption (32+ chars) | `abc123...` |
| `ORIGIN` | Your server's URL | `http://localhost:3000` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DATABASE_PATH` | `/data/bookshelf.sqlite` | SQLite database location |
| `PUID` | `1000` | User ID for file permissions (Docker) |
| `PGID` | `1000` | Group ID for file permissions (Docker) |
| `OPENAI_API_KEY` | - | OpenAI API key for AI recommendations |
| `LOG_LEVEL` | `info` | Log level: `error`, `warn`, `info`, `debug` |
| `NODE_ENV` | `production` | Environment: `development` or `production` |

### Generating SESSION_SECRET

```bash
# Linux/macOS
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Online
# Visit: https://generate-secret.vercel.app/32
```

## Application Settings

After installation, configure these in the web UI:

### Admin Console

Access via **Settings → Admin Console**

#### General Settings
- **Site Name**: Customize the application name
- **Public Access**: Allow unauthenticated users to browse
- **Registration**: Enable/disable new user registration

#### Library Settings
- **Default View**: Grid or list view
- **Books Per Page**: Pagination size
- **Cover Quality**: Low, medium, or high resolution
- **Auto-fetch Metadata**: Automatically fetch book details

#### Reading Goals
- **Default Goal Type**: Books per year, pages per month, etc.
- **Goal Period**: Annual, monthly, or custom
- **Reminders**: Enable goal reminder emails

## File Locations

### Docker Volumes

| Volume | Purpose | Recommended Size |
|--------|---------|------------------|
| `/data` | SQLite database | 100MB - 1GB |
| `/logs` | Application logs | 100MB |
| `/app/static/covers` | Book cover images | 500MB - 5GB |
| `/app/static/ebooks` | Ebook files | Based on collection |
| `/app/bookdrop` | Auto-import folder | 1GB+ |

### Local Development

```
project/
├── database.sqlite          # Main database
├── logs/                    # Log files
└── static/
    ├── covers/              # Book covers
    └── ebooks/              # Ebook files
```

## Advanced Configuration

### OpenAI Integration

For AI-powered book recommendations:

1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to `.env`:
   ```bash
   OPENAI_API_KEY=sk-...
   ```
3. Restart BookShelf

### OPDS Catalog

OPDS is automatically enabled at:
- Feed: `http://your-server:3000/opds`
- Authentication: Same as web login

Configure in e-reader apps:
- **URL**: `http://your-server:3000/opds`
- **Username**: Your BookShelf username
- **Password**: Your BookShelf password

### Email Notifications

Configure SMTP in **Admin Console → Email Settings**:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
Use TLS: Yes
Username: your-email@gmail.com
Password: your-app-password
```

### Reverse Proxy

When using nginx/Caddy/Traefik, set `ORIGIN` to your public URL:

```bash
ORIGIN=https://books.yourdomain.com
```

Example nginx config:
```nginx
server {
    listen 443 ssl;
    server_name books.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Next Steps

- [Managing Books](/guide/managing-books) - Add and organize books
- [Docker Setup](/guide/docker) - Advanced Docker configuration
- [Multi-user Setup](/guide/multi-user) - Add additional users
