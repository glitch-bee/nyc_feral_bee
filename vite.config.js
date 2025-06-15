import { defineConfig } from 'vite'

export default defineConfig({
  // Base path for GitHub Pages deployment at username.github.io/cityhive2/
  base: '/cityhive2/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
