import { personal } from './content'

// "Off the clock" as an Apple Notes-style note: window chrome, a title, and a checklist.
export function Notes() {
  return (
    <article className="note" aria-label={personal.lead}>
      <div className="term-bar">
        <span className="term-dots" aria-hidden><i /><i /><i /></span>
        <span className="term-title">~/off-the-clock — {personal.things.length} items</span>
      </div>
      <div className="note-page">
        <ul>
          {personal.things.map((t) => (
            <li key={t}><span aria-hidden>✓</span>{t}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}
