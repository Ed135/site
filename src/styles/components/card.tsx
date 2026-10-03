// Card, adapted from the Toned UI example (toned-styles/toned/examples/ui).
import type { Variants } from '@toned/core'
import { useStyles } from '@toned/react'
import type * as React from 'react'
import { stylesheet } from '../system.ts'

export const cardStyles = stylesheet({
  root: {
    display: 'flex',
    flexLayout: 'column',
    gap: 2,
    padding: 5,
    bgColor: 'elevated',
    textColor: 'default',
    borderWidth: 'thick',
    borderColor: 'interactive',
    borderRadius: 'none',
    shadow: 'medium',
    textDecoration: 'none',
  },
  title: { typography: 'heading-3', textTransform: 'uppercase' },
  description: { typography: 'body-medium' },
}).variants(
  ($: Variants<{ tone: 'default' | 'link' | 'accent' | 'highlight'; size: 'md' | 'lg' }>) => ({
    [$.tone('link')]: { root: { ':hover': { bgColor: 'status_warning', textColor: 'on_status_warning' } } },
    [$.tone('accent')]: { root: { bgColor: 'data_primary', textColor: 'on_important', padding: 8, shadow: 'large' } },
    [$.tone('highlight')]: { root: { bgColor: 'status_warning', textColor: 'on_status_warning', padding: 8, shadow: 'large' } },
    [$.size('lg')]: { title: { typography: 'display-large' }, description: { typography: 'body-large' } },
  }),
  { defaults: { tone: 'default', size: 'md' } },
)

type Tone = 'default' | 'link' | 'accent' | 'highlight'
type Size = 'md' | 'lg'
type Tag = 'div' | 'a' | 'section' | 'header'

export function Card({ as: Tag = 'div', tone = 'default', className, style, ...props }: React.ComponentProps<'a'> & { as?: Tag; tone?: Tone }) {
  const s = useStyles(cardStyles, { tone })
  const Comp = Tag as React.ElementType
  return <Comp {...s.root.with({ className, style })} {...props} />
}

export function CardTitle({ as: Tag = 'h3', size = 'md', className, style, ...props }: React.ComponentProps<'h3'> & { as?: 'h1' | 'h2' | 'h3'; size?: Size }) {
  const s = useStyles(cardStyles, { size })
  return <Tag {...s.title.with({ className, style })} {...props} />
}

export function CardDescription({ size = 'md', className, style, ...props }: React.ComponentProps<'p'> & { size?: Size }) {
  const s = useStyles(cardStyles, { size })
  return <p {...s.description.with({ className, style })} {...props} />
}
