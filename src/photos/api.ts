import { photosRepo as r } from './config'
import { countryFor } from './tags'

// File names carry the metadata: `YYYY-MM-DD_HHmm_WxH[_CC][-slug].jpg`
// (date and time taken, pixel size, optional country code; sorts newest first).
// Add photos with `npm run photos -- <folder>`, which also reads the country from GPS and strips EXIF.
// Countries can also be set by trip date range or per photo: see tags.ts.
export type Photo = { name: string; url: string; thumb: string; date?: Date; width?: number; height?: number; country?: string }

// Photos are bundled at build time from the repo's `photos/` folder, so the gallery works
// locally and on Pages with no API calls. Thumbnails keep the grid light; the viewer loads the full file.
const full = import.meta.glob('../../photos/*.{jpg,jpeg,png,webp,gif}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const thumbs = import.meta.glob('../../photos/*.{jpg,jpeg,png,webp,gif}', { eager: true, query: '?w=900&format=jpg', import: 'default' }) as Record<string, string>

function parse(name: string, url: string, thumb: string): Photo {
  const m = name.match(/^(\d{4})-(\d{2})-(\d{2})_\d{4}_(\d+)x(\d+)(?:_([A-Z]{2}))?/)
  if (!m) return { name, url, thumb }
  return { name, url, thumb, date: new Date(+m[1], +m[2] - 1, +m[3]), width: +m[4], height: +m[5], country: countryFor(name, m[6]) }
}

export const photos: Photo[] = Object.entries(full)
  .map(([path, url]) => parse(path.split('/').pop()!, url, thumbs[path]))
  .sort((a, b) => b.name.localeCompare(a.name)) // newest first

// Country code -> flag emoji (regional indicator letters).
export const flag = (code?: string) => (code ? String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : undefined)

// Photos grouped by month, newest month first (photos are already sorted newest first).
export const groups = photos.reduce<{ key: string; label: string; items: { photo: Photo; index: number }[] }[]>((acc, photo, index) => {
  const key = photo.date ? `${photo.date.getFullYear()}-${photo.date.getMonth()}` : 'undated'
  const label = photo.date ? photo.date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'Undated'
  let g = acc.find((x) => x.key === key)
  if (!g) acc.push((g = { key, label, items: [] }))
  g.items.push({ photo, index })
  return acc
}, [])

export const formatDate = (d?: Date) => d?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const api = `https://api.github.com/repos/${r.owner}/${r.repo}/contents/${r.dir}`

// Downscale to keep the repo light: max 2560px on the long edge, JPEG.
async function toJpeg(file: File): Promise<{ base64: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.9))
  if (!blob) throw new Error('Could not encode image')
  const dataUrl = await new Promise<string>((ok) => {
    const reader = new FileReader()
    reader.onload = () => ok(reader.result as string)
    reader.readAsDataURL(blob)
  })
  return { base64: dataUrl.split(',')[1], width: canvas.width, height: canvas.height }
}

export async function uploadPhoto(file: File, token: string) {
  const { base64, width, height } = await toJpeg(file)
  const d = new Date(file.lastModified) // camera files keep the capture time here
  const p = (n: number) => String(n).padStart(2, '0')
  const slug = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
  const name = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}_${width}x${height}-${slug || 'photo'}.jpg`
  const res = await fetch(`${api}/${name}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    body: JSON.stringify({ message: `Add photo ${name}`, content: base64, branch: r.branch }),
  })
  if (!res.ok) throw new Error(res.status === 401 || res.status === 403 || res.status === 404 ? 'Token rejected (needs Contents: read/write on this repo)' : `GitHub responded ${res.status}`)
}
