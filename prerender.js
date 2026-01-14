import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const toAbsolute = (p) => path.resolve(__dirname, p)

async function prerender() {
  console.log('⚡ Generating SSG Pre-rendered HTML...')

  const template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8')
  
  // Dynamically import the compiled SSR entry
  const ssrEntryPath = toAbsolute('dist-ssr/entry-server.js')
  const { render } = await import(pathToFileURL(ssrEntryPath).href)

  const { html: appHtml } = render()

  // Replace <div id="root"></div> with the full pre-rendered HTML DOM
  const finalHtml = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`
  )

  fs.writeFileSync(toAbsolute('dist/index.html'), finalHtml)
  console.log('✨ SSG Success: index.html pre-rendered successfully!')

  // Clean up temporary SSR build directory
  fs.rmSync(toAbsolute('dist-ssr'), { recursive: true, force: true })
  console.log('🧹 Cleaned up temporary SSR build artifacts.')
}

prerender().catch((err) => {
  console.error('SSG Pre-render error:', err)
  process.exit(1)
})
