import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import toned from '@toned/core/vite'
import { ui, sheets } from './src/styles/index.ts'

export default defineConfig({
  base: './', // relative asset paths so it works under a GitHub Pages project path
  plugins: [
    react(),
    toned({ system: ui, sheets: () => sheets, inputs: ['./src/styles/system.ts', './src/styles/layout.ts', './src/styles/photos.ts', './src/styles/components/card.tsx', './src/styles/components/badge.tsx', './src/styles/components/switch.tsx'] }),
  ],
})
