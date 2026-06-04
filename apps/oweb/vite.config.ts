import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { scopeRbcCss } from './vite/scope-rbc-css'
import { injectThemeBoot } from './vite/inject-theme-boot'

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    injectThemeBoot(),
    scopeRbcCss(),
    react(),
    tailwindcss(),
    process.env.CI &&
      visualizer({
        filename: 'bundle-stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Subpath before package root (root must not point at index.ts or `/xml-parser` breaks)
      '@odooseek/odoo-client/xml-parser': path.resolve(
        __dirname,
        '../../packages/odoo-client/src/xml-parser.ts',
      ),
      '@odooseek/odoo-client': path.resolve(__dirname, '../../packages/odoo-client/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@odooseek/odoo-client'],
  },
  build: {
    target: 'esnext',
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-tanstack'
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-recharts'
          }
          if (id.includes('node_modules/react-big-calendar') || id.includes('node_modules/date-fns')) {
            return 'vendor-calendar'
          }
          if (id.includes('node_modules/dompurify')) {
            return 'vendor-dompurify'
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
    '/ws': {
      target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
