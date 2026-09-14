import { useState } from 'react'
import { useLogExpense } from '../hooks/useExpenses'
import { today } from '../utils/date'

/**
 * The one-thumb-friendly form from the build plan's phase 6 note: amount,
 * category, date, note — nothing else. Submitting invalidates the
 * dashboard's query, so the envelope card's bar and "remaining" figure
 * update immediately without touching the page.
 */
export default function QuickAddExpense({ categories }) {
  const logExpense = useLogExpense()
  const [form, setForm] = useState({ category_id: '', amount: '', note: '', spent_at: today() })
  const [feedback, setFeedback] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback(null)
    try {
      const { data } = await logExpense.mutateAsync({
        ...form,
        category_id: Number(form.category_id),
        amount: Number(form.amount),
      })
      setFeedback({ type: 'ok', text: `Logged. Rs ${data.remaining_in_category.toLocaleString()} left in that category this month.` })
      setForm({ category_id: '', amount: '', note: '', spent_at: today() })
    } catch (err) {
      setFeedback({ type: 'error', text: err.errors?.amount?.[0] || err.errors?.category_id?.[0] || err.message })
    }
  }

  return (
    <form className="quick-add" onSubmit={handleSubmit}>
      <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
        <option value="" disabled>Category</option>
        {categories.map((c) => (
          <option key={c.category_id} value={c.category_id}>{c.icon} {c.category_name}</option>
        ))}
      </select>
      <input type="number" min="0.01" step="0.01" required placeholder="Amount" value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      <input type="text" placeholder="Note (optional)" value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })} />
      <input type="date" required max={today()} value={form.spent_at}
        onChange={(e) => setForm({ ...form, spent_at: e.target.value })} />
      <button className="btn btn--primary" type="submit" disabled={logExpense.isPending}>
        {logExpense.isPending ? 'Adding…' : 'Add expense'}
      </button>
      {feedback && <span className={feedback.type === 'ok' ? 'text-positive' : 'text-negative'}>{feedback.text}</span>}
    </form>
  )
}
