// docs/.vitepress/config.mts
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'SpectralLogs',
  base: '/SpectralLogs/',
  description: 'High-performance logging for Node & Web',
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['link', { rel: 'shortcut icon', type: 'image/png', href: '/logo.png' }],
    ['link', { rel: 'favicon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#111827' }],
    ['meta', { property: 'og:image', content: '/logo.png' }]
  ],
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Configuration', link: '/configuration' },
      { text: 'How it works', link: '/how-it-works' },
      { text: 'Workers + Tests', link: '/workers-and-test-runners' },
      { text: 'Node', link: '/node' },
      { text: 'Web', link: '/web' },
      { text: 'Plugins', link: '/plugins' },
      { text: 'API', link: '/api' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'How it works', link: '/how-it-works' },
          { text: 'Workers + Test Runners', link: '/workers-and-test-runners' },
          { text: 'Node', link: '/node' },
          { text: 'Web', link: '/web' },
          { text: 'Plugins', link: '/plugins' },
          { text: 'API', link: '/api' },
        ],
      },
    ],
    footer: {
      message:
        'Created by <a href="https://github.com/ZtaMDev" target="_blank" rel="noopener">ZtaMDev</a> · '
        + '<a href="https://github.com/ZtaMDev/SpectralLogs" target="_blank" rel="noopener">GitHub</a> · '
        + '<a href="https://www.npmjs.com/package/spectrallogs" target="_blank" rel="noopener">npm</a>',
      copyright: ' 2025 SpectralLogs'
    }
  },
});