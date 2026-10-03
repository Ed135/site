// Photography page: gallery grid and upload dropzone.
import { stylesheet } from './system.ts'
import type { Variants } from '@toned/core'

export const gallery = stylesheet((q) => ({
  // Masonry via CSS columns: mixed portrait/landscape photos keep their own ratio without gaps.
  Grid: { $kind: 'view', '@platform web': { $style: { columnWidth: '280px', columnGap: '16px' } } },
  Frame: { $kind: 'view', bgColor: 'elevated', borderWidth: 'thick', borderColor: 'interactive', shadow: 'medium', '@platform web': { $style: { overflow: 'hidden', breakInside: 'avoid', marginBottom: '16px' } } },
  Panel: { $kind: 'view', display: 'flex', flexLayout: 'column', gap: 3, padding: 5, bgColor: 'subtle', borderWidth: 'thick', borderColor: 'interactive', shadow: 'medium' },
  Drop: { $kind: 'view', display: 'flex', flexLayout: 'column', alignItems: 'center', justifyContent: 'center', padding: 5, [q.media('md')]: { padding: 10 }, textColor: 'default', typography: 'label-large', textTransform: 'uppercase', borderWidth: 'thick', borderColor: 'interactive', '@platform web': { $style: { borderStyle: 'dashed', cursor: 'pointer' } } },
  Field: { $kind: 'view', padding: 2, bgColor: 'elevated', textColor: 'default', typography: 'body-medium', borderWidth: 'thick', borderColor: 'interactive', borderRadius: 'none' },
})).variants(
  ($: Variants<{ over: boolean }>) => ({
    [$.over(true)]: { Drop: { bgColor: 'status_warning', textColor: 'on_status_warning' } },
  }),
  { defaults: { over: false } },
)
