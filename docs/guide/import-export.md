# Import & Export

## Chapter 6: Data Migration Wizardry

```
    📥 ════════════════════════════════════ 📤
    ║   GOODREADS → BOOKSHELF              ║
    ║   AUDIBLE → BOOKSHELF                ║
    ║   BOOKSHELF → EVERYWHERE             ║
    📥 ════════════════════════════════════ 📤
```

Moving data in and out is a breeze.

---

## Import Sources

| Source | Format | Best For |
|--------|--------|----------|
| **Goodreads** | CSV | Existing GR users |
| **Audible** | HTML | Audiobook collections |
| **Custom CSV** | CSV | Spreadsheets |
| **JSON Backup** | JSON | BookShelf backups |

---

## Importing from Goodreads

### Step 1: Export from Goodreads

1. Go to [goodreads.com/review/import](https://www.goodreads.com/review/import)
2. Click **Export Library**
3. Download the CSV when ready

### Step 2: Import to BookShelf

1. Go to **Import** → **Goodreads CSV**
2. Upload your file

![Import Preview](../images/import-preview.png)
*Preview what will be imported*

3. Configure options

![Import Options](../images/import-options.png)
*Fine-tune your import*

4. Click **Import**

### What Gets Mapped

| Goodreads | BookShelf |
|-----------|-----------|
| Title, Author | Title, Author |
| My Rating | Rating |
| Date Read | End Date |
| `read` shelf | Read status |
| `currently-reading` | Currently Reading |
| `to-read` | To Read |
| Other shelves | Tags |

---

## Importing from Audible

1. Go to your Audible Library page
2. Right-click → **Save Page As** (complete webpage)
3. In BookShelf: **Import** → **Audible HTML**
4. Upload the saved HTML

Books are auto-tagged as **Audiobook** format with narrator info!

---

## Custom CSV Import

For spreadsheets and other apps.

### Recommended Columns

```csv
title,author,isbn,rating,status,date_read,genre,format
"The Hobbit","J.R.R. Tolkien","9780547928227",5,read,2024-01-15,Fantasy,paperback
```

Only `title` is required. Other columns are mapped during import.

---

## JSON Backup Import

Restore from a BookShelf backup:

1. **Import** → **JSON Backup**
2. Upload your `.json` file
3. Everything is restored!

---

## Exporting

![Export Page](../images/export-page.png)
*Get your data out*

### CSV Export

Export books as spreadsheet:
- All books or filtered selection
- Includes all metadata

### JSON Backup

Complete database backup:
- All records
- All relationships
- Perfect for restoration

**Note:** Ebook files and covers are separate. Back those folders up too!

---

## Duplicate Handling

BookShelf detects duplicates by:
1. **ISBN match** — Exact
2. **Title + Author** — Likely
3. **Title similarity** — Possible

Choose to: **Skip**, **Merge**, **Replace**, or **Create Anyway**

---

## Tips

- **Start small** — Test with 10-20 books first
- **Clean source data** — Fix typos before import
- **Backup first** — Export current data just in case

---

<div align="center">

**[← Magic Shelves](./magic-shelves.md)** | **[Index](./index.md)** | **[Next: OPDS & Integrations →](./opds-integrations.md)**

</div>
