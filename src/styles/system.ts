// Token system: base vocabulary from @toned/systems. Every sheet is built from `stylesheet`.
import { defineSystem } from '@toned/core'
import { system } from '@toned/systems/base'

const { breakpoints, ...tokens } = system

// `wide` is the 601px+ split the windows use between their phone and desktop sizing.
export const ui = defineSystem(tokens, { breakpoints: { __breakpoints: { ...breakpoints.__breakpoints, wide: '37.5625rem' } } })
export const { stylesheet } = ui
