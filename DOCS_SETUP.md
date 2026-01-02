# GitHub Pages Setup Instructions

Follow these steps to enable GitHub Pages for your BookShelf V2 documentation.

## 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. Save

## 2. Update Configuration

Edit `docs/.vitepress/config.mts` and update:

```typescript
export default defineConfig({
  // Change this to your repository name
  base: '/BookShelfV2/',  // or '/your-repo-name/'
  
  themeConfig: {
    // Update GitHub link
    nav: [
      { text: 'GitHub', link: 'https://github.com/yourusername/BookShelfV2' }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/BookShelfV2' }
    ]
  }
})
```

Replace:
- `yourusername` with your GitHub username
- `BookShelfV2` with your repository name (if different)

## 3. Commit and Push

```bash
git add .
git commit -m "Add VitePress documentation"
git push origin main
```

## 4. Wait for Deployment

1. Go to **Actions** tab on GitHub
2. Watch the "Deploy VitePress Documentation" workflow
3. Once complete (green checkmark), your docs are live!

## 5. Access Your Documentation

Visit: `https://yourusername.github.io/BookShelfV2/`

## Updating Documentation

Any changes pushed to the `docs/` directory will automatically trigger a rebuild and redeploy.

```bash
# Edit documentation files
vim docs/guide/installation.md

# Commit and push
git add docs/
git commit -m "Update installation guide"
git push origin main
```

## Custom Domain (Optional)

To use a custom domain (e.g., `docs.yourdomain.com`):

1. Add `CNAME` file to `docs/public/`:
   ```
   docs.yourdomain.com
   ```

2. Update `base` in config:
   ```typescript
   base: '/',  // Remove repo path
   ```

3. Configure DNS:
   - Add CNAME record: `docs` → `yourusername.github.io`
   
4. In GitHub Settings → Pages, add custom domain

## Troubleshooting

### 404 Errors

Check that `base` in config matches your repo name:
```typescript
base: '/BookShelfV2/',  // Must match repo name
```

### Build Failures

1. Check **Actions** tab for error details
2. Ensure all markdown files have valid frontmatter
3. Verify no broken internal links

### Workflow Not Running

1. Ensure workflow file is at: `.github/workflows/deploy-docs.yml`
2. Check GitHub Pages is set to "GitHub Actions" source
3. Verify branch name is correct in workflow (`main` or `master`)

## Local Testing

Before pushing, test locally:

```bash
# Dev server with hot reload
npm run docs:dev

# Production build (same as deployed)
npm run docs:build
npm run docs:preview
```

## Need Help?

- [VitePress Deployment Guide](https://vitepress.dev/guide/deploy#github-pages)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
