import { useState } from 'react'
import { useIncomes, useLogIncome, useDeleteIncome } from '../hooks/useIncomes'
import RoleGate from '../components/RoleGate'
import { currentMonth, today, formatMonthLabel } from '../utils/date'

export default function Income() {
  const [month, setMonth] = useState(currentMonth())
  const { data, isLoading } = useIncomes(month)
  const logIncome = useLogIncome()
  const deleteIncome = useDeleteIncome()
  const [form, setForm] = useState({ amount: '', source: '', received_at: today() })
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await logIncome.mutateAsync({ ...form, amount: Number(form.amount) })
      setForm({ amount: '', source: '', received_at: today() })
    } catch (err) {
      setError(err.errors?.amount?.[0] || err.message)
    }
  }

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Income</h1>
          <p className="text-muted">Every deposit is its own entry — the month's total is the sum below.</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      <RoleGate permission="incomes.create">
        <form className="inline-form" onSubmit={handleSubmit}>
          <input type="number" min="0.01" step="0.01" required placeholder="Amount"
            value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input type="text" placeholder="Source (e.g. Salary)"
            value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <input type="date" required max={today()} value={form.received_at}
            onChange={(e) => setForm({ ...form, received_at: e.target.value })} />
          <button className="btn btn--primary" type="submit" disabled={logIncome.isPending}>Log income</button>
        </form>
        {error && <div className="alert alert--error">{error}</div>}
      </RoleGate>

      {isLoading && <p>Loading…</p>}

      {data && (
        <>
          <div className="stat-tile stat-tile--wide">
            <span className="stat-tile__label">Total for {formatMonthLabel(month)}</span>
            <span className="stat-tile__value">Rs {data.total.toLocaleString()}</span>
          </div>

          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Source</th><th>Amount</th><th>Logged by</th><th /></tr>
            </thead>
            <tbody>
              {data.data.map((row) => (
                <tr key={row.id}>
                  <td>{row.received_at}</td>
                  <td>{row.source || '—'}</td>
                  <td>Rs {row.amount.toLocaleString()}</td>
                  <td>{row.logged_by}</td>
                  <td>
                    <RoleGate permission="incomes.delete">
                      <button className="btn btn--ghost btn--small" onClick={() => deleteIncome.mutate(row.id)}>Delete</button>
                    </RoleGate>
                  </td>
                </tr>
              ))}
              {data.data.length === 0 && (
                <tr><td colSpan={5} className="text-muted">No income logged for this month yet.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
