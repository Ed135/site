// Card, adapted from the Toned UI example (toned-styles/toned/examples/ui).
import type { Variants } from '@toned/core'
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
})).variants(
  ($: Variants<{ tone: 'default' | 'link' | 'accent' | 'highlight' | 'green'; size: 'md' | 'lg' | 'section'; center: boolean; feature: boolean; compact: boolean }>, q) => ({
    [$.tone('link')]: { root: { ':hover': { bgColor: 'status_warning', textColor: 'on_status_warning' } } },
    // Feature cards: roomier and heavier shadow as the screen grows.
    [$.tone('accent')]: { root: { bgColor: 'data_primary', textColor: 'on_important', padding: 5, [q.media('md')]: { padding: 8, shadow: 'large' } } },
    [$.tone('highlight')]: { root: { bgColor: 'status_warning', textColor: 'on_status_warning', padding: 5, [q.media('md')]: { padding: 8, shadow: 'large' } } },
    [$.tone('green')]: { root: { bgColor: 'status_success', textColor: 'on_status_success', padding: 5, [q.media('md')]: { padding: 8, shadow: 'large' } } },
    // Same roomy padding and heavy shadow as the feature tones, for other card types.
    [$.feature(true)]: { root: { padding: 5, [q.media('md')]: { padding: 8, shadow: 'large' } } },
    // Slim strip: tight padding for one-line cards.
    [$.compact(true)]: { root: { padding: 2, paddingX: 4, shadow: 'small', [q.media('md')]: { padding: 2, paddingX: 4, shadow: 'small' } } },
    [$.center(true)]: { root: { justifyContent: 'center' } },
    [$.size('section')]: { title: { typography: 'heading-2', [q.media('md')]: { typography: 'heading-1' } } },
    [$.size('lg')]: {
      title: { typography: 'display-small', [q.media('md')]: { typography: 'display-medium' }, [q.media('lg')]: { typography: 'display-large' } },
      description: { typography: 'body-medium', [q.media('md')]: { typography: 'body-large' } },
    },
  }),
  { defaults: { tone: 'default', size: 'md', center: false, feature: false, compact: false } },
)

type Tone = 'default' | 'link' | 'accent' | 'highlight' | 'green'
type Size = 'md' | 'lg' | 'section'
type Tag = 'div' | 'a' | 'section' | 'header'

export function Card({ as: Tag = 'div', tone = 'default', center = false, feature = false, compact = false, className, style, ...props }: React.ComponentProps<'a'> & { as?: Tag; tone?: Tone; center?: boolean; feature?: boolean; compact?: boolean }) {
  const s = useStyles(cardStyles, { tone, center, feature, compact })
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
