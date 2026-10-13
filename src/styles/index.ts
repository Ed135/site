// Styling entry. Sheets listed here are compiled to CSS by the Vite plugin (see vite.config.ts).
//   system.ts     token system all sheets build on
//   theme.css     brutalist + dark mode values (CSS variables, switched by data-theme / data-mode on <html>)
//   layout.ts     page shell, nav, sections
//   photos.ts     photography page: gallery grid + upload dropzone
//   windows.ts    macOS-style window frame, title bar and the grids that lay windows out
//   components/   Card, Icons (adapted from the Toned UI example)
import { page, nav, section } from './layout'
import { gallery } from './photos'
import { windowStyles } from './windows'
import { cardStyles } from './components/Card'

export { ui } from './system'
export { page, nav, section, gallery, windowStyles }
export const sheets = [page, nav, section, gallery, windowStyles, cardStyles]
