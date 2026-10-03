import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import toned from '@toned/core/vite'
import { imagetools } from 'vite-imagetools'
import { ui, sheets } from './src/styles'

export default defineConfig({
  base: './', // relative asset paths so it works under a GitHub Pages project path
  plugins: [react(), imagetools(), toned({ system: ui, sheets })],
})
