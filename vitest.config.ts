import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    environmentOptions: {
      happyDOM: {
        settings: {
          navigator: {
            userAgent: 'vitest'
          }
        }
      }
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '\\.(css|less|scss|sass)$': resolve(__dirname, './src/__mocks__/styleMock.js'),
      '\\.module\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    }
  },
  optimizeDeps: {
    include: ['@testing-library/jest-dom']
  }
})
