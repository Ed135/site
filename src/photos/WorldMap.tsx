import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flag } from './api'

const names = new Intl.DisplayNames('en', { type: 'region' })
export const countryName = (code: string) => { try { return names.of(code) ?? code } catch { return code } }

type Box = { x: number; y: number; w: number; h: number }
const WORLD: Box = { x: 0, y: 0, w: 360, h: 220 }
const PAN_GAIN = 1.2 // the map moves this many times the pointer distance
let RATIO = 1.8 // map shape, kept equal to the svg element's real width/height (set by a ResizeObserver below) so it never letterboxes

// Opening view. Wide screens frame every visited country (Spain to Japan), centred on all of them; a narrow (phone) map
// frames just the European ones, since the full span would be unreadably small there.
function fitBox(world: Record<string, string>, codes: string[]): Box {
  const bbox = (cs: string[]) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (const c of cs) {
      const n = (world[c] ?? '').match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
      for (let i = 0; i < n.length; i += 2) {
        x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i])
        y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1])
      }
    }
    return { x0, y0, x1, y1 }
  }
  // Europe in map units: lon -12..45 -> x 168..225, lat 30..72 -> y 10..85 (Mercator)
  const europe = codes.filter((c) => { const b = bbox([c]); const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2; return cx > 168 && cx < 225 && cy > 10 && cy < 85 })
  const narrow = RATIO < 1.4 && europe.length > 0
  const all = bbox(narrow ? europe : codes)
  if (!isFinite(all.x0)) return WORLD
  const w = Math.max((all.x1 - all.x0) * (narrow ? 1.3 : 1.08), (all.y1 - all.y0) * (narrow ? 1.3 : 1.08) * RATIO, narrow ? 36 : 50)
  return clamp({ x: (all.x0 + all.x1) / 2, y: (all.y0 + all.y1) / 2, w, h: w / RATIO }, true)
}

// Keep the box at the map's shape, no more than the whole world, and inside it. `centred`: x,y is the centre.
function clamp(b: Box, centred = false): Box {
  let { w, h } = b
  if (w / h > RATIO) h = w / RATIO
  else w = h * RATIO
  if (w > WORLD.w) { w = WORLD.w; h = w / RATIO }
  if (w < 20) { w = 20; h = w / RATIO }
  const x = centred ? b.x - w / 2 : b.x, y = centred ? b.y - h / 2 : b.y
  return { x: Math.max(0, Math.min(WORLD.w - w, x)), y: Math.max(0, Math.min(WORLD.h - h, y)), w, h }
}

// The ~180 background paths never change while panning, so keep React from re-rendering them on every pointer move.
// Only countries near the view are in the DOM (`win` is the view plus a margin), so paint cost follows the zoom, not the world.
const Land = memo(function Land({ world, skip, boxes, win }: { world: Record<string, string>; skip: Record<string, number>; boxes: Record<string, number[]>; win: Box }) {
  return (
    <>
      {Object.entries(world).map(([c, d]) => {
        const b = boxes[c]
        if (skip[c] || !b || b[2] < win.x || b[0] > win.x + win.w || b[3] < win.y || b[1] > win.y + win.h) return null
        return <path key={c} d={d} className="land" />
      })}
    </>
  )
})
// Map units per screen px. The svg letterboxes when its height is capped, so the limiting side sets the scale
// (using width alone made the map trail the cursor).
const unitsPerPx = (el: SVGSVGElement, b: Box) => {
  const r = el.getBoundingClientRect()
  return Math.max(b.w / (r.width || 1), b.h / (r.height || 1))
}
const around = (b: Box): Box => ({ x: b.x - b.w, y: b.y - b.h, w: b.w * 3, h: b.h * 3 })
const inside = (b: Box, w: Box) => b.x >= w.x && b.y >= w.y && b.x + b.w <= w.x + w.w && b.y + b.h <= w.y + w.h

// Click a visited country (or its chip) to filter the gallery to it; click again to clear.
// Drag to pan, pinch or the +/- buttons to zoom.
export function WorldMap({ counts, selected, onSelect }: { counts: Record<string, number>; selected?: string; onSelect: (code?: string) => void }) {
  const [world, setWorld] = useState<Record<string, string>>()
  const [box, setBox] = useState<Box>()
  const svg = useRef<SVGSVGElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const moved = useRef(false)
  const liveBox = useRef<Box | undefined>(undefined)
  const [win, setWin] = useState<Box>()
  const [ratio, setRatio] = useState(RATIO)
  const winRef = useRef<Box | undefined>(undefined)
  useEffect(() => { import('./world').then((m) => setWorld(m.world)) }, []) // ~330KB of paths: keep it out of the main bundle
  const visited = world ? Object.keys(counts).filter((c) => world[c]) : []
  const home = useMemo(() => (world ? fitBox(world, visited) : WORLD), [world, visited.join(), ratio])
  const boxes = useMemo(() => {
    const out: Record<string, number[]> = {}
    for (const [c, d] of Object.entries(world ?? {})) {
      const n = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
      for (let i = 0; i < n.length; i += 2) { x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]) }
      out[c] = [x0, y0, x1, y1]
    }
    return out
  }, [world])
  const vb = box ?? home
  const view = win && inside(vb, win) ? win : around(vb)
  winRef.current = view
  useLayoutEffect(() => { if (svg.current) { svg.current.style.setProperty('--k', String(unitsPerPx(svg.current, vb))); liveBox.current = vb } }, [vb, world])
  // Follow the element's shape: a tall, near-square map on phones, wide on desktop.
  useLayoutEffect(() => {
    const el = svg.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height || Math.abs(r.width / r.height - RATIO) < 0.02) return
      RATIO = r.width / r.height
      setRatio(RATIO)
      setBox(undefined)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [world, visited.length])
  // Picking a country (map or chip) flies the map to it; clearing goes back to the opening view.
  useEffect(() => {
    const b = selected && boxes[selected]
    if (!b) { setBox(undefined); return }
    const w = Math.max((b[2] - b[0]) * 1.5, (b[3] - b[1]) * 1.5 * RATIO, 24)
    setBox(clamp({ x: (b[0] + b[2]) / 2, y: (b[1] + b[3]) / 2, w, h: w / RATIO }, true))
  }, [selected, boxes])
  if (!world || !visited.length) return null

  const toggle = (c: string) => onSelect(selected === c ? undefined : c)
  // Panning writes the viewBox straight to the DOM (no React render per pointer move) and commits to state when the gesture ends.
  const live = () => box ?? home
  const apply = (b: Box) => {
    const el = svg.current
    if (!el) return
    el.setAttribute('viewBox', `${b.x} ${b.y} ${b.w} ${b.h}`)
    el.style.setProperty('--k', String(unitsPerPx(el, b))) // keeps stroke width steady
    liveBox.current = b
    if (!inside(b, winRef.current!)) setWin(around(b)) // panned past the rendered margin: bring in the countries ahead
  }
  const commit = () => { if (liveBox.current) setBox(liveBox.current) }
  const zoom = (f: number, cx?: number, cy?: number) => {
    const v = liveBox.current ?? live()
    cx ??= v.x + v.w / 2
    cy ??= v.y + v.h / 2
    const w = v.w * f, h = v.h * f
    apply(clamp({ x: cx - ((cx - v.x) / v.w) * w, y: cy - ((cy - v.y) / v.h) * h, w, h }))
    commit()
  }
  const pinch = () => { const [a, b] = [...pointers.current.values()]; return Math.hypot(a.x - b.x, a.y - b.y) }

  const down = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    moved.current = false
    liveBox.current = live()
  }
  const move = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev || !liveBox.current) return
    const v = liveBox.current
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y
    if (pointers.current.size === 2) {
      const before = pinch()
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const r = svg.current!.getBoundingClientRect()
      const [a, b] = [...pointers.current.values()]
      if (before) zoom(before / pinch(), v.x + (((a.x + b.x) / 2 - r.left) / r.width) * v.w, v.y + (((a.y + b.y) / 2 - r.top) / r.height) * v.h)
      moved.current = true
      return
    }
    if (!moved.current && Math.hypot(dx, dy) < 4) return
    if (!moved.current) svg.current?.setPointerCapture(e.pointerId)
    moved.current = true
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const k = unitsPerPx(svg.current!, v) * PAN_GAIN
    apply(clamp({ ...v, x: v.x - dx * k, y: v.y - dy * k }))
  }
  const up = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (moved.current) commit()
  }
  const press = (c: string) => { if (!moved.current) toggle(c) }

  return (
    <div className="trip-map">
      <div className="trip-stage">
        <svg
          ref={svg}
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          role="group"
          aria-label="Map of countries photographed. Drag to move, pinch or use the buttons to zoom."
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onClick={(e) => { if (!moved.current && !(e.target as Element).closest('.visited')) onSelect(undefined) }} // click off a country to deselect
        >
          <Land world={world} skip={counts} boxes={boxes} win={view} />
          {visited.map((c) => (
            <path
              key={c}
              d={world[c]}
              className={`land visited${selected === c ? ' on' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={selected === c}
              aria-label={`${countryName(c)}, ${counts[c]} photos`}
              onClick={() => press(c)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(c) } }}
            >
              <title>{`${countryName(c)} · ${counts[c]}`}</title>
            </path>
          ))}
        </svg>
        <div className="trip-ctl">
          <button type="button" aria-label="Zoom in" onClick={() => zoom(0.6)}>+</button>
          <button type="button" aria-label="Zoom out" onClick={() => zoom(1 / 0.6)}>−</button>
          <button type="button" aria-label="Reset map" onClick={() => { setBox(undefined); apply(home) }}>◎</button>
        </div>
        <span className="trip-scale" aria-hidden>{Math.round(360 / vb.w * 10) / 10}×</span>
      </div>
      <div className="trip-chips">
        {visited.map((c) => (
          <button key={c} type="button" aria-pressed={selected === c} className={selected === c ? 'on' : undefined} onClick={() => toggle(c)}>
            {flag(c)} {countryName(c)} · {counts[c]}
          </button>
        ))}
        {selected && <button type="button" onClick={() => onSelect(undefined)}>✕ All</button>}
      </div>
    </div>
  )
}
