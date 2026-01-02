import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'BookShelf V2',
  description: 'Your personal book library, beautifully organized',
  base: '/BookShelfV2/',
  ignoreDeadLinks: true,
  
  themeConfig: {
    logo: '/logo.png',
    
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Features', link: '/features/overview' },
      { text: 'API', link: '/api/overview' },
      { text: 'GitHub', link: 'https://github.com/yourusername/BookShelfV2' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Docker Setup', link: '/guide/docker' }
          ]
        },
        {
          text: 'Usage',
          items: [
            { text: 'Managing Books', link: '/guide/managing-books' },
            { text: 'Reading Ebooks', link: '/guide/ebook-reader' },
            { text: 'Importing Data', link: '/guide/importing' },
            { text: 'Multi-user Setup', link: '/guide/multi-user' }
          ]
        }
      ],
      '/features/': [
        {
          text: 'Features',
          items: [
            { text: 'Overview', link: '/features/overview' },
            { text: 'Smart Collections', link: '/features/smart-collections' },
            { text: 'Reading Goals', link: '/features/reading-goals' },
            { text: 'Metadata Providers', link: '/features/metadata' },
            { text: 'OPDS Catalog', link: '/features/opds' },
            { text: 'BookDrop', link: '/features/bookdrop' },
            { text: 'AI Recommendations', link: '/features/ai-recommendations' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Authentication', link: '/api/authentication' },
            { text: 'Books', link: '/api/books' },
            { text: 'Collections', link: '/api/collections' },
            { text: 'Reading Sessions', link: '/api/reading-sessions' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/BookShelfV2' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present'
    }
  }
})
