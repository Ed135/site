import { createRoot } from 'react-dom/client'
import { TonedProvider } from '@toned/react'
import { createWebRenderer } from '@toned/core/server'
import { webHost } from '@toned/react/hosts/web'
import '@toned/themes/shadcn/config.css'
import './styles/theme.css'
import 'virtual:toned.css'
import manifest from 'virtual:toned.manifest'
import { ui } from './styles/index.ts'
import { App } from './App.tsx'

const renderer = createWebRenderer(ui, { manifest })

createRoot(document.getElementById('root')!).render(
  <TonedProvider renderer={renderer} host={webHost}>
    <App />
  </TonedProvider>,
)
