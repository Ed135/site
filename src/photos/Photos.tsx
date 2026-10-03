import { useEffect, useRef, useState } from 'react'
import { createElements } from '@toned/react'
import { gallery } from '../styles'
import { Card, CardTitle, CardDescription } from '../styles/components/Card'
import { photos, groups, flag, formatDate, uploadPhoto, type Photo } from './api'
import { photosRepo, camera } from './config'

const G = createElements(gallery)
// No tile is taller than this, portrait or landscape (matches a typical landscape row).
const MAX_ROW_HEIGHT = 250
const TOKEN_KEY = 'gh-photos-token'
const read = () => { try { return localStorage.getItem(TOKEN_KEY) ?? '' } catch { return '' } }

export function Photos({ upload }: { upload: boolean }) {
  const [open, setOpen] = useState<Photo>()
  const opener = useRef<Element | null>(null)

  const show = (p: Photo, el: Element) => {
    opener.current = el // Safari doesn't focus buttons on click, so remember the button itself
    setOpen(p)
  }
  const close = () => {
    setOpen(undefined)
    ;(opener.current as HTMLElement | null)?.focus()
  }

  return (
    <>
      <Card compact>
        <CardDescription>📸 {camera}</CardDescription>
      </Card>
      {upload && <Uploader />}
      {photos.length === 0 && (
        <Card>
          <CardTitle>No photos yet</CardTitle>
          <CardDescription>Drop some in from the upload page.</CardDescription>
        </Card>
      )}
      {photos.length > 0 && (
        <G>
          <G.Groups>
            {groups.map((g) => (
              <G.Group key={g.key}>
                <G.Month as="h3">{g.label}</G.Month>
                <G.Grid>
                  {g.items.map(({ photo: p, index: i }) => {
                    const ratio = p.width && p.height ? p.width / p.height : 1.5
                    return (
                      // flex-grow by aspect ratio keeps tiles in a row the same height; maxWidth caps every tile at MAX_ROW_HEIGHT tall
                      <G.Frame key={p.name} style={{ flex: `${ratio * 100} 1 ${ratio * 240}px`, maxWidth: ratio * MAX_ROW_HEIGHT }}>
                        <G.Thumb as="button" type="button" onClick={(e: React.MouseEvent) => show(p, e.currentTarget)} aria-label={`Open photo ${i + 1}${p.date ? `, ${formatDate(p.date)}` : ''}`}>
                          <img src={p.thumb} alt={`Photo ${i + 1}`} loading="lazy" style={{ display: 'block', width: '100%', height: 'auto' }} />
                        </G.Thumb>
                        {p.date && <G.Date as="span">{formatDate(p.date)}</G.Date>}
                        {p.country && <G.Flag as="span" aria-hidden>{flag(p.country)}</G.Flag>}
                      </G.Frame>
                    )
                  })}
                </G.Grid>
              </G.Group>
            ))}
          </G.Groups>
        </G>
      )}
      {open && <Viewer photo={open} onClose={close} />}
    </>
  )
}

// Fill the largest box that fits (94vw x 88vh) at the photo's ratio, so portrait shots are as big as landscape ones.
// Small source images are upscaled, so they look softer.
function fit({ width, height }: Photo): React.CSSProperties {
  const base = { display: 'block', cursor: 'default' } as const
  if (!width || !height) return { ...base, maxWidth: '94vw', maxHeight: '88vh', objectFit: 'contain' }
  return { ...base, width: `min(94vw, calc(88vh * ${width / height}))`, height: 'auto' }
}

// Near-full-screen viewer: click the backdrop, press Esc, or use the X to close.
function Viewer({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    addEventListener('keydown', onKey)
    closeBtn.current?.focus()
    return () => {
      removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <G>
      <G.Overlay role="dialog" aria-modal="true" aria-label="Photo" onClick={onClose}>
        <G.Frame onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <img src={photo.url} alt="" style={fit(photo)} />
          {photo.date && <G.Date as="span">{formatDate(photo.date)}</G.Date>}
        </G.Frame>
        <G.Close as="button" type="button" ref={closeBtn} onClick={onClose} aria-label="Close photo">✕</G.Close>
      </G.Overlay>
    </G>
  )
}

function Uploader() {
  const [token, setToken] = useState(read)
  const [over, setOver] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const saveToken = (v: string) => {
    setToken(v)
    try { localStorage.setItem(TOKEN_KEY, v) } catch {}
  }

  const send = async (files: FileList | File[]) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'))
    for (const f of list) {
      setLog((l) => [...l, `Uploading ${f.name}…`])
      try {
        await uploadPhoto(f, token)
        setLog((l) => [...l, `✓ ${f.name} (live after the next deploy, about a minute)`])
      } catch (e) {
        setLog((l) => [...l, `✗ ${f.name}: ${(e as Error).message}`])
      }
    }
  }

  return (
    <G over={over}>
      <G.Panel>
        <CardDescription>
          GitHub token (fine-grained, Contents read/write on {photosRepo.owner}/{photosRepo.repo}). Stored only in this browser.
        </CardDescription>
        <G.Field as="input" type="password" value={token} placeholder="github_pat_…" onChange={(e: React.ChangeEvent<HTMLInputElement>) => saveToken(e.target.value)} />
        <G.Drop
          as="label"
          onDragOver={(e: React.DragEvent) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={(e: React.DragEvent) => { e.preventDefault(); setOver(false); if (token) send(e.dataTransfer.files) }}
        >
          {token ? 'Drop photos here or click to choose' : 'Add a token first'}
          <input type="file" accept="image/*" multiple hidden disabled={!token} onChange={(e) => { if (e.target.files) send(e.target.files) }} />
        </G.Drop>
        {log.map((l, i) => <CardDescription key={i}>{l}</CardDescription>)}
      </G.Panel>
    </G>
  )
}
