import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  // content/ is served as-is (menu.json, godot/signals.md, ...) and fetched at runtime
  publicDir: 'content',
  plugins: [tailwindcss()],
})
