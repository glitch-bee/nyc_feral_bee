import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  return {
    base: command === 'serve' ? '/' : '/nyc_feral_bee/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          about: resolve(__dirname, 'about.html'),
          resources: resolve(__dirname, 'resources.html'),
        },
      },
    },
    
    // PWA Configuration - TODO: Implement with @vite/plugin-pwa
    // When ready to implement:
    // 1. Install: npm install @vite/plugin-pwa
    // 2. Import: import { VitePWA } from 'vite-plugin-pwa'
    // 3. Add VitePWA plugin to plugins array
    // 4. Configure with manifest and workbox settings
  }
})
