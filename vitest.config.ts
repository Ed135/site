import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Tests only need React; the site build's Toned/imagetools plugins are not involved.
export default defineConfig({ plugins: [react()], test: { environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'] } })
