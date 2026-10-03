import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import toned from '@toned/core/vite'
import { imagetools } from 'vite-imagetools'
import { ui, sheets } from './src/styles/index.ts'

export default defineConfig({
  base: './', // relative asset paths so it works under a GitHub Pages project path
  plugins: [
    react(),
    imagetools(), // resizes gallery thumbnails at build time (see src/photos/api.ts)
    toned({ system: ui, sheets: () => sheets, inputs: ['./src/styles/system.ts', './src/styles/layout.ts', './src/styles/photos.ts', './src/styles/components/Card.tsx', './src/styles/components/Badge.tsx', './src/styles/components/Switch.tsx'] }),
  ],
})
