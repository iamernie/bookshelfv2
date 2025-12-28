# Managing Your Library

## Chapter 2: The Art of Book Wrangling

```
    ╭─────────────────────────────────────╮
    │  "So many books, so little time."   │
    │                    — Frank Zappa    │
    ╰─────────────────────────────────────╯
```

Welcome to the heart of BookShelf! This is where you'll spend most of your time, lovingly curating your collection like the discerning bibliophile you are.

---

## The Books Page

Your library's main hall. Every book you own lives here.

![Books Page Overview](../images/books-page-overview.png)
*The books page — your collection at a glance*

### Anatomy of the Books Page

| Section | What It Does |
|---------|--------------|
| **Top Bar** | Search, filters, view toggle, add book |
| **Filter Panel** | Narrow down by any criteria |
| **Book Grid/List** | Your actual books! |
| **Pagination** | Navigate through large collections |
| **Bulk Actions** | Actions for selected books |

---

## Adding Books

You've got options! Choose based on your situation:

### Method 1: Metadata Search (Recommended)

The smartest way to add books. Let the robots do the typing!

1. Click **+ Add Book**
2. Type the book title (or author, or ISBN)
3. Watch as BookShelf searches **6 sources** simultaneously

![Metadata Search Results](../images/metadata-search-results.png)
*Multiple providers, one search*

4. Click on your book
5. Review the details (edit if needed)
6. Hit **Add to Library**

**Pro Tips:**
- ISBN searches are most accurate
- Try author + title if title alone has too many results
- You can edit everything after adding

### Method 2: Manual Entry

For those special books that databases don't know about:

1. Click **+ Add Book**
2. Switch to **Manual** tab
3. Fill in the details:

![Manual Book Entry](../images/manual-book-entry.png)
*All the fields you could ever want*

**The Essential Fields:**
- **Title** — The only required field!
- **Author(s)** — Add multiple if needed
- **Status** — Where is this in your reading journey?

**The Nice-to-Haves:**
- Cover image (upload or URL)
- Page count, publication date
- Series info
- Format (paperback, ebook, audiobook)

### Method 3: Import

Got a Goodreads account? An Audible library? A meticulously maintained spreadsheet?

See the [Import & Export Guide](./import-export.md) for bulk importing!

---

## Viewing Your Books

### Grid View

The default, visually stunning way to browse:

![Grid View](../images/grid-view.png)
*Covers, glorious covers!*

Each card shows:
- Cover image
- Title
- Author
- Rating stars
- Status indicator
- Format badge

**Hover Actions:**
- Quick edit button
- Status change
- Open book modal

### List View

For the data-oriented among us:

![List View](../images/list-view.png)
*Rows and columns of bookish data*

Columns include:
- Cover (thumbnail)
- Title
- Author
- Series
- Status
- Rating
- Format
- Date Added

**Click a column header to sort!**

### Switching Views

Use the toggle in the top bar:

![View Toggle](../images/view-toggle.png)
*Grid or list — your choice*

---

## The Book Modal

Click any book to open its detailed view. This is your book's home page!

![Book Modal Overview](../images/book-modal-overview.png)
*Everything about a single book*

### Tabs

The modal has organized tabs:

| Tab | Contents |
|-----|----------|
| **Details** | Core info, description, identifiers |
| **Reading** | Status, dates, progress, rating |
| **Authors** | Author list with roles |
| **Series** | Series info and ordering |
| **Notes** | Your personal notes |
| **Ebook** | Attached ebook file (if any) |

### Quick Actions

At the top of the modal:

![Modal Actions](../images/modal-actions.png)
*Everything you can do to a book*

- **Edit** — Modify any field
- **Fetch Metadata** — Update from online sources
- **Add to Shelf** — Put in a collection
- **Delete** — Remove from library (careful!)

---

## Editing Books

### Inline Quick Edit

For rapid changes without opening the modal:

1. Hover over a book card
2. Click the quick edit icon
3. Change status or rating instantly

![Quick Edit Overlay](../images/quick-edit-overlay.png)
*Fast status changes*

### Full Edit Mode

For comprehensive updates:

1. Open the book modal
2. Click **Edit**
3. The modal transforms into edit mode

![Edit Mode](../images/book-edit-mode.png)
*Full editing power unlocked*

### Editable Fields

**Basic Info:**
- Title, subtitle
- Description
- Cover image (upload or URL)

**Publication:**
- Publication date
- Publisher
- Page count
- Language

**Classification:**
- Genre(s)
- Format
- Tags

**Identifiers:**
- ISBN-10, ISBN-13
- ASIN (Amazon)
- Goodreads ID
- Open Library ID

**Reading:**
- Status
- Rating (1-5 stars, or custom)
- Start date, end date
- Personal notes

---

## Authors & Multi-Author Support

Books can have multiple authors with different roles!

### Author Roles

| Role | Use Case |
|------|----------|
| **Author** | The main writer |
| **Co-Author** | Secondary writer |
| **Editor** | Edited the work |
| **Translator** | Translated from another language |
| **Illustrator** | Created illustrations |
| **Narrator** | For audiobooks |

### Adding Multiple Authors

In edit mode:

![Multi-Author Editor](../images/multi-author-editor.png)
*Add as many authors as you need*

1. Type author name
2. Select from suggestions or create new
3. Set their role
4. Repeat for additional authors

### The Authors Page

![Authors Page](../images/authors-page.png)
*Your personal author directory*

Navigate to **Authors** to see everyone in your library:
- Total books per author
- Series they've written
- Author photos and bios (fetched from Wikipedia!)

Click an author to see all their books in your collection.

---

## Series Management

Got a 15-book fantasy series? We've got you covered!

### Adding Books to Series

In the book modal, go to the **Series** tab:

![Series Tab](../images/series-tab.png)
*Track your place in every series*

1. Type series name
2. Enter book number
3. Save!

### Decimal Numbering

For those novellas and short stories:

- `2.5` — Between books 2 and 3
- `0.5` — Prequel story
- `10.1`, `10.2` — Multiple parts

### Multiple Series

Some books are in multiple series! (Looking at you, Cosmere)

![Multiple Series](../images/multiple-series.png)
*A book in two series*

Set one as **Primary** for main display.

### Series Page

![Series Page](../images/series-page.png)
*Every series in your library*

Navigate to **Series** to see:
- All series
- Books per series
- Gaps in your collection (visual timeline!)
- Series completion percentage

---

## Filtering & Search

### The Filter Panel

Your most powerful organization tool:

![Filter Panel](../images/filter-panel.png)
*Slice and dice your collection*

**Available Filters:**

| Filter | Type | Example |
|--------|------|---------|
| **Status** | Multi-select | Read, Currently Reading |
| **Format** | Multi-select | Paperback, Ebook |
| **Genre** | Multi-select | Fantasy, Sci-Fi |
| **Author** | Search/Select | Brandon Sanderson |
| **Series** | Search/Select | Stormlight Archive |
| **Tags** | Multi-select | favorites, book-club |
| **Rating** | Range | 4-5 stars |
| **Year Read** | Range | 2023-2024 |
| **Year Published** | Range | 2020-2024 |

### Combining Filters

Filters combine with AND logic:

*"Show me all Fantasy books I've Read that are 4+ stars"*

### Search

The search bar finds books by:
- Title
- Author name
- Series name
- ISBN

![Search Results](../images/search-results.png)
*Instant search across your library*

### Saving Filters as Magic Shelves

Got a filter combo you use often? Save it!

1. Set up your filters
2. Click **Save as Shelf**
3. Name your shelf
4. It's now a Magic Shelf that updates automatically!

See [Magic Shelves](./magic-shelves.md) for more.

---

## Bulk Operations

Need to update multiple books at once? Select and act!

### Selecting Books

**Grid View:**
- Click the checkbox on book cards
- Or use "Select All" in the action bar

**List View:**
- Click the checkbox column
- Shift+Click for range selection

![Bulk Selection](../images/bulk-selection.png)
*Selected books ready for action*

### Available Bulk Actions

![Bulk Actions Menu](../images/bulk-actions-menu.png)
*What you can do with selected books*

| Action | What It Does |
|--------|--------------|
| **Change Status** | Move all to Read, Currently Reading, etc. |
| **Add Tags** | Apply tags to all selected |
| **Remove Tags** | Remove tags from all selected |
| **Change Format** | Set format for all |
| **Set Narrator** | Add narrator to all |
| **Delete** | Remove all selected (with confirmation!) |

### Bulk Status Change

The most common operation:

1. Select books
2. Click **Change Status**
3. Pick new status

![Bulk Status Change](../images/bulk-status-change.png)
*Update 50 books in seconds*

---

## Tags

Your personal organization system!

### Creating Tags

1. Open a book
2. Go to edit mode
3. Type in the Tags field
4. Press Enter to create

![Tag Editor](../images/tag-editor.png)
*Create any tags you want*

### Popular Tag Ideas

- `favorites`
- `book-club`
- `to-review`
- `signed-copy`
- `reread-worthy`
- `gift-idea`
- `local-author`

### Managing Tags

Navigate to **Tags** page:

![Tags Page](../images/tags-page.png)
*See all your tags*

- View tag counts
- Rename tags
- Merge duplicate tags
- Delete unused tags

---

## Genres

Pre-defined categories for your books:

### Available Genres

Common genres include:
- Fiction, Non-Fiction
- Fantasy, Science Fiction
- Mystery, Thriller
- Romance, Horror
- Biography, Memoir
- History, Science
- And many more!

### Assigning Genres

Books can have multiple genres:

![Genre Selection](../images/genre-selection.png)
*Pick all that apply*

### Genre Page

![Genres Page](../images/genres-page.png)
*Browse by genre*

See your reading distribution and explore genre-specific books.

---

## Book Statuses

Track where each book is in your reading journey:

| Status | Description | Icon |
|--------|-------------|------|
| **To Read** | On your TBR pile | 📚 |
| **Currently Reading** | In progress | 📖 |
| **Read** | Finished! | ✅ |
| **DNF** | Did Not Finish | ❌ |
| **Wishlist** | Want to acquire | ⭐ |
| **Parked** | Paused for now | ⏸️ |

### DNF (Did Not Finish)

Sometimes it's okay to quit a book! BookShelf lets you track:

- How far you got (page or percentage)
- When you stopped
- Why you stopped (optional note)

![DNF Tracking](../images/dnf-tracking.png)
*No shame in the DNF game*

---

## Covers

### Auto-Downloaded

When you add via metadata search, covers are automatically saved.

### Manual Upload

![Cover Upload](../images/cover-upload.png)
*Drag, drop, done*

Options:
- Drag and drop an image
- Click to browse
- Paste a URL

### No Cover?

Books without covers show a nice placeholder with the title.

---

## Tips & Tricks

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search |
| `Escape` | Close modal |
| `G` | Toggle grid/list |

### Quick Rating

In grid view, hover over a book and click the stars to rate instantly!

### Duplicate Detection

When adding books, BookShelf warns you about potential duplicates:

![Duplicate Warning](../images/duplicate-warning.png)
*Hey, you might already have this one!*

### ISBN Barcode

If you have a book's barcode, you can often search by its ISBN for accurate results!

---

<div align="center">

**[← Getting Started](./getting-started.md)** | **[Index](./index.md)** | **[Next: Ebook Reader →](./ebook-reader.md)**

</div>
