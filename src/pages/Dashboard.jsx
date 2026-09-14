import { useState } from 'react'
import { useMonthSummary } from '../hooks/useReports'
import EnvelopeCard from '../components/EnvelopeCard'
import RoleGate from '../components/RoleGate'
import QuickAddExpense from '../components/QuickAddExpense'
import { currentMonth, formatMonthLabel } from '../utils/date'

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth())
  const { data, isLoading, isError } = useMonthSummary(month)

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>{formatMonthLabel(month)}</h1>
          <p className="text-muted">Live totals — updates the moment you log something, no refresh needed.</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      {isLoading && <p>Loading…</p>}
      {isError && <p className="alert alert--error">Couldn't load the summary.</p>}

      {data && (
        <>
          <div className="stat-row">
            <div className="stat-tile">
              <span className="stat-tile__label">Income</span>
              <span className="stat-tile__value">Rs {data.total_income.toLocaleString()}</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile__label">Allocated</span>
              <span className="stat-tile__value">Rs {data.total_allocated.toLocaleString()}</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile__label">Spent</span>
              <span className="stat-tile__value">Rs {data.total_spent.toLocaleString()}</span>
            </div>
            <div className={`stat-tile ${data.net < 0 ? 'stat-tile--negative' : ''}`}>
              <span className="stat-tile__label">Net</span>
              <span className="stat-tile__value">Rs {data.net.toLocaleString()}</span>
            </div>
          </div>

          <RoleGate permission="expenses.create">
            <QuickAddExpense month={month} categories={data.envelopes} />
          </RoleGate>

          <h2>Category envelopes</h2>
          <div className="envelope-grid">
            {data.envelopes.map((env) => (
              <EnvelopeCard key={env.category_id} envelope={env} />
            ))}
            {data.envelopes.length === 0 && (
              <p className="text-muted">No categories yet — add one from the Budgets page.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
