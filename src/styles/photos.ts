// Photography page: gallery grid and upload dropzone.
import { stylesheet } from './system.ts'
import type { Variants } from '@toned/core'

export const gallery = stylesheet((q) => ({
  // Justified rows: each tile grows by its aspect ratio so rows fill the width with no gaps.
  Grid: { $kind: 'view', display: 'flex', flexWrap: 'wrap', gap: 4 },
  Frame: { $kind: 'view', bgColor: 'elevated', borderWidth: 'thick', borderColor: 'interactive', shadow: 'medium', '@platform web': { $style: { position: 'relative', overflow: 'hidden' } } },
  // Date badge tucked into the bottom-left corner of a photo.
  Date: { $kind: 'text', paddingX: 2, paddingY: 1, bgColor: 'elevated', textColor: 'default', typography: 'label-small', textTransform: 'uppercase', borderWidth: 'thick', borderColor: 'interactive', borderRadius: 'none', '@platform web': { $style: { position: 'absolute', left: 0, bottom: 0, borderLeftWidth: 0, borderBottomWidth: 0, pointerEvents: 'none' } } },
  Panel: { $kind: 'view', display: 'flex', flexLayout: 'column', gap: 3, padding: 5, bgColor: 'subtle', borderWidth: 'thick', borderColor: 'interactive', shadow: 'medium' },
  Drop: { $kind: 'view', display: 'flex', flexLayout: 'column', alignItems: 'center', justifyContent: 'center', padding: 5, [q.media('md')]: { padding: 10 }, textColor: 'default', typography: 'label-large', textTransform: 'uppercase', borderWidth: 'thick', borderColor: 'interactive', '@platform web': { $style: { borderStyle: 'dashed', cursor: 'pointer' } } },
  // Thumbnail button: resets button chrome so the photo fills the frame.
  Thumb: { $kind: 'pressable', '@platform web': { $style: { display: 'block', width: '100%', padding: 0, border: 0, background: 'none', cursor: 'zoom-in' } } },
  // Full-screen viewer: dimmed backdrop, click outside the photo to close.
  Overlay: { $kind: 'view', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, bgColor: 'overlay', '@platform web': { $style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, cursor: 'zoom-out' } } },
  Close: { $kind: 'pressable', paddingX: 3, paddingY: 1.5, bgColor: 'status_warning', textColor: 'on_status_warning', typography: 'label-large', borderWidth: 'thick', borderColor: 'interactive', borderRadius: 'none', shadow: 'small', '@platform web': { $style: { position: 'absolute', top: '16px', right: '16px', cursor: 'pointer' } } },
  // One block per month: heading, then its justified rows.
  Groups: { $kind: 'view', display: 'flex', flexLayout: 'column', gap: 8 },
  Group: { $kind: 'view', display: 'flex', flexLayout: 'column', gap: 3 },
  Month: { $kind: 'text', typography: 'heading-3', textTransform: 'uppercase', textColor: 'default' },
  // Country flag tucked into the top-right corner of a photo.
  Flag: { $kind: 'text', paddingX: 2, paddingY: 1, bgColor: 'elevated', typography: 'label-large', borderWidth: 'thick', borderColor: 'interactive', borderRadius: 'none', '@platform web': { $style: { position: 'absolute', right: 0, top: 0, borderRightWidth: 0, borderTopWidth: 0, pointerEvents: 'none' } } },
  Field: { $kind: 'view', padding: 2, bgColor: 'elevated', textColor: 'default', typography: 'body-medium', borderWidth: 'thick', borderColor: 'interactive', borderRadius: 'none' },
})).variants(
  ($: Variants<{ over: boolean }>) => ({
    [$.over(true)]: { Drop: { bgColor: 'status_warning', textColor: 'on_status_warning' } },
  }),
  { defaults: { over: false } },
)
