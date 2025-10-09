// docs/.vitepress/config.mts
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Spectral Logs',
  base: '/SpectralLogs/',
  description: 'High-performance logging for Node & Web',
  sitemap: { hostname: 'https://ztamdev.github.io/SpectralLogs' },
  head: [
    ['script', {}, `
      (function() {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.style.colorScheme = 'dark';
      })();
    `],
    ['link', { rel: 'icon', href: '/SpectralLogs/favicon.ico' }],
    ['link', { rel: 'shortcut icon', href: '/SpectralLogs/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/SpectralLogs/logo.png' }],
    ['meta', { name: 'theme-color', content: '#111827' }],
    ['link', { rel: 'canonical', href: 'https://ztamdev.github.io/SpectralLogs/' }],
    ['meta', { name: 'theme-color', content: '#111827' }],
    ['meta', { name: 'keywords', content: 'spectral logs, spectrallogs, logging library, node logger, browser logger, typescript logger, fast logging, console replacement' }],
    ['meta', { name: 'description', content: 'SpectralLogs: high-performance logging for Node & Web. Beautiful colors, clean formatting, plugin system, and blazing-fast output.' }],
    ['meta', { property: 'og:title', content: 'SpectralLogs — High-performance logging for Node & Web' }],
    ['meta', { property: 'og:description', content: 'Beautiful colors, clean formatting, plugin system, and blazing-fast output. Works in Node and the browser.' }],
    ['meta', { property: 'og:url', content: 'https://ztamdev.github.io/SpectralLogs/' }],
    ['meta', { property: 'og:image', content: '/logo.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'SpectralLogs — High-performance logging' }],
    ['meta', { name: 'twitter:description', content: 'Fast logging for Node & Web with colors, formatting, plugins.' }],
    ['meta', { name: 'twitter:image', content: 'https://ztamdev.github.io/SpectralLogs/logo.png' }]
  ],
  appearance: false,
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Roadmap', link: '/roadmap' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Configuration', link: '/configuration' },
      { text: 'Colors', link: '/colors' },
      { text: 'Node', link: '/node' },
      { text: 'Web', link: '/web' },
      { text: 'Plugins', link: '/plugins' },
      { text: 'API', link: '/api' },
      { text: 'How it works', link: '/how-it-works' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Node', link: '/node' },
          { text: 'Web', link: '/web' },
          { text: 'Colors', link: '/colors' },
          { text: 'Plugins', link: '/plugins' },
          { text: 'Workers', link: '/workers-and-test-runners' },
          { text: 'API', link: '/api' },
          { text: 'How it works', link: '/how-it-works' },
        ],
      },
      {
        text: 'Project',
        items: [
          { text: 'Roadmap', link: '/roadmap' },
        ]
      }
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