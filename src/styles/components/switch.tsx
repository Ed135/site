// Two-option switch (e.g. light / dark). The whole control is one toggle; the active side lights up.
import type { Variants } from '@toned/core'
import { useStyles } from '@toned/react'
import type * as React from 'react'
import { stylesheet } from '../system.ts'

export const switchStyles = stylesheet({
  root: {
    $kind: 'pressable',
    display: 'inline-flex',
    flexLayout: 'row',
    bgColor: 'elevated',
    borderWidth: 'thick',
    borderColor: 'interactive',
    borderRadius: 'none',
    shadow: 'small',
    '@platform web': { $style: { cursor: 'pointer', padding: 0 } },
  },
  option: {
    $kind: 'view',
    display: 'inline-flex',
    flexLayout: 'row',
    alignItems: 'center',
    gap: 1.5,
    paddingX: 3,
    paddingY: 1.5,
    textColor: 'default',
    typography: 'label-large',
    textTransform: 'uppercase',
  },
}).variants(
  ($: Variants<{ active: boolean }>) => ({
    [$.active(true)]: { option: { bgColor: 'status_warning', textColor: 'on_status_warning' } },
  }),
  { defaults: { active: false } },
)

function Option({ active, icon, children }: { active: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  const s = useStyles(switchStyles, { active })
  return <span {...s.option}>{icon}{children}</span>
}

export function Switch({ checked, onCheckedChange, off, on, label }: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  off: { text: string; icon: React.ReactNode }
  on: { text: string; icon: React.ReactNode }
  label: string
}) {
  const s = useStyles(switchStyles, {})
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onCheckedChange(!checked)} {...s.root}>
      <Option active={!checked} icon={off.icon}>{off.text}</Option>
      <Option active={checked} icon={on.icon}>{on.text}</Option>
    </button>
  )
}

const svg = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 3, 'aria-hidden': true } as const
export const SunIcon = (
  <svg {...svg}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>
)
export const MoonIcon = (
  <svg {...svg}><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg>
)
