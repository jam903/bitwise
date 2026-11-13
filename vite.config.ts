import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages serves a project site at https://<user>.github.io/<repo>/, so
// every asset URL needs the /<repo>/ prefix or the page loads blank (ADR-0001).
// The deploy workflow passes BASE_PATH from actions/configure-pages, so renaming
// the repo can't silently break the site; locally it falls back to '/'.
const base = (process.env.BASE_PATH ?? '').replace(/\/?$/, '/')

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
