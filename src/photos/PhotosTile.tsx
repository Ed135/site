import { Window } from '../Window'
import { photos, flag } from './api'

// Home-page teaser for the gallery: an Apple Photos-style grid that runs off the bottom of the window, above a solid status bar.
export function PhotosTile() {
  const latest = photos.slice(0, 9)
  const codes = [...new Set(photos.map((p) => p.country).filter(Boolean))] as string[]
  return (
    <Window as="a" icon="photos" className="photo-tile" href="#/photos" title={`~/photos — ${photos.length} items`} aria-label={`Photos: ${photos.length} photos from ${codes.length} countries`}>
      <div className="photo-grid" aria-hidden>
        {latest.map((p) => <img key={p.name} src={p.thumb} alt="" loading="lazy" />)}
      </div>
      <div className="photo-status">
        <span><b>ls</b> photos/ · {codes.length} countries</span>
        <span className="photo-flags" aria-hidden>{codes.map((c) => flag(c)).join(' ')}</span>
        <span className="photo-open"><b>open ↵</b></span>
      </div>
    </Window>
  )
}
