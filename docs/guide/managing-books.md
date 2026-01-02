# Managing Books

Learn how to add, organize, and manage your book collection.

## Adding Books

### Manual Entry

1. Click **Add Book** button
2. Fill in book details:
   - Title (required)
   - Author(s)
   - ISBN
   - Publication date
   - Description
   - Status (to-read, reading, completed)
3. Click **Save**

### Import from File

Upload ebook files (EPUB, PDF, CBZ):
1. Click **Import → Upload Files**
2. Select files from your computer
3. BookShelf extracts metadata automatically
4. Review and confirm import

### BookDrop Auto-Import

Drop files into the BookDrop folder for automatic import:
1. Enable BookDrop in **Settings**
2. Drop ebook files into `/app/bookdrop` (Docker) or `./bookdrop` (local)
3. Files are processed within 30 seconds
4. Imported books appear in your library

### Import from Services

#### Goodreads Import
1. Export your Goodreads library (CSV)
2. Click **Import → Goodreads**
3. Upload CSV file
4. Map fields and import

#### Audible Import
1. Export Audible library
2. Click **Import → Audible**
3. Upload and import

## Organizing Books

### Tags
Add custom tags to categorize books:
- Click book → **Edit → Tags**
- Create new tags or select existing
- Multi-select for bulk tagging

### Genres
Assign genres from predefined list or create custom genres.

### Series
Track book series:
- Series name
- Book number in series
- Auto-grouped on series pages

### Collections
Create collections (shelves) to group books:
1. Click **Collections → New Collection**
2. Name your collection
3. Add books manually or use Smart Collection rules

## Editing Books

### Quick Edit
Hover over book card → Click **Edit icon** → Update fields

### Full Edit
Click book → **Edit** → Access all fields including:
- Basic info (title, author, ISBN)
- Publication details
- Description and notes
- Cover image
- Format and pages
- Tags and genres
- Series information

### Bulk Operations
Select multiple books → Actions menu:
- Change status
- Add/remove tags
- Change collection
- Delete books

## Fetching Metadata

### Auto-fetch
When adding a book with ISBN:
1. Enter ISBN
2. Click **Fetch Metadata**
3. Select provider (Google Books, Open Library, etc.)
4. Choose fields to import
5. Confirm

### Manual Metadata Search
For books without ISBN:
1. Click **Search Metadata**
2. Enter title/author
3. Browse results from multiple providers
4. Select matching book
5. Import metadata

### Supported Providers
- Google Books
- Open Library
- Goodreads
- Hardcover
- Amazon
- ComicVine (comics)

## Managing Covers

### Auto-fetch Cover
Metadata import includes cover images automatically.

### Upload Custom Cover
1. Edit book
2. Click **Upload Cover**
3. Select image file
4. Crop and save

### Cover Quality Settings
**Settings → Library → Cover Quality**
- Low (small files)
- Medium (balanced)
- High (best quality)

## Book Status

Track reading progress with status:
- **To Read** - In your TBR pile
- **Reading** - Currently reading
- **Completed** - Finished
- **DNF** - Did not finish
- **Reference** - Reference books

Change status:
- Quick actions on book card
- Edit book form
- Bulk operations

## Rating Books

Rate books 1-5 stars:
- Click book card stars
- Or use edit form
- Ratings appear in statistics

## Adding Notes

Add private notes to books:
1. Open book details
2. Click **Notes** tab
3. Write notes in markdown
4. Auto-saved

## Deleting Books

### Single Book
Click book → **Delete** → Confirm

### Bulk Delete
Select multiple books → **Delete** → Confirm

::: warning
Deleting books is permanent and removes:
- Book metadata
- Reading sessions
- Notes and highlights
- Ebook file (if uploaded)
:::

## Next Steps

- [Ebook Reader](/guide/ebook-reader) - Read your books
- [Smart Collections](/features/smart-collections) - Organize automatically
- [Reading Goals](/features/reading-goals) - Track progress
