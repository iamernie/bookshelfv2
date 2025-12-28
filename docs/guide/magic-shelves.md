# Magic Shelves

## Chapter 5: Collections That Think for You

```
    ✨━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━✨
    ┃                                      ┃
    ┃   "Any sufficiently advanced         ┃
    ┃    library is indistinguishable      ┃
    ┃    from magic."                      ┃
    ┃                    — Probably Asimov ┃
    ┃                                      ┃
    ✨━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━✨
```

Tired of manually organizing your books? Enter **Magic Shelves** — smart collections that automatically populate based on rules you define. Set it and forget it!

---

## What Are Magic Shelves?

Magic Shelves are **saved searches** that act like dynamic playlists:

- Define filter criteria
- Shelf automatically updates when books match
- No manual book-adding required!

![Magic Shelves Overview](../images/magic-shelves-overview.png)
*Your custom collections, always up to date*

### Magic Shelves vs. Tags

| Feature | Magic Shelves | Tags |
|---------|---------------|------|
| Population | Automatic | Manual |
| Updates | Dynamic | Static |
| Criteria | Multiple filters | Single label |
| Best For | Complex queries | Simple grouping |

---

## Creating a Magic Shelf

1. Navigate to **Shelves** in the sidebar
2. Click **+ New Shelf**

![Create Magic Shelf](../images/create-magic-shelf.png)
*Name your new collection*

3. Give it a name (and optionally an icon!)
4. Define your filter rules
5. Click **Create**

### Naming Tips

Be descriptive:
- "5-Star Fantasy" ✓
- "Stuff I Like" ✗

### Icons & Colors

Make shelves visually distinct:

![Shelf Icon Picker](../images/shelf-icon-picker.png)
*Choose from hundreds of icons*

- Pick an icon that represents the content
- Choose a color for quick identification
- Icons show in the sidebar navigation

---

## Filter Rules

The magic happens here! Define what makes a book belong on this shelf.

### Available Filters

| Filter | Options | Example |
|--------|---------|---------|
| **Status** | Any status | "Currently Reading" |
| **Genre** | Any genre | "Fantasy" |
| **Author** | Any author | "Brandon Sanderson" |
| **Series** | Any series | "Stormlight Archive" |
| **Format** | Any format | "Audiobook" |
| **Rating** | 1-5 stars | "4 stars or higher" |
| **Tags** | Any tag | "favorites" |
| **Year Read** | Date range | "2024" |
| **Year Published** | Date range | "2020-2024" |
| **Has Ebook** | Yes/No | "Has ebook attached" |
| **Page Count** | Range | "500+ pages" |

### Single Filter Shelves

The simplest magic shelves:

**"My Favorites"**
```
Rating: 5 stars
```

**"Currently Reading"**
```
Status: Currently Reading
```

**"Audiobooks"**
```
Format: Audiobook
```

### Multi-Filter Shelves

Combine filters for specific collections:

**"Epic Fantasy 2024"**
```
Genre: Fantasy
Status: Read
Year Read: 2024
Page Count: 400+
```

**"Quick Reads"**
```
Page Count: 1-200
Status: To Read
```

**"5-Star Sci-Fi Series"**
```
Genre: Science Fiction
Rating: 5 stars
Series: (any)
```

### AND vs OR Logic

By default, filters combine with AND:
- Genre: Fantasy AND Rating: 5 stars
- Must match ALL criteria

For OR logic within a filter, select multiple values:
- Genre: Fantasy OR Science Fiction
- Matches either genre

---

## Magic Shelf Examples

### "Book Club Picks"

![Book Club Shelf](../images/book-club-shelf.png)
*Track your book club selections*

```
Tags: book-club
```
Simple! Just tag books and they appear.

### "Comfort Reads"

For when you need something cozy:

```
Rating: 4-5 stars
Tags: comfort-read
Status: Read
```

### "Award Winners"

Your shelf of decorated books:

```
Tags: hugo-winner, nebula-winner, booker-prize
```

### "TBR Under 300 Pages"

Tackle your pile one short book at a time:

```
Status: To Read
Page Count: 1-300
```

### "High Fantasy Epics"

For when you want to get LOST:

```
Genre: Fantasy
Page Count: 600+
Rating: 4-5 stars
```

### "Currently In Progress"

Everything you're juggling:

```
Status: Currently Reading
```

### "Forgotten Gems"

Books you rated highly but read long ago:

```
Rating: 5 stars
Year Read: Before 2020
```

### "Series Starters I Own"

First books in series you haven't started:

```
Series Position: 1
Status: To Read
```

---

## Managing Magic Shelves

### Viewing a Shelf

1. Click the shelf in the sidebar
2. See all matching books

![Viewing Magic Shelf](../images/viewing-magic-shelf.png)
*Your dynamic collection*

### Editing Rules

Rules changed? Update them:

1. Open the shelf
2. Click **Edit Shelf**
3. Modify filters
4. Save

Books instantly re-filter!

### Shelf Options

![Shelf Options Menu](../images/shelf-options-menu.png)
*Actions for your shelf*

| Action | Description |
|--------|-------------|
| **Edit** | Modify name, icon, filters |
| **Duplicate** | Copy as starting point |
| **Export** | Download shelf contents |
| **Delete** | Remove shelf (books stay!) |

### Reordering Shelves

Drag and drop in the sidebar:

![Reorder Shelves](../images/reorder-shelves.png)
*Put favorites on top*

---

## Public Shelves

Share your collections with the world!

### Making a Shelf Public

1. Edit the shelf
2. Toggle **Public**
3. Copy the share URL

![Public Shelf Toggle](../images/public-shelf-toggle.png)
*Share your curation*

### Public Shelf URL

```
https://your-bookshelf.com/catalog/shelf/[shelf-id]
```

Share on social media, embed in blogs, or send to friends!

### What Visitors See

![Public Shelf View](../images/public-shelf-view.png)
*A clean, shareable view*

- Book covers
- Titles and authors
- Your ratings
- (No edit controls for visitors)

---

## Advanced Patterns

### Seasonal Reading

**"Summer Beach Reads"**
```
Tags: beach-read
Genre: Romance, Thriller
Page Count: 1-350
```

**"Cozy Winter Reads"**
```
Genre: Fantasy, Mystery
Tags: cozy
```

### Reading Challenges

**"Popsugar Challenge Books"**
```
Tags: popsugar-2024
```

### Series Completion

**"Incomplete Series"**
```
Series: (any)
Status: To Read
```
Quick glance at series you're behind on!

### Format Switching

**"Read Physical, Want Audio"**
```
Status: Read
Format: Paperback, Hardcover
Rating: 5 stars
```
Books you loved enough to re-listen!

### Publishing Year Discovery

**"New Releases"**
```
Year Published: Current Year
Status: To Read
```

---

## Tips & Tricks

### Start Simple

Begin with basic shelves:
- One-filter rules
- Obvious groupings
- Build complexity later

### Use Tags Strategically

Tags + Magic Shelves = Power combo!

1. Create tags for concepts:
   - `mood-dark`
   - `mood-light`
   - `reread-worthy`

2. Build shelves using those tags:
   - "Dark & Gritty" → `mood-dark`
   - "Potential Re-reads" → `reread-worthy`

### Shelf for Everything

Make shelves for your workflows:
- "Needs Review" — books to rate
- "Missing Metadata" — incomplete entries
- "No Cover" — books needing covers

### Temporary Shelves

Create shelves for temporary needs:
- "Vacation Packing List"
- "Gift Ideas for Dad"
- Delete when done!

---

## Shelves in the Sidebar

Your shelves appear in navigation:

![Shelves in Sidebar](../images/shelves-in-sidebar.png)
*Quick access to your collections*

Features:
- Book count badge
- Custom icons
- Drag to reorder
- Collapse section

---

## Magic Shelf FAQ

### Q: Do shelves count against book limits?
**A:** No! Shelves are just views. Each book is stored once.

### Q: Can a book be in multiple shelves?
**A:** Absolutely! A book can match many shelf filters.

### Q: What happens if I delete a shelf?
**A:** Just the shelf is deleted. Books remain in your library.

### Q: How often do shelves update?
**A:** Instantly! Edit a book and shelves recalculate.

### Q: Is there a shelf limit?
**A:** Create as many as you want!

---

## Shelf Ideas Generator

Stuck? Here are more ideas:

| Shelf Name | Filter Logic |
|------------|--------------|
| "Award Season" | Tags: award-winner |
| "Guilty Pleasures" | Rating: 5, Tags: guilty-pleasure |
| "DNF Redemption" | Status: DNF, Rating: 3+ |
| "Owned Unread" | Status: To Read, Format: any physical |
| "Long TBR" | Status: To Read, Date Added: 1+ year ago |
| "Quick Wins" | Page Count: 1-150, Status: To Read |
| "Bedtime Stories" | Genre: Cozy Mystery, Tags: light-read |
| "Movie Adaptations" | Tags: has-movie |
| "Local Authors" | Tags: local-author |
| "Signed Copies" | Tags: signed |

---

<div align="center">

**[← Reading Goals & Stats](./goals-and-stats.md)** | **[Index](./index.md)** | **[Next: Import & Export →](./import-export.md)**

</div>
