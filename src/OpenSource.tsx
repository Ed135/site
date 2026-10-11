import { useRef, useState, type KeyboardEvent } from 'react'
import { contributions } from './content'
import { newlineWithIndent, tokenize } from './tsEditor'
import { Window } from './Window'

const initial = [
  '// things I help build in the open',
  'export const contributions = [',
  ...contributions.flatMap((c) => ['  {', `    name: '${c.title}',`, `    url: '${c.href}',`, '  },']),
  ']',
].join('\n')

// An empty row would collapse to zero height and pull every later row out of step with the textarea, so blanks render as ' '.
const highlight = (line: string) =>
  tokenize(line || ' ').map((t, i) => (t.kind ? <i key={i} className={t.kind}>{t.text}</i> : t.text))

const indent = '  '

// Open source as an editable code window: a transparent textarea over a highlighted copy, with line numbers.
export function OpenSource() {
  const [text, setText] = useState(initial)
  const lines = text.split('\n')
  const leaveOnTab = useRef(false) // after Esc the next Tab moves focus on instead of indenting (keyboard users aren't trapped)

  // Prefer execCommand so the browser's undo stack keeps the edit; setRangeText is the fallback.
  function insert(el: HTMLTextAreaElement, str: string) {
    if (document.execCommand?.('insertText', false, str)) return
    el.setRangeText(str, el.selectionStart, el.selectionEnd, 'end')
    setText(el.value)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget
    if (e.key === 'Escape') leaveOnTab.current = true
    else if (e.key !== 'Tab') leaveOnTab.current = false
    if (e.nativeEvent.isComposing || e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === 'Tab' && !e.shiftKey && !leaveOnTab.current) {
      e.preventDefault()
      insert(el, indent)
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      insert(el, newlineWithIndent(el.value, el.selectionStart, indent))
    }
  }
  return (
    <Window
      as="section"
      kind="code"
      className="code"
      title="contributions.ts"
      aria-label="Open source contributions (editable)"
      action={<button type="button" className="code-reset" onClick={() => setText(initial)} disabled={text === initial}>reset</button>}
    >
      <div className="code-body">
        <div className="ln" aria-hidden>{lines.map((_, i) => <div key={i}>{i + 1}</div>)}</div>
        <div className="code-edit">
          <pre aria-hidden>{lines.map((l, i) => <div key={i}>{highlight(l || ' ')}</div>)}</pre>
          <textarea
            value={text}
            rows={lines.length}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            // Enter grows the content before React has resized the box, so the browser scrolls the textarea to keep the caret
            // visible; that offset would leave the typed text on a different row from its highlighted copy. Never let it scroll.
            onScroll={(e) => { e.currentTarget.scrollTop = 0; e.currentTarget.scrollLeft = 0 }}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            aria-label="contributions.ts"
          />
        </div>
      </div>
    </Window>
  )
}
