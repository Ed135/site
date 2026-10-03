import { photosRepo as r } from './config.ts'

export type Photo = { name: string; url: string }

const api = `https://api.github.com/repos/${r.owner}/${r.repo}/contents/${r.dir}`

export async function listPhotos(): Promise<Photo[]> {
  const res = await fetch(`${api}?ref=${r.branch}`)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`)
  const items: { name: string; type: string; download_url: string }[] = await res.json()
  return items
    .filter((i) => i.type === 'file' && /\.(jpe?g|png|webp|gif)$/i.test(i.name))
    .map((i) => ({ name: i.name, url: i.download_url }))
    .sort((a, b) => b.name.localeCompare(a.name)) // newest first (names start with a timestamp)
}

// Downscale to keep the repo light: max 2000px on the long edge, JPEG.
async function toJpegBase64(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85))
  if (!blob) throw new Error('Could not encode image')
  const dataUrl = await new Promise<string>((ok) => {
    const reader = new FileReader()
    reader.onload = () => ok(reader.result as string)
    reader.readAsDataURL(blob)
  })
  return dataUrl.split(',')[1]
}

export async function uploadPhoto(file: File, token: string) {
  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
  const name = `${Date.now()}-${base || 'photo'}.jpg`
  const res = await fetch(`${api}/${name}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    body: JSON.stringify({ message: `Add photo ${name}`, content: await toJpegBase64(file), branch: r.branch }),
  })
  if (!res.ok) throw new Error(res.status === 401 || res.status === 403 || res.status === 404 ? 'Token rejected (needs Contents: read/write on this repo)' : `GitHub responded ${res.status}`)
}
