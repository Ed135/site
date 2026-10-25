import { personal } from './content'
import { Window } from './Window'

// "Off the clock" as an Apple Notes-style note: window chrome, a title, and a checklist you can tick and untick.
export function Notes() {
  return (
    <Window as="article" kind="paper" icon="notes" title={`~/off-the-clock — ${personal.things.length} items`} aria-label={personal.lead}>
      <div className="note-page">
        <ul>
          {personal.things.map((t) => (
            <li key={t}>
              <label>
                <input type="checkbox" defaultChecked />
                <span aria-hidden>✓</span>
                {t}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </Window>
  )
}
