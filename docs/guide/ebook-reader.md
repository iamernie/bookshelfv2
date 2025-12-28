# The Ebook Reader

## Chapter 3: Your Digital Reading Nook

```
    ╔═══════════════════════════════════════╗
    ║     📱 EPUB    📄 PDF    🎨 CBZ       ║
    ║   ─────────────────────────────────   ║
    ║                                       ║
    ║   "I cannot sleep unless I am        ║
    ║    surrounded by books."             ║
    ║               — Jorge Luis Borges    ║
    ║                                       ║
    ╚═══════════════════════════════════════╝
```

Why switch between apps when you can read right here? BookShelf comes with a built-in reader that supports EPUB, PDF, and even comic book formats!

---

## Supported Formats

| Format | Extension | Best For |
|--------|-----------|----------|
| **EPUB** | `.epub` | Most ebooks, novels, non-fiction |
| **PDF** | `.pdf` | Fixed-layout books, textbooks, illustrated works |
| **CBZ** | `.cbz` | Comics, manga, graphic novels |

---

## Uploading Ebooks

### Method 1: From the Book Modal

1. Open any book's modal
2. Go to the **Ebook** tab

![Ebook Tab](../images/ebook-tab.png)
*The ebook section — ready for your file*

3. Click **Upload** or drag & drop your file
4. BookShelf extracts metadata automatically!

### Method 2: When Adding a Book

When adding a new book manually:

1. Click **+ Add Book**
2. Choose **Upload Ebook** tab

![Upload Ebook Tab](../images/upload-ebook-tab.png)
*BookShelf reads the ebook's metadata for you*

3. Drop your file
4. BookShelf auto-fills title, author, cover, and more!

### Method 3: BookDrop (Automatic!)

Set up a folder for automatic imports:

1. Go to **Admin → BookDrop**
2. Configure your watch folder
3. Drop files in
4. BookShelf imports them automatically!

See [BookDrop Setup](./admin-guide.md#bookdrop) for details.

---

## Opening the Reader

### From the Books Page

Books with attached ebooks show a special indicator:

![Ebook Indicator](../images/ebook-indicator.png)
*The little icon means there's an ebook attached*

Click the **Read** button on hover, or:

1. Open the book modal
2. Go to **Ebook** tab
3. Click **Open Reader**

### Direct URL

Every ebook has a direct reader URL:
```
https://your-bookshelf.com/reader/[book-id]
```

Bookmark your current read for quick access!

---

## EPUB Reader

The full-featured reading experience for most ebooks:

![EPUB Reader](../images/epub-reader-full.png)
*Your personal reading app*

### Reader Interface

| Area | Function |
|------|----------|
| **Top Bar** | Title, chapter, settings |
| **Main Area** | The actual book content |
| **Bottom Bar** | Progress, page controls |
| **Side Panels** | Table of contents, bookmarks |

### Navigation

**Page Turning:**
- Click left/right edges
- Use arrow keys ← →
- Swipe on touch devices

**Jump to Chapter:**
1. Click the **≡** menu icon
2. Select from table of contents

![Table of Contents](../images/epub-toc.png)
*Jump to any chapter*

**Go to Percentage:**
- Click the progress bar
- Or use the slider

### Themes

Your eyes, your rules:

![Reader Themes](../images/reader-themes.png)
*Light, dark, or sepia*

| Theme | Background | Text |
|-------|------------|------|
| **Light** | White | Black |
| **Dark** | Dark gray | Light gray |
| **Sepia** | Cream | Dark brown |

Switch themes in the settings menu (⚙️).

### Typography Settings

![Typography Settings](../images/typography-settings.png)
*Customize your reading experience*

Adjust:
- **Font Family** — Serif, sans-serif, or custom
- **Font Size** — Small to extra large
- **Line Height** — Spacing between lines
- **Margins** — Page margins
- **Text Align** — Left, justified

### Bookmarks

Never lose your place!

![Bookmarks Panel](../images/bookmarks-panel.png)
*Your saved locations*

**To bookmark:**
1. Open settings menu
2. Click **Add Bookmark**
3. Optionally add a note

**To jump to bookmark:**
1. Open bookmarks panel
2. Click any bookmark

### Reading Progress

BookShelf automatically saves your position. Close the reader and come back—you'll be right where you left off!

Progress is synced across devices if you're logged into the same account.

![Progress Indicator](../images/reading-progress-bar.png)
*See how far you've come*

---

## PDF Reader

For those beautiful fixed-layout books:

![PDF Reader](../images/pdf-reader.png)
*PDFs rendered right in the browser*

### PDF Controls

| Control | Function |
|---------|----------|
| **Zoom In/Out** | Scale the page |
| **Fit Width** | Fit to browser width |
| **Fit Page** | Show full page |
| **Page Number** | Jump to specific page |
| **Thumbnails** | Visual page navigation |

### Navigation

- Use scroll wheel
- Page up/down keys
- Thumbnail panel for quick jumps
- Direct page number entry

### PDF Settings

![PDF Settings](../images/pdf-settings.png)
*Customize PDF viewing*

- Single or two-page view
- Continuous or paginated scroll
- Zoom level memory

---

## Comic/Manga Reader (CBZ)

Panel-by-panel bliss for graphic novel fans:

![CBZ Reader](../images/cbz-reader.png)
*Comics, manga, and graphic novels*

### What's CBZ?

CBZ is a comic book archive format—basically a ZIP file of images. BookShelf extracts and displays them beautifully.

### Reading Modes

| Mode | Description |
|------|-------------|
| **Single Page** | One page at a time |
| **Double Page** | Two-page spread (like a physical comic) |
| **Scroll** | Continuous vertical scroll (webtoon style) |

![Comic Reading Modes](../images/comic-reading-modes.png)
*Choose your preferred layout*

### Controls

- **Arrow Keys** — Previous/next page
- **Space** — Next page
- **F** — Fullscreen
- **Scroll** — Pan around the page

### Manga Mode

Reading right-to-left? Toggle manga mode:

![Manga Mode Toggle](../images/manga-mode.png)
*Right-to-left reading order*

Pages will flow in the correct direction for Japanese manga.

### Zoom & Pan

For those detailed panels:

1. Click to zoom in
2. Drag to pan
3. Double-click to reset

Or use the zoom controls in the toolbar.

---

## Reader Settings

Access via the ⚙️ icon in any reader:

![Reader Settings Menu](../images/reader-settings-menu.png)
*Customize everything*

### Common Settings

| Setting | Options | Default |
|---------|---------|---------|
| **Theme** | Light, Dark, Sepia | Light |
| **Remember Position** | Yes, No | Yes |
| **Show Progress Bar** | Yes, No | Yes |
| **Auto-fullscreen** | Yes, No | No |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Previous/Next page |
| `Space` | Next page |
| `Home` | Go to start |
| `End` | Go to end |
| `F` | Toggle fullscreen |
| `Escape` | Exit fullscreen/Close |
| `T` | Toggle table of contents |
| `B` | Open bookmarks |
| `+` / `-` | Zoom in/out (PDF) |

---

## Ebook Metadata Extraction

When you upload an ebook, BookShelf can read:

### From EPUB

- Title
- Author(s)
- Cover image
- Description
- Publisher
- Publication date
- Language
- ISBN

### From PDF

- Title (from metadata)
- Author
- Subject
- Creation date

### From CBZ

- Series name (from filename patterns)
- Issue number
- Cover (first page)

---

## Managing Ebooks

### Viewing Attached Ebook

In the book modal, the **Ebook** tab shows:

![Ebook Details](../images/ebook-details.png)
*File info and actions*

- File name
- File size
- Format
- Upload date

### Replacing an Ebook

1. Go to Ebook tab
2. Click **Replace**
3. Upload new file

The reading progress is preserved!

### Downloading

Need the file elsewhere?

1. Ebook tab
2. Click **Download**

### Removing

1. Ebook tab
2. Click **Remove**
3. Confirm

The book entry stays; only the file is removed.

---

## Reading Sessions

BookShelf tracks your reading activity:

![Reading Session](../images/reading-session.png)
*Your reading history*

Each session records:
- Start time
- End time
- Progress made
- Device/browser

View your reading sessions in **Stats → Reading Activity**.

---

## Tips for Best Experience

### EPUB Quality

Not all EPUBs are created equal. For best results:
- Use DRM-free files
- Higher quality publishers have better formatting
- Calibre can improve poorly-formatted EPUBs

### Large Files

For very large PDFs or CBZ files:
- Initial load may take a moment
- Pages are loaded on-demand for efficiency
- Enable preloading in settings for smoother navigation

### Mobile Reading

The reader is responsive and works on phones/tablets:
- Swipe to turn pages
- Pinch to zoom
- Tap edges for navigation

![Mobile Reader](../images/mobile-reader.png)
*Reading on the go*

### Syncing Progress

Reading on multiple devices? Progress syncs automatically when:
- You're logged in
- You close the reader (or after 30 seconds)
- The devices are online

---

## Troubleshooting

### "File too large"

Default upload limit is 100MB. For larger files:
- Compress the file
- Or adjust server settings (see Admin Guide)

### EPUB not displaying correctly

- Check if the EPUB is DRM-protected (not supported)
- Try re-exporting from Calibre
- Some complex layouts may not render perfectly

### PDF is slow

- Very large PDFs with many images take time
- Try enabling "Fast Mode" in PDF settings
- Consider splitting into volumes

### Comic pages out of order

- CBZ files use alphabetical ordering
- Ensure pages are named: 001.jpg, 002.jpg, etc.
- Or with consistent padding: page_001.png

---

<div align="center">

**[← Managing Your Library](./managing-books.md)** | **[Index](./index.md)** | **[Next: Reading Goals & Stats →](./goals-and-stats.md)**

</div>
