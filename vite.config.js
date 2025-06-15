import { defineConfig } from 'vite'

export default defineConfig({
  // Remove base path for local development
  // Uncomment the line below if deploying to GitHub Pages at username.github.io/cityhive2/
  // base: '/cityhive2/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
