// Edit me.
export const profile = {
  name: 'Ed Bieda',
  role: 'Lead Front-end Engineer at JPMorganChase',
  summary:
    '10+ years building front-end and back-end apps with React, React Native and TypeScript. Design systems, testing infrastructure and developer tooling that speed up high-quality delivery. Leading greenfield and existing project work, mentoring engineers and partnering with designers and product managers to deliver solutions.',
}

// Empty for now: the Writing section shows a placeholder.
export const posts: { title: string; date: string; summary: string; href: string }[] = []

export const contributions = [
  { title: 'toned-styles/toned', summary: 'Typed styling for design systems. I contribute to it.', href: 'https://github.com/toned-styles/toned' },
]

export const stack = [
  'TypeScript',
  'React',
  'React Native',
  'Design systems',
  'Storybook',
  'Expo',
  'Vite',
  'TanStack',
  'Vitest',
  'Testing Library',
  'pnpm',
  'CI/CD',
  'AI dev tools',
]

// External links render once, in the nav, after the section anchors.
export const nav = [
  { title: 'Writing', href: '#writing' },
  { title: 'Open source', href: '#oss' },
  { title: 'GitHub', href: 'https://github.com/Ed135' },
  { title: 'LinkedIn', href: 'https://linkedin.com/in/edward-bieda' },
]
