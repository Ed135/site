import type * as React from 'react'
import { useStyles } from '@toned/react'
import { windowStyles } from './styles'

type Props<T extends React.ElementType> = { as?: T } & Omit<React.ComponentPropsWithoutRef<T>, 'as'>

// Vertical stack of windows, and a responsive row of them.
export function WindowStack({ as: Tag = 'div', className, style, ...props }: Props<React.ElementType>) {
  const s = useStyles(windowStyles)
  return <Tag {...s.stack.with({ className, style })} {...props} />
}
export function WindowRow({ className, style, ...props }: React.ComponentProps<'div'>) {
  const s = useStyles(windowStyles)
  return <div {...s.row.with({ className, style })} {...props} />
}

// A window: frame, title bar (traffic lights, centred title, optional trailing control) and its content.
export function Window({
  as: Tag = 'div',
  title,
  action,
  kind = 'term',
  className,
  style,
  children,
  ...props
}: Props<React.ElementType> & { title: React.ReactNode; action?: React.ReactNode; kind?: 'term' | 'code' | 'paper' }) {
  const s = useStyles(windowStyles, { kind })
  return (
    <Tag {...s.frame.with({ className: [kind === 'paper' ? 'win-paper' : 'win', className].filter(Boolean).join(' '), style })} {...props}>
      <div {...s.bar.with({})}>
        <span {...s.dots.with({})} aria-hidden>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <i key={c} {...s.dot.with({ style: { background: c } })} />)}
        </span>
        <span {...s.title.with({})}>{title}</span>
        {action}
      </div>
      {children}
    </Tag>
  )
}
