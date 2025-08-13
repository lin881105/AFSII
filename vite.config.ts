import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  base: '/AFSII/',
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    host: true,
    allowedHosts: ['afsii.duckdns.org'],
    proxy: {
      '/api': {
        target: 'http://localhost:3300', // 改成 3300
        changeOrigin: true
      }
    }
  },
})
