# API Overview

BookShelf V2 provides a RESTful API for programmatic access to your library.

## Base URL

```
http://your-server:3000/api
```

## Authentication

All API requests require authentication using session cookies or API keys.

### Session Authentication

Login via the web interface, then use the session cookie:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "yourpassword"}' \
  -c cookies.txt

# Use cookie in subsequent requests
curl http://localhost:3000/api/books \
  -b cookies.txt
```

### API Key Authentication

Generate an API key in **Settings → API Keys**, then use it in requests:

```bash
curl http://localhost:3000/api/books \
  -H "Authorization: Bearer your-api-key"
```

## Response Format

All responses are JSON:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

- **Authenticated**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour

Headers indicate your limit status:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1640000000
```

## Available Endpoints

### Books
- `GET /api/books` - List all books
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Add a new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Collections
- `GET /api/collections` - List collections
- `POST /api/collections` - Create collection
- `GET /api/collections/:id/books` - Get books in collection

### Reading Sessions
- `GET /api/reading-sessions` - List reading sessions
- `POST /api/reading-sessions` - Log a reading session
- `GET /api/reading-sessions/stats` - Get reading statistics

### Search
- `GET /api/search?q=query` - Search books
- `GET /api/search/metadata?isbn=...` - Search external metadata

## Pagination

Paginated endpoints accept these parameters:

```bash
GET /api/books?page=1&limit=20&sort=title&order=asc
```

Response includes pagination info:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Examples

### Get All Books

```bash
curl http://localhost:3000/api/books \
  -H "Authorization: Bearer your-api-key"
```

### Add a Book

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "isbn": "9780547928227",
    "status": "to-read"
  }'
```

### Search Books

```bash
curl "http://localhost:3000/api/search?q=tolkien" \
  -H "Authorization: Bearer your-api-key"
```

## API Documentation

Full interactive API documentation is available via Swagger UI:

**http://your-server:3000/api/docs**

Explore all endpoints, test requests, and view response schemas.

## Client Libraries

Official client libraries (coming soon):
- JavaScript/TypeScript
- Python
- Go

## Detailed References

- [Authentication](/api/authentication)
- [Books Endpoint](/api/books)
- [Collections Endpoint](/api/collections)
- [Reading Sessions Endpoint](/api/reading-sessions)

## Webhooks

Webhooks are planned for future releases to notify external systems of events:
- Book added
- Reading session completed
- Goal achieved
