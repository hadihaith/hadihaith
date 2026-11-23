import { QUESTS, LOADOUT } from '../data'

export default function QuestLog() {
  return (
    <div className="quest-wrap">
      <ol className="quests">
        {QUESTS.map((q) => (
          <li key={q.title} className="quest" style={{ '--c': q.color } as React.CSSProperties}>
            <span className="quest-node" aria-hidden="true" />
            <time className="quest-when">
              {q.when}
              {q.ongoing && <span className="quest-live"> and ongoing</span>}
            </time>
            <h3 className="quest-title">{q.title}</h3>
            <p className="quest-where">{q.where}</p>
            <p className="quest-text">{q.text}</p>
          </li>
        ))}
      </ol>
      <aside className="loadout" aria-labelledby="loadout-title">
        <h3 id="loadout-title">Inventory</h3>
        <p>The tools I reach for most.</p>
        <ul className="inventory">
          {LOADOUT.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
