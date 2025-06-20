import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Base path for GitHub Pages deployment at username.github.io/cityhive2/
  base: '/cityhive2/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        resources: resolve(__dirname, 'resources.html')
      },
      output: {
        // Use consistent filenames instead of hashes
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/index.css'
      }
    }
  }
})
