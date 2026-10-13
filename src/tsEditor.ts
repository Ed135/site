// Small TypeScript helpers for the contributions.ts editor: line tokenizer and Enter auto-indent.

const keywords =
  'abstract|as|async|await|break|case|catch|class|const|continue|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|if|implements|import|in|instanceof|interface|keyof|let|new|of|private|protected|public|readonly|return|satisfies|static|switch|throw|try|type|typeof|var|void|while|yield'
const builtins = 'any|boolean|never|null|number|object|string|symbol|undefined|unknown|true|false|this'

// One alternation, tried left to right at each position: comment, string, number, keyword, builtin/type name.
const token = new RegExp(
  `((?<!:)\\/\\/.*|\\/\\*.*?(?:\\*\\/|$)|'(?:[^'\\\\]|\\\\.)*'?|"(?:[^"\\\\]|\\\\.)*"?|\`(?:[^\`\\\\]|\\\\.)*\`?|\\b\\d[\\d_.]*\\b|\\b(?:${keywords})\\b|\\b(?:${builtins})\\b|\\b[A-Z][A-Za-z0-9_]*\\b)`,
)

// http(s) links, up to whitespace or a quote; trailing punctuation belongs to the sentence, not the link.
const url = /(https?:\/\/[^\s'"`<>]*[^\s'"`<>.,;:!?)])/

export type Token = { text: string; kind?: 'c' | 's' | 'n' | 'k' | 't'; link?: boolean }

const kindOf = (t: string): Token['kind'] =>
  t.startsWith('/') ? 'c' : /^['"`]/.test(t) ? 's' : /^\d/.test(t) ? 'n' : new RegExp(`^(?:${keywords})$`).test(t) ? 'k' : 't'

// Tokens of one line; a link inside a string or comment keeps that colour and is flagged `link`.
export function tokenize(line: string): Token[] {
  return line.split(token).flatMap((text, i) => {
    const kind = i % 2 ? kindOf(text) : undefined
    return text.split(url).flatMap((part, j) => (part === '' ? [] : [{ text: part, kind, ...(j % 2 ? { link: true } : {}) }]))
  })
}

// The link under the caret, if any (the caret may sit at either end of it).
export function urlAt(text: string, caret: number): string | undefined {
  const start = text.lastIndexOf('\n', caret - 1) + 1
  const end = text.indexOf('\n', caret) < 0 ? text.length : text.indexOf('\n', caret)
  const line = text.slice(start, end)
  for (const m of line.matchAll(new RegExp(url, 'g'))) {
    const from = start + m.index
    if (caret >= from && caret <= from + m[0].length) return m[0]
  }
}

// Text to insert for Enter at `caret`: a newline, the current line's indent, and one more level after an opening bracket.
export function newlineWithIndent(text: string, caret: number, unit = '  '): string {
  const start = text.lastIndexOf('\n', caret - 1) + 1
  const before = text.slice(start, caret)
  const indent = /^[ \t]*/.exec(before)![0]
  return '\n' + indent + (/[{[(]\s*$/.test(before) ? unit : '')
}
