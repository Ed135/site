// Card, adapted from the Toned UI example (toned-styles/toned/examples/ui): a bordered, shadowed box with a title and description.
import { useStyles } from '@toned/react'
import type * as React from 'react'
import { stylesheet } from '../system'

export const cardStyles = stylesheet((q) => ({
  root: {
    display: 'flex',
    flexLayout: 'column',
    gap: 2,
    padding: 4,
    bgColor: 'elevated',
    textColor: 'default',
    borderWidth: 'thick',
    borderColor: 'interactive',
    borderRadius: 'none',
    shadow: 'small',
    [q.media('md')]: { padding: 5, shadow: 'medium' },
    textDecoration: 'none',
  },
  title: { typography: 'heading-3', textTransform: 'uppercase' },
  description: { typography: 'body-medium' },
}))

export function Card({ className, style, ...props }: React.ComponentProps<'div'>) {
  const s = useStyles(cardStyles)
  return <div {...s.root.with({ className, style })} {...props} />
}

export function CardTitle({ className, style, ...props }: React.ComponentProps<'h3'>) {
  const s = useStyles(cardStyles)
  return <h3 {...s.title.with({ className, style })} {...props} />
}

export function CardDescription({ className, style, ...props }: React.ComponentProps<'p'>) {
  const s = useStyles(cardStyles)
  return <p {...s.description.with({ className, style })} {...props} />
}
