import { useEffect, useId, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import type * as React from 'react'
import { useStyles } from '@toned/react'
import { windowStyles } from './styles'

type Props<T extends React.ElementType> = { as?: T } & Omit<React.ComponentPropsWithoutRef<T>, 'as'>

// Vertical stack of windows, and a responsive row of them.
export function WindowStack({ as: Tag = 'div', className, style, ...props }: Props<React.ElementType>) {
  const s = useStyles(windowStyles)
  return <Tag {...s.stack.with({ className, style })} {...props} />
}
export function WindowRow({ className, style, ...props }: React.ComponentProps<'div'>) {
  const s = useStyles(windowStyles)
  return <div {...s.row.with({ className, style })} {...props} />
}

// Minimized windows (dock label and icon per window id) and how many windows are on screen. A new snapshot per change so
// useSyncExternalStore sees it.
let minimized: { id: string; label: string; icon?: string }[] = []
let mounted = 0
let snapshot = { items: minimized, all: false }
const listeners = new Set<() => void>()
const emit = () => {
  snapshot = { items: minimized, all: mounted > 0 && minimized.length >= mounted }
  listeners.forEach((l) => l())
}
const setMinimized = (next: typeof minimized) => {
  minimized = next
  emit()
}
const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l))
const restore = (id: string) => setMinimized(minimized.filter((m) => m.id !== id))

// Every mounted window's minimize, so the nav can tuck them all away (staggered a little, like a shuffle).
const minimizers = new Map<string, () => void>()
export const minimizeAll = () => [...minimizers.values()].forEach((m, i) => setTimeout(m, i * 80))

// Where the genie animation points: the dock's centre. A restore uses the pressed dock entry instead.
let from: { x: number; y: number } | undefined
const towardDock = (frame: HTMLElement, x: number, y: number) => {
  const r = frame.getBoundingClientRect()
  frame.style.setProperty('--dx', `${x - (r.left + r.width / 2)}px`)
  frame.style.setProperty('--dy', `${y - (r.top + r.height / 2)}px`)
}

// A pixel-art invader for the empty-desktop screensaver: legs shuffle between two frames and the googly eyes look about.
const body = ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#']
const Invader = () => (
  <svg viewBox="0 0 11 8" shapeRendering="crispEdges" fill="currentColor" aria-hidden>
    {body.flatMap((row, y) => [...row].map((c, x) => c === '#' && <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />))}
    <g className="inv-a"><path d="M3 7h2v1H3zM6 7h2v1H6z" /></g>
    <g className="inv-b"><path d="M2 7h1v1H2zM8 7h1v1H8z" /></g>
    {[3, 7].map((x) => (
      <g key={x}>
        <rect x={x} y={3} width={1} height={1} fill="#fff" />
        <rect className="inv-pupil" x={x} y={3.25} width={0.5} height={0.5} fill="#111" />
      </g>
    ))}
  </svg>
)

// The macOS-style dock for minimized windows: press one to put it back where it was. With every window minimized the
// desktop is empty, so a bouncing "ed" screensaver takes over until something is restored.
export function Dock() {
  const s = useStyles(windowStyles)
  const { items, all } = useSyncExternalStore(subscribe, () => snapshot)
  if (!items.length) return null
  return (
    <>
    {all && (
      <div className="saver">
        <div className="saver-logo"><Invader /></div>
        <p>nobody's home — the invaders took the desktop</p>
        <button type="button" onClick={() => { from = undefined; setMinimized([]) }}>restore all</button>
      </div>
    )}
    <div {...s.dock.with({ className: 'dock' })} role="toolbar" aria-label="Minimized windows">
      {items.map((m) => (
        <button
          key={m.id}
          type="button"
          data-icon={m.icon}
          {...s.dockItem.with({})}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            from = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
            restore(m.id)
          }}
        >
          <span>{m.label}</span>
        </button>
      ))}
    </div>
    <div style={{ height: 56 }} aria-hidden /> {/* the dock is fixed, so keep the page's last row clear of it */}
    </>
  )
}

// The three traffic-light dots and the muted centred title of a window's title bar. Yellow minimizes.
function Dots({ style, onMinimize }: { style?: React.CSSProperties; onMinimize?: (e: React.MouseEvent) => void }) {
  const s = useStyles(windowStyles)
  const dot = (c: string) => ({ style: { background: c } })
  return (
    <span {...s.dots.with({ style })}>
      <i {...s.dot.with(dot('#ff5f57'))} aria-hidden />
      <button type="button" aria-label="Minimize" onClick={onMinimize} {...s.dot.with({ ...dot('#febc2e'), style: { background: '#febc2e', cursor: 'pointer' } })} />
      <i {...s.dot.with(dot('#28c840'))} aria-hidden />
    </span>
  )
}
function BarTitle({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) {
  const s = useStyles(windowStyles)
  return <span {...s.title.with({ style })}>{children}</span>
}

// A window: frame, title bar (traffic lights, centred title, optional trailing control) and its content.
export function Window({
  as: Tag = 'div',
  title,
  label,
  icon,
  action,
  kind = 'term',
  className,
  style,
  children,
  ...props
}: Props<React.ElementType> & { title: React.ReactNode; label?: string; icon?: string; action?: React.ReactNode; kind?: 'term' | 'code' | 'paper' }) {
  const s = useStyles(windowStyles, { kind })
  const id = useId()
  const hidden = useSyncExternalStore(subscribe, () => minimized.some((m) => m.id === id))
  const minimize = () => {
    if (minimized.some((m) => m.id === id)) return
    const add = () => setMinimized([...minimized, { id, icon, label: label ?? (typeof title === 'string' ? title : 'window') }])
    const frame = document.querySelector<HTMLElement>(`[data-win="${id}"]`)
    if (!frame || matchMedia('(prefers-reduced-motion: reduce)').matches) return add()
    // Funnel toward the dock first, then hand over to the dock.
    towardDock(frame, innerWidth / 2, innerHeight - 30)
    frame.classList.remove('win-restore')
    frame.classList.add('win-min')
    frame.addEventListener('animationend', add, { once: true })
  }
  const minimizeRef = useRef(minimize)
  minimizeRef.current = minimize
  useEffect(() => {
    minimizers.set(id, () => minimizeRef.current())
    return () => void minimizers.delete(id)
  }, [id])
  // Count the window while it is on the page; leaving the page also drops its dock entry.
  useEffect(() => {
    mounted++
    emit()
    return () => {
      mounted--
      restore(id)
    }
  }, [id])
  // Coming back from the dock the window funnels out of the pressed entry (see .win-restore in theme.css).
  const wasHidden = useRef(false)
  useLayoutEffect(() => {
    if (wasHidden.current && !hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = document.querySelector<HTMLElement>(`[data-win="${id}"]`)
      if (frame) {
        const o = from ?? { x: innerWidth / 2, y: innerHeight - 30 }
        towardDock(frame, o.x, o.y)
        frame.classList.add('win-restore')
      }
    }
    wasHidden.current = hidden
  }, [hidden, id])
  // Hidden, not unmounted: the content's state stays put and it reappears in the same spot in the layout.
  if (hidden) return null
  return (
    <Tag data-win={id} {...s.frame.with({ className: [kind === 'paper' ? 'win-paper' : 'win', className].filter(Boolean).join(' '), style })} {...props}>
      <div {...s.bar.with({})}>
        <Dots
          style={{ position: 'absolute', left: 14 }}
          onMinimize={(e) => {
            e.preventDefault() // the photos tile is a link
            e.stopPropagation()
            minimize()
          }}
        />
        <BarTitle>{title}</BarTitle>
        {action}
      </div>
      {children}
    </Tag>
  )
}
