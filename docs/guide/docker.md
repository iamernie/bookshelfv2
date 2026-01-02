# Docker Setup

Advanced Docker configuration and deployment options for BookShelf.

## Basic Docker Compose

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

## Advanced Configuration

### Using Bind Mounts

Map specific directories for better control:

```yaml
volumes:
  # Database
  - /path/to/data:/data
  
  # Logs
  - /path/to/logs:/logs
  
  # Static content
  - /path/to/covers:/app/static/covers
  - /path/to/ebooks:/app/static/ebooks
  
  # BookDrop auto-import
  - /path/to/bookdrop:/app/bookdrop
```

### Using Docker Volumes

For managed volumes:

```yaml
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

## Environment Variables

Complete `.env` example:

```bash
# Required
SESSION_SECRET=your-random-secret-here
ORIGIN=http://localhost:3000

# Optional
PORT=3000
DATABASE_PATH=/data/bookshelf.sqlite
LOG_LEVEL=info
NODE_ENV=production

# File Permissions (Docker)
PUID=1000
PGID=1000

# Features
OPENAI_API_KEY=sk-your-key-here

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Reverse Proxy Setup

### Nginx

```nginx
server {
    listen 80;
    server_name books.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name books.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    client_max_body_size 100M;  # For large ebook uploads
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Update `ORIGIN` in `.env`:
```bash
ORIGIN=https://books.example.com
```

### Caddy

```caddy
books.example.com {
    reverse_proxy localhost:3000
    
    # Automatic HTTPS
    tls {
        email your-email@example.com
    }
}
```

### Traefik

```yaml
services:
  bookshelf:
    image: ghcr.io/yourusername/bookshelf-v2:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.bookshelf.rule=Host(`books.example.com`)"
      - "traefik.http.routers.bookshelf.entrypoints=websecure"
      - "traefik.http.routers.bookshelf.tls.certresolver=letsencrypt"
      - "traefik.http.services.bookshelf.loadbalancer.server.port=3000"
```

## Health Checks

Add health check to Docker Compose:

```yaml
services:
  bookshelf:
    # ... other config
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Resource Limits

Limit container resources:

```yaml
services:
  bookshelf:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Backup and Restore

### Backup

```bash
# Stop container
docker compose down

# Backup data
tar -czf bookshelf-backup-$(date +%Y%m%d).tar.gz \
  data/ logs/ covers/ ebooks/

# Restart
docker compose up -d
```

### Restore

```bash
# Stop container
docker compose down

# Extract backup
tar -xzf bookshelf-backup-20240101.tar.gz

# Restart
docker compose up -d
```

## Updating BookShelf

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d

# View logs
docker compose logs -f bookshelf
```

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker compose logs bookshelf
```

### Permission Issues

Fix file ownership:
```bash
sudo chown -R 1000:1000 data/ logs/ covers/ ebooks/
```

Or set PUID/PGID in `.env`:
```bash
PUID=$(id -u)
PGID=$(id -g)
```

### Database Locked

Stop container and check for stale locks:
```bash
docker compose down
rm data/*.sqlite-wal
rm data/*.sqlite-shm
docker compose up -d
```

### High Memory Usage

Reduce cover quality in settings or limit container memory:
```yaml
deploy:
  resources:
    limits:
      memory: 1G
```

## Next Steps

- [Configuration](/guide/configuration) - Environment variables
- [Managing Books](/guide/managing-books) - Using BookShelf
- [Multi-user Setup](/guide/multi-user) - Add users
