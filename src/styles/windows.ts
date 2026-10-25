// Window chrome shared by the terminal, map, photos tile, notes and code blocks, and the grids that lay them out.
// Palette comes from the --w-* tokens in theme.css; frame, spacing and shadow come from Toned tokens.
import type { Variants } from '@toned/core'
import { stylesheet } from './system'

const mono = (size: string) => `${size}/1.5 var(--mono)`

// Windows sit closer and cast a smaller shadow on phones (up to 600px); `wide` steps both up.
export const windowStyles = stylesheet((q) => ({
  stack: { $kind: 'view', display: 'grid', gap: 6, [q.media('wide')]: { gap: 8 } },
  row: {
    $kind: 'view',
    display: 'grid',
    gap: 6,
    [q.media('wide')]: { gap: 8 },
    '@platform web': { $style: { gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' } },
  },
  frame: {
    $kind: 'view',
    borderWidth: 'thick',
    borderColor: 'interactive',
    shadow: 'medium',
    '@platform web': { $style: { overflow: 'hidden', borderStyle: 'solid', borderRadius: '10px', background: 'var(--w-bg)' } },
    [q.media('wide')]: { shadow: 'large', '@platform web': { $style: { borderRadius: '12px' } } },
  },
  bar: {
    $kind: 'view',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingX: 3.5,
    paddingY: 2.5,
    '@platform web': { $style: { position: 'relative', font: '0.9rem/1.5 var(--mono)', background: 'var(--w-bar)', borderBottom: '1px solid var(--w-line)' } },
  },
  dots: { $kind: 'view', display: 'flex', gap: 2 },
  dot: { $kind: 'view', '@platform web': { $style: { width: '12px', height: '12px', padding: 0, border: 0, borderRadius: '50%', boxShadow: 'inset 0 0 0 1px rgb(0 0 0 / 0.25)' } } },
  // Where minimized windows wait: a floating pill fixed to the bottom of the screen, like the macOS Dock (motion is in theme.css).
  dock: {
    $kind: 'view',
    display: 'flex',
    flexLayout: 'row',
    justifyContent: 'center',
    gap: 1,
    padding: 1,
    '@platform web': {
      $style: {
        position: 'fixed',
        bottom: '8px',
        left: 0,
        right: 0,
        zIndex: 10,
        width: 'fit-content',
        maxWidth: 'calc(100% - 16px)',
        margin: '0 auto',
        flexWrap: 'wrap',
        font: '400 13px/1 var(--typo_font_sans)',
        background: 'color-mix(in srgb, var(--colors_bg_default) 72%, transparent)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid color-mix(in srgb, var(--colors_text_default) 22%, transparent)',
        borderRadius: '16px',
        boxShadow: '0 6px 20px rgb(0 0 0 / 0.25)',
      },
    },
  },
  dockItem: { $kind: 'view', textColor: 'default' }, // the stacked-tile look is in theme.css
  title: { $kind: 'text', '@platform web': { $style: { fontSize: '0.78rem', color: 'var(--w-muted)' } } },
})).variants(
  // term: terminal, map, photos tile. code: the editor (16px on phones so iOS doesn't zoom into it).
  // paper: Apple Notes, cream in both modes and in the page's own font rather than the window mono.
  ($: Variants<{ kind: 'term' | 'code' | 'paper' }>, q) => ({
    [$.kind('term')]: { frame: { '@platform web': { $style: { font: mono('0.82rem') } }, [q.media('wide')]: { '@platform web': { $style: { font: mono('0.9rem') } } } } },
    [$.kind('code')]: { frame: { '@platform web': { $style: { font: mono('16px') } }, [q.media('wide')]: { '@platform web': { $style: { font: mono('0.9rem') } } } } },
    [$.kind('paper')]: { frame: { '@platform web': { $style: { background: '#fffbe8', font: 'inherit' } } } },
  }),
  { defaults: { kind: 'term' } },
)
