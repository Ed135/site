// Styling entry. Sheets listed here are compiled to CSS by the Vite plugin (see vite.config.ts).
//   system.ts     token system all sheets build on
//   theme.css     brutalist + dark mode values (CSS variables, switched by data-theme / data-mode on <html>)
//   layout.ts     page shell, nav, sections
//   photos.ts     photography page: gallery grid + upload dropzone
//   components/   Card, Badge, Switch (adapted from the Toned UI example)
import { page, nav, section } from './layout.ts'
import { gallery } from './photos.ts'
import { cardStyles } from './components/Card.tsx'
import { badgeStyles } from './components/Badge.tsx'
import { switchStyles } from './components/Switch.tsx'

export { ui } from './system.ts'
export { page, nav, section, gallery }
export const sheets = [page, nav, section, gallery, cardStyles, badgeStyles, switchStyles]
