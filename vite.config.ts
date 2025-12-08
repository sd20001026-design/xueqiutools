import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 1. 部署到 GitHub Pages 必须的基础路径配置
  base: '/xueqiutools/',
  
  // 2. 找回丢失的 "@" 别名配置（修复报错的关键）
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})