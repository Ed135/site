import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { TonedProvider, createElements } from '@toned/react'
import { createWebRenderer } from '@toned/core/server'
import { webHost } from '@toned/react/hosts/web'
import '@toned/themes/shadcn/config.css'
import './styles/theme.css'
import 'virtual:toned.css'
import manifest from 'virtual:toned.manifest'
import { ui, page, nav, section } from './styles/index.ts'
import { Card, CardTitle, CardDescription } from './styles/components/card.tsx'
import { Badge } from './styles/components/badge.tsx'
import { Switch, SwitchGroup, SwitchDivider, SwitchButton, SunIcon, MoonIcon, SystemIcon } from './styles/components/switch.tsx'
import { profile, posts, contributions, stack, nav as navLinks } from './content.ts'

const renderer = createWebRenderer(ui, { manifest })
const P = createElements(page)
const N = createElements(nav)
const S = createElements(section)

type Pref = 'system' | 'light' | 'dark'
const query = matchMedia('(prefers-color-scheme: dark)')

function readPref(): Pref {
  try {
    const v = localStorage.getItem('mode')
    if (v === 'light' || v === 'dark') return v
  } catch {}
  return 'system'
}

// Default is "system": follows the OS and moves the switch with it.
function ModeToggle() {
  const [pref, setPref] = useState<Pref>(readPref)
  const [systemDark, setSystemDark] = useState(query.matches)
  const dark = pref === 'system' ? systemDark : pref === 'dark'

  useEffect(() => {
    const onChange = () => setSystemDark(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.mode = dark ? 'dark' : 'light'
  }, [dark])

  const choose = (next: Pref) => {
    setPref(next)
    try {
      if (next === 'system') localStorage.removeItem('mode')
      else localStorage.setItem('mode', next)
    } catch {}
  }

  return (
    <SwitchGroup>
      <Switch
        checked={dark}
        onCheckedChange={(on) => choose(on ? 'dark' : 'light')}
        label="Dark mode"
        off={{ text: 'Light', icon: SunIcon }}
        on={{ text: 'Dark', icon: MoonIcon }}
      />
      <SwitchDivider />
      <SwitchButton active={pref === 'system'} label="Match system setting" icon={SystemIcon} onClick={() => choose('system')} />
    </SwitchGroup>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <S>
      <S.Root as="section" id={id}>
        <S.Title as="a" href={`#${id}`}>{title}</S.Title>
        {children}
      </S.Root>
    </S>
  )
}

function LinkCard({ title, meta, body, href }: { title: string; meta?: string; body?: string; href: string }) {
  return (
    <Card as="a" tone="link" href={href}>
      <CardTitle>{title}</CardTitle>
      {meta && <CardDescription>{meta}</CardDescription>}
      {body && <CardDescription>{body}</CardDescription>}
    </Card>
  )
}

function App() {
  // Sections render after load, so honour a direct #hash link once they exist.
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView()
  }, [])

  return (
    <P>
      <P.Root as="main">
        <P.Inner>
          <N>
            <N.Root as="nav">
              {navLinks.map((l) => <N.Link key={l.href} as="a" href={l.href}>{l.title}</N.Link>)}
              <ModeToggle />
            </N.Root>
          </N>
          <S>
            <S.Split as="header">
              <Card tone="highlight">
                <CardTitle as="h1" size="lg">{profile.name}</CardTitle>
                <CardDescription size="lg">{profile.role}</CardDescription>
                <CardDescription>{profile.summary}</CardDescription>
              </Card>
              <Card tone="accent">
                <CardTitle as="h2">Stack</CardTitle>
                <S>
                  <S.Tags>{stack.map((x) => <Badge key={x}>{x}</Badge>)}</S.Tags>
                </S>
              </Card>
            </S.Split>
          </S>
          <Section id="writing" title="Writing">
            <S>
              <S.Grid>
                {posts.length === 0 && (
                  <Card>
                    <CardTitle>Coming soon</CardTitle>
                    <CardDescription>Posts will land here.</CardDescription>
                  </Card>
                )}
                {posts.map((p) => <LinkCard key={p.title} {...p} meta={p.date} body={p.summary} />)}
              </S.Grid>
            </S>
          </Section>
          <Section id="oss" title="Open source">
            <S>
              <S.Grid>
                {contributions.map((c) => <LinkCard key={c.title} title={c.title} body={c.summary} href={c.href} />)}
              </S.Grid>
            </S>
          </Section>
        </P.Inner>
      </P.Root>
    </P>
  )
}

createRoot(document.getElementById('root')!).render(
  <TonedProvider renderer={renderer} host={webHost}>
    <App />
  </TonedProvider>,
)
