import { defineConfig } from 'vite'

export default defineConfig({
  // Base path for GitHub Pages deployment at username.github.io/cityhive2/
  base: '/cityhive2/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Use consistent filenames instead of hashes
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/index.css'
      }
    }
  }
})
