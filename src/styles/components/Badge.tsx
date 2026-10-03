// Badge, adapted from the Toned UI example.
import { useStyles } from '@toned/react'
import type * as React from 'react'
import { stylesheet } from '../system'

export const badgeStyles = stylesheet({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingX: 3,
    paddingY: 1.5,
    bgColor: 'elevated',
    textColor: 'default',
    borderWidth: 'thick',
    borderColor: 'interactive',
    borderRadius: 'none',
    shadow: 'small',
    typography: 'label-large',
    textTransform: 'uppercase',
  },
})

export function Badge({ className, style, ...props }: React.ComponentProps<'span'>) {
  const s = useStyles(badgeStyles)
  return <span {...s.root.with({ className, style })} {...props} />
}
