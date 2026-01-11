import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    // 生产环境构建目标
    target: 'modules',
    // 输出目录
    outDir: 'dist',
    // 生成源码映射
    sourcemap: false,
    // 最小化混淆
    minify: 'esbuild',
    // CSS 代码拆分
    cssCodeSplit: true,
    // Rollup 选项
    rollupOptions: {
      output: {
        // 分块策略
        manualChunks: {
          'vue-vendor': ['vue'],
          'utils': ['./src/utils/aiService.js', './src/utils/storage.js']
        },
        // 资源文件命名
        assetFileNames: 'assets/[name].[hash].[ext]',
        // 分块文件命名
        chunkFileNames: 'assets/[name].[hash].js',
        // 入口文件命名
        entryFileNames: 'assets/[name].[hash].js'
      }
    },
    // chunk 大小警告限制 (KB)
    chunkSizeWarningLimit: 1000
  },
  // 依赖预构建
  optimizeDeps: {
    include: ['vue', 'canvas-confetti']
  }
})
