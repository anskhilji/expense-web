import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useExpenses, useDeleteExpense } from '../hooks/useExpenses'
import RoleGate from '../components/RoleGate'
import { currentMonth } from '../utils/date'

export default function Expenses() {
  const [month, setMonth] = useState(currentMonth())
  const [categoryId, setCategoryId] = useState('')
  const { data: categories } = useCategories()
  const { data: expenses, isLoading } = useExpenses({ month, categoryId: categoryId || undefined })
  const deleteExpense = useDeleteExpense()

  return (
    <div className="page">
      <div className="page__head">
        <h1>Expenses</h1>
        <div className="filters">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">All categories</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      {isLoading && <p>Loading…</p>}

      <table className="data-table">
        <thead>
          <tr><th>Date</th><th>Category</th><th>Note</th><th>Amount</th><th>Logged by</th><th /></tr>
        </thead>
        <tbody>
          {expenses?.map((row) => (
            <tr key={row.id}>
              <td>{row.spent_at}</td>
              <td>{row.category?.icon} {row.category?.name}</td>
              <td>{row.note || '—'}</td>
              <td>Rs {row.amount.toLocaleString()}</td>
              <td>{row.logged_by}</td>
              <td>
                <RoleGate permission="expenses.delete">
                  <button className="btn btn--ghost btn--small" onClick={() => deleteExpense.mutate(row.id)}>Delete</button>
                </RoleGate>
              </td>
            </tr>
          ))}
          {expenses?.length === 0 && (
            <tr><td colSpan={6} className="text-muted">No expenses for this filter yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
