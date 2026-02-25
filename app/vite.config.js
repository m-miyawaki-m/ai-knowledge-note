import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  base: '/ai-knowledge-note/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@data': resolve(__dirname, '../data'),
      '@content': resolve(__dirname, '../content')
    }
  }
})
