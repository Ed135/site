import { photos, flag } from './api'

// Home-page teaser for the gallery: an Apple Photos-style grid that runs off the bottom of the window, above a solid status bar.
export function PhotosTile() {
  const latest = photos.slice(0, 9)
  const codes = [...new Set(photos.map((p) => p.country).filter(Boolean))] as string[]
  return (
    <a className="term photo-tile" href="#/photos" aria-label={`Photos: ${photos.length} photos from ${codes.length} countries`}>
      <div className="term-bar">
        <span className="term-dots" aria-hidden><i /><i /><i /></span>
        <span className="term-title">~/photos — {photos.length} items</span>
      </div>
      <div className="photo-grid" aria-hidden>
        {latest.map((p) => <img key={p.name} src={p.thumb} alt="" loading="lazy" />)}
      </div>
      <div className="photo-status">
        <span><b>ls</b> photos/ · {codes.length} countries</span>
        <span className="photo-flags" aria-hidden>{codes.map((c) => flag(c)).join(' ')}</span>
        <span className="photo-open"><b>open ↵</b></span>
      </div>
    </a>
  )
}
