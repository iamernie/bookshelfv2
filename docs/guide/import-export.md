# Import & Export

## Chapter 6: Data Migration Wizardry

```
    📥 ════════════════════════════════════ 📤
    ║                                        ║
    ║    GOODREADS → BOOKSHELF              ║
    ║    AUDIBLE → BOOKSHELF                ║
    ║    SPREADSHEET → BOOKSHELF            ║
    ║    BOOKSHELF → EVERYWHERE             ║
    ║                                        ║
    📥 ════════════════════════════════════ 📤
```

Bringing your data into BookShelf is a breeze, and getting it out is just as easy. Let's move some books!

---

## Import Sources

BookShelf can import from:

| Source | Format | Best For |
|--------|--------|----------|
| **Goodreads** | CSV Export | Existing Goodreads users |
| **Audible** | HTML Export | Audiobook collections |
| **Custom CSV** | CSV file | Spreadsheets, other apps |
| **JSON Backup** | JSON file | BookShelf backups |

---

## Importing from Goodreads

The most common migration path!

### Step 1: Export from Goodreads

1. Go to [goodreads.com/review/import](https://www.goodreads.com/review/import)
2. Click **Export Library**
3. Wait for the email (can take a few minutes)
4. Download the CSV file

![Goodreads Export](../images/goodreads-export-page.png)
*The Goodreads export page*

### Step 2: Import to BookShelf

1. Navigate to **Import** in the sidebar
2. Select **Goodreads CSV**

![Import Source Selection](../images/import-source-selection.png)
*Choose your source*

3. Upload your `goodreads_library_export.csv` file

### Step 3: Preview & Map

BookShelf shows you what it found:

![Import Preview](../images/import-preview.png)
*Review before importing*

The preview shows:
- Books found
- Authors matched
- Series detected
- Status mapping

### Step 4: Configure Options

![Import Options](../images/import-options.png)
*Fine-tune your import*

| Option | Description |
|--------|-------------|
| **Fetch Covers** | Download cover images |
| **Fetch Metadata** | Enhance with additional data |
| **Match Series** | Auto-detect series info |
| **Create Authors** | Add new authors |
| **Create Genres** | Add new genres |

### Step 5: Execute Import

Click **Import** and watch the magic:

![Import Progress](../images/import-progress.png)
*Books flowing in*

### Goodreads Mapping

| Goodreads Field | BookShelf Field |
|-----------------|-----------------|
| Title | Title |
| Author | Author |
| ISBN | ISBN-13 |
| My Rating | Rating |
| Bookshelves | Tags + Status |
| Date Read | End Date |
| Date Added | Date Added |
| Exclusive Shelf | Status |

**Status Mapping:**

| Goodreads Shelf | BookShelf Status |
|-----------------|------------------|
| `read` | Read |
| `currently-reading` | Currently Reading |
| `to-read` | To Read |
| Others | Converted to tags |

---

## Importing from Audible

Got a massive audiobook collection?

### Step 1: Get Audible Library HTML

1. Go to your [Audible Library](https://www.audible.com/library/titles)
2. Right-click → **Save Page As**
3. Save as "Complete webpage" (HTML)

![Save Audible Page](../images/save-audible-page.png)
*Save the complete page*

### Step 2: Import to BookShelf

1. Go to **Import**
2. Select **Audible HTML**
3. Upload the saved HTML file

### Step 3: Review & Import

BookShelf extracts:
- Title
- Author(s)
- Narrator(s)
- Cover images
- Runtime

![Audible Import Preview](../images/audible-import-preview.png)
*Your audiobooks ready to import*

All books are automatically set to:
- Format: Audiobook
- Narrator field populated

---

## Custom CSV Import

For spreadsheets and other apps:

### Required Columns

At minimum:
- `title` — Book title

### Recommended Columns

| Column | Description | Example |
|--------|-------------|---------|
| `title` | Book title | "The Hobbit" |
| `author` | Author name(s) | "J.R.R. Tolkien" |
| `isbn` | ISBN-13 or ISBN-10 | "9780547928227" |
| `rating` | 1-5 rating | "5" |
| `status` | Reading status | "read" |
| `date_read` | Completion date | "2024-01-15" |
| `date_started` | Start date | "2024-01-01" |
| `genre` | Genre(s) | "Fantasy" |
| `format` | Book format | "paperback" |
| `pages` | Page count | "310" |
| `series` | Series name | "The Lord of the Rings" |
| `series_number` | Position in series | "0" |
| `tags` | Comma-separated tags | "favorites, classic" |

### Sample CSV

```csv
title,author,isbn,rating,status,date_read,genre,format
"The Hobbit","J.R.R. Tolkien","9780547928227",5,read,2024-01-15,Fantasy,paperback
"1984","George Orwell","9780451524935",4,read,2024-02-01,Science Fiction,ebook
"Dune","Frank Herbert","9780441172719",5,currently-reading,,Science Fiction,hardcover
```

### Multiple Authors

Separate with semicolons:
```csv
"Good Omens","Neil Gaiman; Terry Pratchett",...
```

### Multiple Genres/Tags

Separate with commas:
```csv
"The Martian",...,"Science Fiction, Thriller",...
```

### Import Process

1. Go to **Import**
2. Select **Custom CSV**
3. Upload file
4. **Map columns** to BookShelf fields

![Column Mapping](../images/csv-column-mapping.png)
*Match your columns to BookShelf fields*

5. Preview and import

---

## JSON Backup Import

Restore from a BookShelf backup:

### When to Use

- Moving to a new server
- Restoring after data loss
- Transferring between instances

### Process

1. Go to **Import**
2. Select **JSON Backup**
3. Upload your `.json` backup file

![JSON Import](../images/json-import.png)
*Restore from backup*

### What's Included

- All books with complete metadata
- Authors, series, genres
- Tags and custom fields
- Reading dates and notes
- Ebook file references (files separate)

---

## Export Options

Getting data OUT of BookShelf:

### CSV Export

For spreadsheets and other tools:

1. Go to **Export**
2. Select **CSV**
3. Choose what to include

![Export Options](../images/export-options.png)
*Configure your export*

**Export Types:**

| Type | Contents |
|------|----------|
| **All Books** | Complete library |
| **Filtered Books** | Current filter/search |
| **Shelf Contents** | Specific Magic Shelf |

**Columns Included:**
- Title, Author, ISBN
- Rating, Status
- Dates (added, started, finished)
- Genre, Format, Tags
- Page count, Publisher
- Notes

### JSON Backup

Complete data backup:

1. Go to **Export**
2. Select **JSON Backup**
3. Click **Download**

This creates a complete snapshot:
- All database records
- Full metadata
- Relationships preserved

**Pro tip:** Set up regular JSON backups!

### Books CSV

Export just the books table:

```csv
title,author,isbn,status,rating,date_added,date_read...
```

### Authors CSV

Export your author directory:

```csv
name,book_count,bio,wikipedia_url
```

### Series CSV

Export series information:

```csv
name,book_count,complete,tags
```

---

## Import Duplicate Handling

What happens when you import a book you already have?

![Duplicate Detection](../images/duplicate-detection.png)
*BookShelf warns you about duplicates*

### Detection Methods

BookShelf checks:
1. **ISBN match** — Exact duplicate
2. **Title + Author match** — Likely duplicate
3. **Title similarity** — Possible duplicate

### Options

| Option | Behavior |
|--------|----------|
| **Skip** | Don't import duplicates |
| **Replace** | Overwrite existing |
| **Merge** | Combine data (preserve better values) |
| **Create Anyway** | Import as new book |

---

## Author & Series Matching

During import, BookShelf intelligently matches:

### Author Matching

![Author Matching](../images/author-matching-import.png)
*Recognizing your existing authors*

- Matches existing authors by name
- Suggests similar names
- Creates new authors when needed

### Series Detection

![Series Detection](../images/series-detection-import.png)
*Finding series from titles*

BookShelf can detect series from:
- Goodreads series data
- Title patterns: "Title (Series Name #1)"
- Metadata providers

---

## Import Tips

### Before You Import

1. **Clean your source data**
   - Fix obvious typos
   - Standardize author names
   - Remove test entries

2. **Start with a test**
   - Import 10-20 books first
   - Verify mapping is correct
   - Then import the rest

3. **Backup first**
   - Export current data
   - Just in case!

### During Import

- Be patient with large imports
- Cover fetching takes time
- Don't close the browser

### After Import

1. **Check the results**
   - Browse imported books
   - Verify authors are correct
   - Check series assignments

2. **Fix any issues**
   - Merge duplicate authors
   - Correct series numbering
   - Add missing covers

3. **Clean up**
   - Delete any test imports
   - Organize tags

---

## BookDrop: Automatic Import

For continuous importing:

![BookDrop Config](../images/bookdrop-config.png)
*Set and forget importing*

See [BookDrop Setup](./admin-guide.md#bookdrop) for:
- Folder watching
- Automatic metadata fetch
- File organization

---

## Migration Scenarios

### From Goodreads to BookShelf

1. Export Goodreads CSV
2. Import with full options
3. Let covers fetch
4. Review and clean up

### From Spreadsheet to BookShelf

1. Format CSV with correct columns
2. Import with column mapping
3. Fetch metadata to fill gaps
4. Add series info manually if needed

### From Another App

1. Export to CSV from old app
2. Map columns during import
3. Use ISBN for metadata enhancement

### Fresh Start

Just start adding books! No import needed.

---

## Troubleshooting

### "Import failed"

- Check file format (UTF-8 encoding)
- Verify column headers
- Look for special characters

### Missing covers

- Covers fetch in background
- Check internet connection
- Some books have no available cover

### Wrong author matches

- Edit after import
- Use "Create New" for ambiguous names

### Series not detected

- Add manually after import
- Use metadata search to find series info

### Duplicates everywhere

- Enable duplicate detection
- Use "Skip" for subsequent imports

---

<div align="center">

**[← Magic Shelves](./magic-shelves.md)** | **[Index](./index.md)** | **[Next: OPDS & Integrations →](./opds-integrations.md)**

</div>
