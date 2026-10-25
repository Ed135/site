import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { createElements } from '@toned/react'
import { page, nav, section } from './styles'
import { GitHubIcon, LinkedInIcon, SunIcon, MoonIcon, SystemIcon } from './styles/components/Icons'
import { Photos } from './photos/Photos'
import { Terminal } from './Terminal'
import { Dock, WindowRow, WindowStack } from './Window'
import { PhotosTile } from './photos/PhotosTile'
import { Notes } from './Notes'
import { OpenSource } from './OpenSource'
import { profile, nav as navLinks } from './content'

// The map's country paths are a separate chunk; fetch it while the home page is idle so Photos opens with the map already there.
const prefetch = () => import('./photos/world')
if ('requestIdleCallback' in window) requestIdleCallback(prefetch)
else setTimeout(prefetch, 1500)

const P = createElements(page)
const N = createElements(nav)
const S = createElements(section)

const navIcons: Record<string, React.ReactNode> = { github: GitHubIcon, linkedin: LinkedInIcon }

// External links open in a new tab.
const ext = (href: string) => (/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})

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

  // Wipe between modes with the View Transitions API (styled in theme.css); falls back to an instant swap.
  const choose = (next: Pref) => {
    const apply = () => {
      setPref(next)
      document.documentElement.dataset.mode = (next === 'system' ? systemDark : next === 'dark') ? 'dark' : 'light'
    }
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(() => flushSync(apply))
    } else {
      apply()
    }
    try {
      if (next === 'system') localStorage.removeItem('mode')
      else localStorage.setItem('mode', next)
    } catch {}
  }

  // One button cycling light, dark, then follow-the-system; the icon shows the current choice.
  const order: Pref[] = ['light', 'dark', 'system']
  const next = order[(order.indexOf(pref) + 1) % order.length]
  const icon = { light: SunIcon, dark: MoonIcon, system: SystemIcon }[pref]
  return (
    <N.Item as="button" type="button" aria-label={`Theme: ${pref}. Switch to ${next}.`} title={`Theme: ${pref}`} onClick={() => choose(next)}>
      {icon}
    </N.Item>
  )
}

// Day, date and time in the menu bar, like the system clock; ticks every 30 seconds.
function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  const text = now.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
  return <N.Item as="span"><N.Clock as="span">{text}</N.Clock></N.Item>
}

function Home() {
  // Sections render after load, so honour a direct #hash link once they exist.
  useEffect(() => {
    if (location.hash && !location.hash.startsWith('#/')) document.getElementById(location.hash.slice(1))?.scrollIntoView()
  }, [])

  return (
    <>
      <h1 className="sr-only">{profile.name}, {profile.role}</h1>
      <WindowStack>
        <Terminal />
        <WindowRow>
          <Notes />
          <PhotosTile />
        </WindowRow>
        <OpenSource />
      </WindowStack>
    </>
  )
}

function PhotosPage({ upload }: { upload: boolean }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <WindowStack as="section">
      <S.Title as="a" href="#/photos">Photos 📷</S.Title>
      <Photos upload={upload} />
    </WindowStack>
  )
}

function useHash() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return hash
}

export function App() {
  const hash = useHash()

  return (
    <P>
      <P.Root as="main">
        <N>
          <N.Root as="nav">
            <N.Start>
              <N.Item as="a" href="#" title="Home"><N.Name as="span">{profile.name}</N.Name></N.Item>
              <N.Item as="a" href="#/photos">Photos</N.Item>
            </N.Start>
            <N.Group>
              {navLinks.map((l) => (
                <N.Item key={l.href} as="a" href={l.href} aria-label={l.title} title={l.title} {...ext(l.href)}>
                  {navIcons[l.icon]}
                </N.Item>
              ))}
              <ModeToggle />
              <Clock />
            </N.Group>
          </N.Root>
        </N>
        <P.Inner>
          {hash.startsWith('#/photos') ? <PhotosPage upload={hash === '#/photos/upload'} /> : <Home />}
        </P.Inner>
        <Dock />
      </P.Root>
    </P>
  )
}
