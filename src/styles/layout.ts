// Page layout sheets: shell, nav, section heading.
import { stylesheet } from './system'

export const page = stylesheet((q) => ({
  Root: { $kind: 'view', bgColor: 'default' },
  Inner: {
    $kind: 'view',
    display: 'flex',
    flexLayout: 'column',
    gap: 6,
    maxWidth: '100%',
    paddingX: 4,
    paddingY: 4,
    [q.media('md')]: { gap: 10, paddingX: 6, paddingY: 6 },
  },
}))

// The nav is a macOS menu bar: translucent, full width, system type; app name and menus left, status items and clock right.
export const nav = stylesheet((q) => ({
  Root: {
    $kind: 'view',
    display: 'flex',
    flexLayout: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingX: 2,
    textColor: 'default',
    '@platform web': {
      $style: {
        position: 'sticky',
        top: 0,
        zIndex: 10,
        font: '400 13px/1 var(--typo_font_sans)',
        background: 'color-mix(in srgb, var(--colors_bg_default) 72%, transparent)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid color-mix(in srgb, var(--colors_text_default) 18%, transparent)',
      },
    },
  },
  Start: { $kind: 'view', display: 'flex', flexLayout: 'row', alignItems: 'center' },
  Group: { $kind: 'view', display: 'flex', flexLayout: 'row', alignItems: 'center' },
  // A menu-bar slot: icon, text menu or the bold app name. Hover fill is in theme.css (it follows light/dark).
  Item: {
    $kind: 'view',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textColor: 'default',
    textDecoration: 'none',
    '@platform web': { $style: { boxSizing: 'border-box', height: '26px', minWidth: '26px', padding: '0 4px', border: 0, borderRadius: '4px', font: 'inherit', cursor: 'pointer' } },
  },
  Name: { $kind: 'text', '@platform web': { $style: { fontWeight: 700 } } },
  // The clock needs room, so phones drop it.
  Clock: { $kind: 'text', display: 'none', [q.media('wide')]: { display: 'inline' } },
}))

// Page section heading (the Photos page title).
export const section = stylesheet((q) => ({
  Title: { $kind: 'text', typography: 'heading-2', textTransform: 'uppercase', textColor: 'default', textDecoration: 'none', ':hover': { textDecoration: 'underline' }, [q.media('md')]: { typography: 'heading-1' } },
}))
