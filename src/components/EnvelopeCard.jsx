export default function EnvelopeCard({ envelope }) {
  const { category_name, icon, allocated, spent, remaining } = envelope
  const pct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : spent > 0 ? 100 : 0
  const over = remaining < 0

  return (
    <div className="envelope-card">
      <div className="envelope-card__head">
        <span className="envelope-card__icon">{icon || '💰'}</span>
        <span className="envelope-card__name">{category_name}</span>
      </div>
      <div className="envelope-card__bar">
        <div
          className={`envelope-card__bar-fill ${over ? 'envelope-card__bar-fill--over' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="envelope-card__figures">
        <span>Rs {spent.toLocaleString()} spent</span>
        <span className={over ? 'text-negative' : 'text-muted'}>
          Rs {Math.abs(remaining).toLocaleString()} {over ? 'over' : 'left'}
        </span>
      </div>
      <div className="envelope-card__allocated">of Rs {allocated.toLocaleString()} allocated</div>
    </div>
  )
}
