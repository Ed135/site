import { contributions } from './content'

// Open source as a code-editor window: contributions.ts with line numbers and syntax colours.
export function OpenSource() {
  const lines: React.ReactNode[] = [
    <><i className="c">// things I help build in the open</i></>,
    <><i className="k">export const</i> contributions <i className="p">= [</i></>,
    ...contributions.flatMap((c) => [
      <>  <i className="p">{'{'}</i></>,
      <>    name<i className="p">:</i> <i className="s">'{c.title}'</i><i className="p">,</i></>,
      <>    url<i className="p">:</i> <a href={c.href} target="_blank" rel="noopener noreferrer" className="s">'{c.href}'</a><i className="p">,</i></>,
      <>  <i className="p">{'},'}</i></>,
    ]),
    <><i className="p">]</i></>,
  ]
  return (
    <section className="code" aria-label="Open source contributions">
      <div className="term-bar">
        <span className="term-dots" aria-hidden><i /><i /><i /></span>
        <span className="term-title">contributions.ts</span>
      </div>
      <pre className="code-body">
        {lines.map((l, i) => (
          <div key={i}><span className="ln" aria-hidden>{i + 1}</span><span>{l}</span></div>
        ))}
      </pre>
    </section>
  )
}
