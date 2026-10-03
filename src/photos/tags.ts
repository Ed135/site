// Where photos were taken, for the flag on each tile. Order of precedence:
//   1. countryTags  - one photo, by the start of its file name `YYYY-MM-DD_HHmm`
//   2. a code in the file name (read from GPS by `npm run photos`)
//   3. tripRanges   - every photo whose date falls in a range (inclusive, `YYYY-MM-DD`)
// Add a line per trip and every photo from it is covered.
export const tripRanges: { from: string; to: string; country: string }[] = [
  { from: '2026-08-12', to: '2026-08-12', country: 'RO' },
  { from: '2026-08-13', to: '2026-08-31', country: 'FR' },
  { from: '2026-09-01', to: '2026-09-30', country: 'ES' },
]

// Single-photo overrides, e.g. '2026-08-18_1454': 'GB',
export const countryTags: Record<string, string> = {}

export const countryFor = (name: string, fromFile?: string) => {
  const day = name.slice(0, 10)
  return countryTags[name.slice(0, 15)] ?? fromFile ?? tripRanges.find((r) => day >= r.from && day <= r.to)?.country
}
