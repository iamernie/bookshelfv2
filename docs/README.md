# BookShelf V2 Documentation

This directory contains the VitePress-powered documentation for BookShelf V2.

## 🚀 Quick Start

### Local Development

```bash
# Start dev server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

Visit: http://localhost:5174/BookShelfV2/

## 📁 Structure

```
docs/
├── .vitepress/
│   └── config.mts          # VitePress configuration
├── guide/                   # User guides
│   ├── getting-started.md
│   ├── installation.md
│   ├── configuration.md
│   ├── docker.md
│   ├── managing-books.md
│   └── ...
├── features/               # Feature documentation
│   ├── overview.md
│   ├── smart-collections.md
│   └── ...
├── api/                    # API reference
│   ├── overview.md
│   └── ...
└── index.md               # Homepage
```

## ✍️ Writing Documentation

### Adding a New Page

1. Create a markdown file in the appropriate directory
2. Add it to the sidebar in `.vitepress/config.mts`
3. Write content using markdown + Vue components

### Markdown Features

VitePress supports enhanced markdown:

```markdown
# Heading 1

## Code Blocks
\`\`\`bash
npm install
\`\`\`

## Alerts
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is dangerous
:::

## Tables
| Feature | Status |
|---------|--------|
| Reader  | ✅     |

## Links
[Internal Link](/guide/installation)
[External Link](https://example.com)
```

### Using Vue Components

```markdown
<script setup>
import CustomComponent from './CustomComponent.vue'
</script>

<CustomComponent />
```

## 🌐 Deployment

### GitHub Pages

Documentation automatically deploys to GitHub Pages when:
- Pushing to `main` branch
- Changes are made to `docs/` directory

Workflow: `.github/workflows/deploy-docs.yml`

### Manual Deployment

```bash
# Build
npm run docs:build

# Output is in docs/.vitepress/dist
# Upload to any static hosting service
```

## ⚙️ Configuration

Edit `.vitepress/config.mts` to customize:

- **Title & Description**: Site metadata
- **Base URL**: For GitHub Pages (e.g., `/BookShelfV2/`)
- **Navigation**: Top nav menu
- **Sidebar**: Side navigation structure
- **Theme**: Colors, fonts, layout
- **Search**: Local or Algolia search

### Example: Adding a Nav Item

```typescript
nav: [
  { text: 'Guide', link: '/guide/getting-started' },
  { text: 'New Section', link: '/new-section/overview' } // Add this
]
```

### Example: Adding Sidebar Items

```typescript
sidebar: {
  '/guide/': [
    {
      text: 'Getting Started',
      items: [
        { text: 'New Page', link: '/guide/new-page' } // Add this
      ]
    }
  ]
}
```

## 🎨 Customization

### Logo

Place logo in `docs/public/logo.png` and reference in config:

```typescript
themeConfig: {
  logo: '/logo.png'
}
```

### Custom CSS

Create `docs/.vitepress/theme/custom.css`:

```css
:root {
  --vp-c-brand: #646cff;
  --vp-c-brand-light: #747bff;
}
```

Import in `docs/.vitepress/theme/index.ts`:

```typescript
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```

## 📚 Resources

- [VitePress Docs](https://vitepress.dev/)
- [Markdown Extensions](https://vitepress.dev/guide/markdown)
- [Default Theme Config](https://vitepress.dev/reference/default-theme-config)

## 🐛 Troubleshooting

### Port Already in Use

VitePress will automatically try another port.

### Build Errors

```bash
# Clear cache
rm -rf docs/.vitepress/cache docs/.vitepress/dist

# Rebuild
npm run docs:build
```

### Broken Links

VitePress validates internal links during build. Check build output for warnings.

## 📄 License

Same as BookShelf V2 - MIT License
