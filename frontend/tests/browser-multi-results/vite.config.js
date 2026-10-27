import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig } from 'vite'
import baseConfig from '../../vite.config.js'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const fixtureModule = fileURLToPath(new URL('./metaboliteResults.fixture.js', import.meta.url))

export default mergeConfig(
  baseConfig,
  defineConfig({
    root: repoRoot,
    plugins: [
      {
        name: 'humeta-browser-multi-results-fixture',
        enforce: 'pre',
        resolveId(source, importer) {
          const normalizedImporter = importer?.replaceAll('\\', '/')
          if (
            source === '../data/metaboliteResults'
            && normalizedImporter?.endsWith('/src/views/BrowserView.vue')
          ) {
            return fixtureModule
          }
          return null
        },
        transformIndexHtml() {
          return [
            {
              tag: 'script',
              attrs: { type: 'module' },
              children: `
                import { auditBrowserPage, resourceAudit } from '/tests/browser-multi-results/browser-page-audit.js'
                window.__humetaBrowserTest = { auditBrowserPage, resourceAudit }
                document.documentElement.dataset.humetaTestUserAgent = navigator.userAgent
                const networkFailures = []
                const publishFailures = () => {
                  document.documentElement.dataset.humetaNetworkFailures = JSON.stringify(networkFailures)
                }
                publishFailures()
                window.addEventListener('error', (event) => {
                  const resource = event.target?.currentSrc || event.target?.src || event.target?.href
                  if (!resource) return
                  networkFailures.push(resource)
                  publishFailures()
                }, true)
              `,
              injectTo: 'head',
            },
          ]
        },
      },
    ],
    server: {
      host: '127.0.0.1',
      port: 4174,
      strictPort: true,
    },
    clearScreen: false,
  }),
)
