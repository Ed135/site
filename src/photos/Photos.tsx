import { useCallback, useEffect, useState } from 'react'
import { createElements } from '@toned/react'
import { gallery } from '../styles/index.ts'
import { Card, CardTitle, CardDescription } from '../styles/components/Card.tsx'
import { listPhotos, uploadPhoto, type Photo } from './api.ts'
import { photosRepo } from './config.ts'

const G = createElements(gallery)
const TOKEN_KEY = 'gh-photos-token'
const read = () => { try { return localStorage.getItem(TOKEN_KEY) ?? '' } catch { return '' } }

export function Photos({ upload }: { upload: boolean }) {
  const [photos, setPhotos] = useState<Photo[]>()
  const [error, setError] = useState('')
  const refresh = useCallback(() => listPhotos().then(setPhotos).catch((e) => setError(String(e.message ?? e))), [])
  useEffect(() => { refresh() }, [refresh])

  return (
    <>
      {upload && <Uploader onDone={refresh} />}
      {error && <Card><CardDescription>Could not load photos: {error}</CardDescription></Card>}
      {photos?.length === 0 && (
        <Card>
          <CardTitle>No photos yet</CardTitle>
          <CardDescription>Drop some in from the upload page.</CardDescription>
        </Card>
      )}
      {!!photos?.length && (
        <G>
          <G.Grid>
            {photos.map((p) => (
              <G.Frame key={p.name}>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  <img src={p.url} alt="" loading="lazy" style={{ display: 'block', width: '100%', height: 'auto' }} />
                </a>
              </G.Frame>
            ))}
          </G.Grid>
        </G>
      )}
    </>
  )
}

function Uploader({ onDone }: { onDone: () => void }) {
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
        setLog((l) => [...l, `✓ ${f.name}`])
      } catch (e) {
        setLog((l) => [...l, `✗ ${f.name}: ${(e as Error).message}`])
      }
    }
    onDone()
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
