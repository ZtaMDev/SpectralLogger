import DefaultTheme from 'vitepress/theme'
import './custom.css'
import { onMounted } from 'vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // Forzar tema oscuro al cargar la aplicación
    if (typeof window !== 'undefined') {
      // Establecer tema oscuro inmediatamente
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      
      // Asegurar que se mantenga oscuro
      const observer = new MutationObserver(() => {
        if (!document.documentElement.classList.contains('dark')) {
          document.documentElement.classList.add('dark')
          document.documentElement.classList.remove('light')
        }
      })
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
    }
  }
}