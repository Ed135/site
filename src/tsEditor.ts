// Small TypeScript helpers for the contributions.ts editor: line tokenizer and Enter auto-indent.

const keywords =
  'abstract|as|async|await|break|case|catch|class|const|continue|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|if|implements|import|in|instanceof|interface|keyof|let|new|of|private|protected|public|readonly|return|satisfies|static|switch|throw|try|type|typeof|var|void|while|yield'
const builtins = 'any|boolean|never|null|number|object|string|symbol|undefined|unknown|true|false|this'

// One alternation, tried left to right at each position: comment, string, number, keyword, builtin/type name.
const token = new RegExp(
  `(\\/\\/.*|\\/\\*.*?(?:\\*\\/|$)|'(?:[^'\\\\]|\\\\.)*'?|"(?:[^"\\\\]|\\\\.)*"?|\`(?:[^\`\\\\]|\\\\.)*\`?|\\b\\d[\\d_.]*\\b|\\b(?:${keywords})\\b|\\b(?:${builtins})\\b|\\b[A-Z][A-Za-z0-9_]*\\b)`,
)

export type Token = { text: string; kind?: 'c' | 's' | 'n' | 'k' | 't' }

const kindOf = (t: string): Token['kind'] =>
  t.startsWith('/') ? 'c' : /^['"`]/.test(t) ? 's' : /^\d/.test(t) ? 'n' : new RegExp(`^(?:${keywords})$`).test(t) ? 'k' : 't'

export function tokenize(line: string): Token[] {
  return line.split(token).flatMap((text, i) => (text === '' ? [] : [{ text, kind: i % 2 ? kindOf(text) : undefined }]))
}

// Text to insert for Enter at `caret`: a newline, the current line's indent, and one more level after an opening bracket.
export function newlineWithIndent(text: string, caret: number, unit = '  '): string {
  const start = text.lastIndexOf('\n', caret - 1) + 1
  const before = text.slice(start, caret)
  const indent = /^[ \t]*/.exec(before)![0]
  return '\n' + indent + (/[{[(]\s*$/.test(before) ? unit : '')
}
