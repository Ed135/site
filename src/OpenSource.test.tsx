import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OpenSource } from './OpenSource'
import { newlineWithIndent, tokenize, urlAt } from './tsEditor'

// The real Window needs the Toned runtime; the editor only needs its title, action and children.
vi.mock('./Window', () => ({
  Window: ({ title, action, children }: { title: string; action: React.ReactNode; children: React.ReactNode }) => (
    <section><header>{title}{action}</header>{children}</section>
  ),
}))

afterEach(cleanup)

const setup = () => {
  render(<OpenSource />)
  const editor = screen.getByRole('textbox', { name: 'contributions.ts' }) as HTMLTextAreaElement
  const rows = () => [...document.querySelectorAll('.code-edit pre > div')].map((d) => d.textContent)
  const numbers = () => document.querySelectorAll('.ln > div').length
  return { editor, rows, numbers }
}

describe('contributions.ts editor', () => {
  it('shows the contributions as editable code', () => {
    const { editor, rows } = setup()
    expect(editor.value.split('\n')[1]).toBe('export const contributions = [')
    expect(rows()).toEqual(editor.value.split('\n').map((l) => l || ' '))
  })

  it('puts text typed after several new lines on the matching row', async () => {
    const { editor, rows, numbers } = setup()
    const user = userEvent.setup()
    await user.click(editor)
    await user.keyboard('{Control>}{End}{/Control}') // caret to the end of the file
    await user.keyboard('{Enter}{Enter}{Enter}hello{Enter}{Enter}world')

    const lines = editor.value.split('\n')
    const hello = lines.indexOf('hello')
    expect(hello).toBeGreaterThan(0)
    expect(lines[hello - 1]).toBe('')
    expect(lines[hello + 2]).toBe('world')
    // the highlighted copy and the line numbers stay in step with the textarea, row for row
    expect(rows()).toEqual(lines.map((l) => l || ' '))
    expect(numbers()).toBe(lines.length)
    expect(editor.rows).toBe(lines.length)
  })

  it('keeps typing on the same row when a new line is added mid-file', async () => {
    const { editor, rows } = setup()
    const user = userEvent.setup()
    await user.click(editor)
    editor.setSelectionRange(0, 0)
    await user.keyboard('{Enter}{Enter}top')
    const lines = editor.value.split('\n')
    expect(lines[2]).toBe('top// things I help build in the open')
    expect(rows()[2]).toBe('top// things I help build in the open')
  })

  it('never lets the textarea scroll away from its highlighted copy', () => {
    const { editor } = setup()
    editor.scrollTop = 40
    editor.scrollLeft = 12
    fireEvent.scroll(editor)
    expect(editor.scrollTop).toBe(0)
    expect(editor.scrollLeft).toBe(0)
  })
})

describe('TypeScript behaviour', () => {
  it('classifies TypeScript tokens', () => {
    expect(tokenize("export const n: number = 42 // hi")).toEqual([
      { text: 'export', kind: 'k' }, { text: ' ' }, { text: 'const', kind: 'k' }, { text: ' n: ' },
      { text: 'number', kind: 't' }, { text: ' = ' }, { text: '42', kind: 'n' }, { text: ' ' }, { text: '// hi', kind: 'c' },
    ])
    expect(tokenize(`x = "a//b" + \`t\``).filter((t) => t.kind).map((t) => t.kind)).toEqual(['s', 's'])
    expect(tokenize('type User = Array<string>').filter((t) => t.kind).map((t) => t.text)).toEqual(['type', 'User', 'Array', 'string'])
  })

  it('indents after an opening bracket and keeps the current indent', () => {
    expect(newlineWithIndent('const a = {', 11)).toBe('\n  ')
    expect(newlineWithIndent('  foo: 1,', 9)).toBe('\n  ')
    expect(newlineWithIndent('abc', 0)).toBe('\n')
  })

  it('Enter auto-indents and Tab inserts two spaces', async () => {
    const { editor } = setup()
    const user = userEvent.setup()
    await user.click(editor)
    await user.keyboard('{Control>}{End}{/Control}')
    await user.keyboard('{Enter}type A = ({Enter}x: 1{Enter}{Tab}y')
    expect(editor.value.endsWith('type A = (\n  x: 1\n    y')).toBe(true)
  })

  it('Esc lets the next Tab leave the editor', async () => {
    const { editor } = setup()
    const user = userEvent.setup()
    await user.click(editor)
    const before = editor.value
    await user.keyboard('{Escape}{Tab}')
    expect(editor.value).toBe(before)
  })
})

describe('reset', () => {
  it('restores the original code and is disabled until something changes', async () => {
    const { editor } = setup()
    const user = userEvent.setup()
    const reset = screen.getByRole('button', { name: 'reset' }) as HTMLButtonElement
    const original = editor.value
    expect(reset.disabled).toBe(true)
    await user.click(editor)
    await user.keyboard('{Control>}{End}{/Control}oops')
    expect(editor.value).not.toBe(original)
    expect(reset.disabled).toBe(false)
    await user.click(reset)
    expect(editor.value).toBe(original)
    expect(reset.disabled).toBe(true)
  })
})

describe('links', () => {
  it('flags https:// text as a link, inside strings and out, without trailing punctuation', () => {
    expect(tokenize("url: 'https://a.dev/x'")).toEqual([
      { text: 'url: ' },
      { text: "'", kind: 's' },
      { text: 'https://a.dev/x', kind: 's', link: true },
      { text: "'", kind: 's' },
    ])
    expect(tokenize('// see https://b.dev, ok').filter((t) => t.link).map((t) => t.text)).toEqual(['https://b.dev'])
    expect(tokenize('go https://c.dev.').filter((t) => t.link).map((t) => t.text)).toEqual(['https://c.dev'])
  })

  it('finds the link under the caret', () => {
    const text = "a\nurl: 'https://a.dev/x'"
    expect(urlAt(text, text.indexOf('https') + 3)).toBe('https://a.dev/x')
    expect(urlAt(text, 0)).toBeUndefined()
    expect(urlAt(text, text.indexOf('url'))).toBeUndefined()
  })

  it('opens a clicked link in a new tab but not a drag selection', () => {
    const { editor } = setup()
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const at = editor.value.indexOf('https://') + 4
    editor.setSelectionRange(at, at)
    fireEvent.click(editor)
    expect(open).toHaveBeenCalledWith('https://toned.style/', '_blank', 'noopener,noreferrer')
    open.mockClear()
    editor.setSelectionRange(at, at + 3)
    fireEvent.click(editor)
    expect(open).not.toHaveBeenCalled()
    open.mockRestore()
  })
})
