// Styling entry. Sheets listed here are compiled to CSS by the Vite plugin (see vite.config.ts).
//   system.ts     token system all sheets build on
//   theme.css     brutalist + dark mode values (CSS variables, switched by data-theme / data-mode on <html>)
//   layout.ts     page shell, nav, sections
//   components/   Card, Badge, Switch (adapted from the Toned UI example)
import { page, nav, section } from './layout.ts'
import { cardStyles } from './components/card.tsx'
import { badgeStyles } from './components/badge.tsx'
import { switchStyles } from './components/switch.tsx'

export { ui } from './system.ts'
export { page, nav, section }
export const sheets = [page, nav, section, cardStyles, badgeStyles, switchStyles]
