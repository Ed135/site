// Page layout sheets: shell, nav, section heading.
import { stylesheet } from './system'

// Side gutter steps up with the screen (4 = 16px, 6 = 24px, 10 = 40px, 16 = 64px).
// The nav sits outside the padded Inner, so it is full-bleed; its padding matches the gutter.
const gutter = (q: { media: (bp: 'md' | 'lg' | 'xl') => string }) =>
  ({ [q.media('md')]: { paddingX: 6 }, [q.media('lg')]: { paddingX: 10 }, [q.media('xl')]: { paddingX: 16 } }) as const

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
    ...gutter(q),
    [q.media('md')]: { gap: 10, paddingX: 6, paddingY: 6 },
  },
}))

export const nav = stylesheet((q) => ({
  Root: {
    $kind: 'view',
    display: 'flex',
    flexLayout: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 3,
    paddingX: 4,
    paddingY: 3,
    bgColor: 'subtle',
    borderColor: 'interactive',
    '@platform web': { $style: { position: 'sticky', top: 0, zIndex: 10, borderStyle: 'solid', borderWidth: '0 0 3px 0' } },
    ...gutter(q),
    [q.media('md')]: { paddingX: 6, gap: 4 },
  },
  // Right-hand cluster: links + theme switch.
  Group: { $kind: 'view', display: 'flex', flexLayout: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 3, [q.media('md')]: { gap: 4 } },
  Link: { $kind: 'view', display: 'inline-flex', alignItems: 'center', gap: 1.5, textColor: 'default', typography: 'label-large', textTransform: 'uppercase', textDecoration: 'none' },
  // Brand icon: hidden on large screens, where the text label is enough.
  Icon: { $kind: 'view', display: 'inline-flex', [q.media('lg')]: { display: 'none' } },
  // Text label: hidden on very small screens so only the icon shows.
  Label: { $kind: 'text', display: 'none', [q.media('sm40')]: { display: 'inline' } },
}))

// Page section heading (the Photos page title).
export const section = stylesheet((q) => ({
  Title: { $kind: 'text', typography: 'heading-2', textTransform: 'uppercase', textColor: 'default', textDecoration: 'none', ':hover': { textDecoration: 'underline' }, [q.media('md')]: { typography: 'heading-1' } },
}))
