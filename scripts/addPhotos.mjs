// Usage: npm run photos -- [--country=FR] <file-or-folder> [...]
// Compresses originals into photos/ as `YYYY-MM-DD_HHmm_WxH[_CC].jpg`:
//   - long edge 3600px, JPEG q90 (a few MB each, well inside GitHub's limits)
//   - EXIF is stripped (no GPS in the published file); the country code is read from the GPS first
//   - --country=XX forces the country for every file given (for photos with no GPS)
//   - re-adding a shot with the same date/time replaces the old copy
import fs from 'node:fs'
import path from 'node:path'
import exifr from 'exifr'
import sharp from 'sharp'
import { iso1A2Code } from '@rapideditor/country-coder'

const out = path.resolve(import.meta.dirname, '../photos')
const args = process.argv.slice(2)
const forced = args.find((a) => a.startsWith('--country='))?.slice(10).toUpperCase()
const inputs = args.filter((a) => !a.startsWith('--'))
if (!inputs.length) {
  console.error('Usage: npm run photos -- [--country=FR] <file-or-folder> [...]')
  process.exit(1)
}

const files = inputs.flatMap((p) => (fs.statSync(p).isDirectory() ? fs.readdirSync(p).map((f) => path.join(p, f)) : [p])).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))
const pad = (n) => String(n).padStart(2, '0')
fs.mkdirSync(out, { recursive: true })

for (const file of files) {
  const meta = (await exifr.parse(file, ['DateTimeOriginal', 'CreateDate']).catch(() => null)) ?? {}
  const gps = await exifr.gps(file).catch(() => undefined)
  const d = meta.DateTimeOriginal ?? meta.CreateDate ?? fs.statSync(file).mtime
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`
  const country = forced ?? (gps ? iso1A2Code([gps.longitude, gps.latitude]) : undefined)

  const { data, info } = await sharp(file).rotate().resize(3600, 3600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90, mozjpeg: true }).toBuffer({ resolveWithObject: true })
  for (const old of fs.readdirSync(out).filter((n) => n.startsWith(stamp + '_'))) fs.unlinkSync(path.join(out, old))
  const name = `${stamp}_${info.width}x${info.height}${country ? `_${country}` : ''}.jpg`
  fs.writeFileSync(path.join(out, name), data)
  console.log(`${path.basename(file)} -> ${name} (${(data.length / 1e6).toFixed(1)}MB${country ? '' : ', no GPS'})`)
}
