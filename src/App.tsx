import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { createElements } from '@toned/react'
import { page, nav, section } from './styles'
import { GitHubIcon, LinkedInIcon, HomeIcon } from './styles/components/Icons'
import { Switch, SwitchGroup, SwitchDivider, SwitchButton, SunIcon, MoonIcon, SystemIcon } from './styles/components/Switch'
import { Photos } from './photos/Photos'
import { Terminal } from './Terminal'
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

// undefined until the nav first sticks, so nothing animates on load.
function useStuck() {
  const [stuck, setStuck] = useState<boolean>()
  useEffect(() => {
    const update = () => {
      const now = scrollY > 0 // the nav sits at the very top, so any scroll means it is stuck
      setStuck((prev) => (prev === undefined && !now ? undefined : now))
    }
    update()
    addEventListener('scroll', update, { passive: true })
    return () => removeEventListener('scroll', update)
  }, [])
  return stuck
}

function Home() {
  // Sections render after load, so honour a direct #hash link once they exist.
  useEffect(() => {
    if (location.hash && !location.hash.startsWith('#/')) document.getElementById(location.hash.slice(1))?.scrollIntoView()
  }, [])

  return (
    <>
      <h1 className="sr-only">{profile.name}, {profile.role}</h1>
      <S>
        <Terminal />
      </S>
      <S>
        <S.Split>
          <Notes />
          <PhotosTile />
        </S.Split>
      </S>
      <S>
        <OpenSource />
      </S>
    </>
  )
}

function PhotosPage({ upload }: { upload: boolean }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <S>
      <S.Root as="section">
        <S.Title as="a" href="#/photos">Photos 📷</S.Title>
        <Photos upload={upload} />
      </S.Root>
    </S>
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
  const stuck = useStuck()

  return (
    <P>
      <P.Root as="main">
        <N>
          <N.Root as="nav" data-stuck={stuck === undefined ? undefined : String(stuck)}>
            <N.Link as="a" href="#" aria-label="Home">{HomeIcon}</N.Link>
            <N.Group>
              {navLinks.map((l) => (
                <N.Link key={l.href} as="a" href={l.href} aria-label={l.title} {...ext(l.href)}>
                  <N.Icon as="span">{navIcons[l.icon]}</N.Icon>
                  <N.Label as="span">{l.title}</N.Label>
                </N.Link>
              ))}
              <ModeToggle />
            </N.Group>
          </N.Root>
        </N>
        <P.Inner>
          {hash.startsWith('#/photos') ? <PhotosPage upload={hash === '#/photos/upload'} /> : <Home />}
        </P.Inner>
      </P.Root>
    </P>
  )
}
