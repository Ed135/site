// Token system: base vocabulary from @toned/systems. Every sheet is built from `stylesheet`.
import { defineSystem } from '@toned/core'
import { system } from '@toned/systems/base'

const { breakpoints, ...tokens } = system

export const ui = defineSystem(tokens, { breakpoints })
export const { stylesheet } = ui
