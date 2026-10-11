import { useEffect, useRef, useState, type KeyboardEvent as ReactKey } from 'react'
import { profile, personal, stack, contributions, nav } from './content'
import { photos, flag, formatDate } from './photos/api'
import { countryName } from './photos/WorldMap'

type Run = { cmd: string; out: string[] }

const countries = () => {
  const n: Record<string, number> = {}
  for (const p of photos) if (p.country) n[p.country] = (n[p.country] ?? 0) + 1
  return Object.entries(n).sort((a, b) => b[1] - a[1])
}
const link = (title: string) => nav.find((n) => n.title === title)!.href

// Known commands. Each returns the lines to print and an optional side effect. Anything else gets a canned reply (see `replies`).
const commands: { cmd: string; hint: string; run: () => { out: string[]; then?: () => void } }[] = [
  { cmd: 'whoami', hint: 'who is this', run: () => ({ out: [profile.name, profile.role, '', profile.summary] }) },
  { cmd: 'stack', hint: 'what I build with', run: () => ({ out: [stack.map((s) => `[${s}]`).join(' ')] }) },
  { cmd: 'hobbies', hint: 'off the clock', run: () => ({ out: [personal.lead, ...personal.things.map((t) => `  - ${t}`)] }) },
  {
    cmd: 'photos',
    hint: 'camera roll stats',
    run: () => {
      const c = countries()
      const latest = photos.find((p) => p.date)?.date
      return {
        out: [
          `${photos.length} photos · ${c.length} countries${latest ? ` · latest ${formatDate(latest)}` : ''}`,
          '',
          ...c.map(([code, n]) => `  ${flag(code)}  ${countryName(code).padEnd(16)} ${'█'.repeat(Math.max(1, Math.round((n / c[0][1]) * 16)))} ${n}`),
        ],
      }
    },
  },
  { cmd: 'oss', hint: 'open source', run: () => ({ out: contributions.map((c) => `  ${c.title}  ${c.href}`) }) },
  { cmd: 'open photos', hint: 'go to the gallery', run: () => ({ out: ['opening gallery…'], then: () => { location.hash = '#/photos' } }) },
  // External links are printed as clickable links: a window.open after the typing animation has lost the user gesture and is blocked.
  { cmd: 'open github', hint: 'link', run: () => ({ out: ['GitHub  ' + link('GitHub')] }) },
  { cmd: 'open linkedin', hint: 'link', run: () => ({ out: ['LinkedIn  ' + link('LinkedIn')] }) },
  { cmd: 'help', hint: 'list commands', run: () => ({ out: ['Commands (type / to pick one, or anything else to chat):', '', ...commands.filter((c) => c.cmd !== 'help').map((c) => `  /${c.cmd.padEnd(14)} ${c.hint}`)] }) },
  { cmd: 'clear', hint: 'reset', run: () => ({ out: [] }) },
]

const replies = [
  'command not found. neither did the author.',
  'nice try. I only speak in presets and puns.',
  'that sounded important. I did not understand it.',
  'permission denied. (I made that up, but it felt right.)',
  'segmentation fault in my feelings.',
  'working on it… still working on it… no.',
  'have you tried typing /help?',
  'I would answer that, but I am a static website.',
  'error 418: I am a teapot with opinions.',
  'interesting. tell me more. actually, do not.',
  'this terminal runs entirely on vibes.',
  'unknown command. known snack: pretzels.',
  'try turning it off and on again. I will wait.',
  'I looked that up. it was not there.',
  'your message has been filed under "later".',
  'syntax error: expected coffee, got input.',
  'stack overflow. not the website, the feeling.',
  'it works on my machine.',
  'that is a bold command for a Tuesday.',
  'I ran it. nothing happened. which is also a result.',
  'no such file or directory, but a lovely thought.',
  'rm -rf worries. kidding. nothing was removed.',
  'beep boop. translation: ok.',
  'have you considered a nice walk?',
  'processing… processing… giving up gracefully.',
  'I only know a handful of tricks. this was not one.',
  'git blame says: you.',
  'merge conflict between your command and my skills.',
  'ship it. whatever it is.',
  'TODO: implement that.',
  'that is above my pay grade, which is zero.',
  'I asked the rubber duck. it quacked.',
  'cache miss. try something I have heard of.',
  'null is not an object, and neither is that.',
  'I would love to help, but I am just a prompt.',
  'ah, a person of mystery. proceed.',
  'ping: no response from your idea.',
  'out of memory. also out of ideas.',
  'type /photos. it is the good stuff.',
  'type /whoami and meet the person behind this.',
  'sudo make me a sandwich. no. I cannot.',
  'hmm. that did not compile.',
  'ENOENT: no such feature yet.',
  'I will pretend I understood that.',
  'the answer is 42. what was the question?',
  'that was a command? bold. wrong. but bold.',
  'locally it passed. in production it is this message.',
  'tab complete cannot save you here.',
  'wow. such command. much unknown.',
  'try /stack to see what I build with.',
]

// Shuffle-bag style: never repeats a reply within the last 20, so it feels alive without being random noise.
const recent: number[] = []
const nextReply = () => {
  const pool = replies.map((_, i) => i).filter((i) => !recent.includes(i))
  const pick = pool[Math.floor(Math.random() * pool.length)]
  recent.push(pick)
  if (recent.length > 20) recent.shift()
  return replies[pick]
}

// URLs in output become real links (opened by the visitor's own click, so popup blockers allow them).
const linkify = (line: string) =>
  line ? line.split(/(https?:\/\/\S+)/).map((part, i) => (i % 2 ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : part)) : ' '

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function Terminal() {
  const [history, setHistory] = useState<Run[]>([])
  const [typing, setTyping] = useState<string>()
  const [text, setText] = useState('')
  const [sel, setSel] = useState(0)
  const body = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [size, setSize] = useState('80×24')
  const [kbHeight, setKbHeight] = useState<number>() // visible height while the phone keyboard is up
  const root = useRef<HTMLElement>(null)
  const busy = useRef(false)
  const epoch = useRef(0) // bumped on unmount so a half-typed command from a previous mount (StrictMode) stops

  // "/" at the start of the line shows the command list, filtered by what follows.
  const menu = typing === undefined && text.startsWith('/')
  const matches = menu ? commands.filter((c) => c.cmd.startsWith(text.slice(1).trim().toLowerCase())) : []

  useEffect(() => {
    // boot: introduce, list the stack, then show the commands
    ;(async () => { await run('whoami'); await run('stack'); await run('help') })()
    return () => { epoch.current++; busy.current = false }
  }, [])
  // Title shows the real grid: columns × rows of monospace characters that fit the window, updated on resize.
  useEffect(() => {
    const el = body.current
    if (!el) return
    const measure = () => {
      const cs = getComputedStyle(el)
      const ctx = document.createElement('canvas').getContext('2d')
      if (!ctx) return
      ctx.font = `${cs.fontSize} ${cs.fontFamily}`
      const cw = ctx.measureText('M').width
      const lh = parseFloat(getComputedStyle(el.querySelector('pre') ?? el).lineHeight) || parseFloat(cs.fontSize) * 1.5
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      if (cw > 0) setSize(`${Math.floor(w / cw)}×${Math.floor(h / lh)}`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight }) }, [history, typing, menu])
  useEffect(() => { if (menu) body.current?.querySelector('.term-menu .on')?.scrollIntoView({ block: 'nearest' }) }, [menu, sel])
  useEffect(() => setSel(0), [text])

  // On phones the keyboard covers the lower half of the page. While the prompt is focused, fit the window into the visible
  // area above it and scroll it to the top so the output and the prompt stay readable.
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const sync = () => {
      const up = document.activeElement === input.current && window.innerHeight - vv.height > 120
      setKbHeight(up ? vv.height : undefined)
      if (up) requestAnimationFrame(() => root.current?.scrollIntoView({ block: 'start' }))
    }
    vv.addEventListener('resize', sync)
    addEventListener('focusin', sync)
    addEventListener('focusout', sync)
    return () => { vv.removeEventListener('resize', sync); removeEventListener('focusin', sync); removeEventListener('focusout', sync) }
  }, [])

  // Pressing "/" anywhere on the page jumps into the prompt (unless typing in another field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || t.closest?.('input, textarea, select, [contenteditable]')) return
      e.preventDefault()
      input.current?.focus({ preventScroll: true })
      setText('/')
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  // Runs a known command, animating it being typed (boot and menu picks).
  async function run(cmd: string) {
    if (busy.current) return
    const mine = epoch.current
    setText('')
    busy.current = true
    if (!reduced()) {
      for (let i = 1; i <= cmd.length; i++) {
        if (epoch.current !== mine) return
        setTyping(`/${cmd.slice(0, i)}`)
        await sleep(35)
      }
      await sleep(160)
    }
    if (epoch.current !== mine) return
    setTyping(undefined)
    print(`/${cmd}`, cmd)
    busy.current = false
  }

  // Appends the output of a command (or a canned reply when `cmd` is not known).
  function print(shown: string, cmd?: string) {
    if (cmd === 'clear') return setHistory([])
    const def = commands.find((c) => c.cmd === cmd)
    if (!def) return setHistory((h) => [...h.slice(-5), { cmd: shown, out: [nextReply()] }])
    const { out, then } = def.run()
    setHistory((h) => [...h.slice(-5), { cmd: shown, out }])
    if (then) setTimeout(then, reduced() ? 0 : 450)
  }

  function submit() {
    if (busy.current) return
    const raw = text.trim()
    if (!raw) return
    if (menu && matches.length) return void run(matches[Math.min(sel, matches.length - 1)].cmd)
    setText('')
    const key = raw.replace(/^\//, '').toLowerCase().replace(/\s+/g, ' ')
    print(raw, commands.some((c) => c.cmd === key) ? key : undefined)
  }

  function onKeyDown(e: ReactKey<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); submit() }
    else if (e.key === 'Escape') { setText(''); input.current?.blur() }
    else if (menu && matches.length && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setSel((i) => (i + (e.key === 'ArrowDown' ? 1 : matches.length - 1)) % matches.length)
    }
  }

  return (
    <section className="term" ref={root} aria-label="Interactive terminal">
      <div className="term-bar">
        <span className="term-dots" aria-hidden><i /><i /><i /></span>
        <span className="term-title">ed — zsh — {size}</span>
      </div>
      <div
        className="term-body"
        ref={body}
        style={kbHeight ? { height: Math.max(140, kbHeight - 190) } : undefined}
        role="log"
        aria-live="polite"
        onClick={() => { if (!getSelection()?.toString()) input.current?.focus({ preventScroll: true }) }}
      >
        {history.map((r, i) => (
          <div key={i}>
            <div><span className="term-ps">ed@site ~ %</span> {r.cmd}</div>
            {r.out.map((l, j) => <pre key={j}>{linkify(l)}</pre>)}
          </div>
        ))}
        <label className="term-line">
          <span className="term-ps">ed@site ~ %</span>
          <input
            ref={input}
            className="term-input"
            value={typing ?? text}
            readOnly={typing !== undefined}
            maxLength={60}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            enterKeyHint="send"
            aria-label="Terminal input"
          />
        </label>
        {menu && matches.length > 0 && (
          <div className="term-menu" role="listbox" aria-label="Commands">
            {matches.map((c, i) => (
              <button
                key={c.cmd}
                type="button"
                role="option"
                aria-selected={i === sel}
                className={i === sel ? 'on' : undefined}
                onMouseEnter={() => setSel(i)}
                onClick={() => run(c.cmd)}
              >
                <b>/{c.cmd}</b> <span>{c.hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="term-foot">
        <button type="button" className="term-hint" onClick={() => { setText('/'); input.current?.focus({ preventScroll: true }) }}>
          <b>/</b> for commands <span>· type anything · ↑↓ select · enter run · esc clear</span>
        </button>
      </div>
    </section>
  )
}
