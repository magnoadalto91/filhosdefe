import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Injeta o timestamp do build no dist/sw.js após o Vite copiar a pasta public/
function injectSwBuildTime() {
  return {
    name: 'inject-sw-build-time',
    apply: 'build',
    closeBundle: {
      order: 'post',
      handler() {
        const swPath = resolve(process.cwd(), 'dist/sw.js')
        if (!existsSync(swPath)) return
        const ts = String(Date.now())
        const src = readFileSync(swPath, 'utf8')
        writeFileSync(swPath, src.replace('__BUILD_TIME__', ts))
        console.log(`[sw] build time injetado: ${ts}`)
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), injectSwBuildTime()],
  server: { proxy: { '/api': 'http://localhost:3001' } },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
