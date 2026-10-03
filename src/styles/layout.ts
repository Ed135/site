// Page layout sheets: shell, nav, sections.
import { stylesheet } from './system.ts'

// Responsive card grid; Toned has no grid-track token, so it's a web-only style.
const grid = (min: number) =>
  ({ display: 'grid', gap: 4, '@platform web': { $style: { gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))` } } }) as const

const rule = (width: string) =>
  ({ borderColor: 'interactive', '@platform web': { $style: { borderStyle: 'solid', borderWidth: width } } }) as const

export const page = stylesheet({
  Root: { $kind: 'view', bgColor: 'default', paddingX: 6, paddingY: 6 },
  Inner: { $kind: 'view', display: 'flex', flexLayout: 'column', gap: 10, maxWidth: '100%' },
})

export const nav = stylesheet({
  Root: { $kind: 'view', display: 'flex', flexLayout: 'row', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 4, paddingX: 6, paddingY: 3, bgColor: 'subtle', ...rule('0 0 3px 0'), '@platform web': { $style: { position: 'sticky', top: 0, zIndex: 10, marginLeft: '-24px', marginRight: '-24px', marginTop: '-24px', borderStyle: 'solid', borderWidth: '0 0 3px 0' } } },
  Link: { $kind: 'text', typography: 'label-large', textTransform: 'uppercase', textColor: 'default' },
})

export const section = stylesheet({
  Root: { $kind: 'view', display: 'flex', flexLayout: 'column', gap: 4 },
  Title: { $kind: 'text', typography: 'heading-1', textTransform: 'uppercase', textColor: 'default', textDecoration: 'none', ':hover': { textDecoration: 'underline' } },
  Grid: { $kind: 'view', ...grid(300) },
  Split: { $kind: 'view', ...grid(320), gap: 6 },
  Tags: { $kind: 'view', display: 'flex', flexLayout: 'row', flexWrap: 'wrap', gap: 3 },
})
