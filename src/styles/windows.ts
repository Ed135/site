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
  dot: { $kind: 'view', '@platform web': { $style: { width: '12px', height: '12px', borderRadius: '50%', boxShadow: 'inset 0 0 0 1px rgb(0 0 0 / 0.25)' } } },
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
