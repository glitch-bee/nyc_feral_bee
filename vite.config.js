import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  return {
    base: command === 'serve' ? '/' : '/cityhive2/',
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
  }
})
