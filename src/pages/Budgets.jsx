import { useState } from 'react'
import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/useCategories'
import { useBudgets, useAllocateBudget } from '../hooks/useBudgets'
import RoleGate from '../components/RoleGate'
import { currentMonth, formatMonthLabel } from '../utils/date'

export default function Budgets() {
  const [month, setMonth] = useState(currentMonth())
  const { data: categories } = useCategories()
  const deleteCategory = useDeleteCategory()
  const { data: budgetData, isLoading } = useBudgets(month)
  const allocate = useAllocateBudget()
  const createCategory = useCreateCategory()
  const [newCategory, setNewCategory] = useState('')
  const [amounts, setAmounts] = useState({})
  const [categoryError, setCategoryError] = useState(null)

  const envelopeFor = (categoryId) =>
    budgetData?.envelopes.find((e) => e.category_id === categoryId)

  async function handleAllocate(categoryId) {
    const amount = amounts[categoryId]
    if (amount === undefined || amount === '') return
    await allocate.mutateAsync({
      category_id: categoryId,
      month: `${month}-01`,
      allocated_amount: Number(amount),
    })
  }

  async function handleDeleteCategory(id) {
    setCategoryError(null)
    try {
      await deleteCategory.mutateAsync(id)
    } catch (err) {
      setCategoryError(err.errors?.category?.[0] || err.message)
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault()
    if (!newCategory.trim()) return
    await createCategory.mutateAsync({ name: newCategory.trim() })
    setNewCategory('')
  }

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Budgets</h1>
          <p className="text-muted">Allocate {formatMonthLabel(month)}'s income into categories — this is the envelope each expense draws down from.</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      <RoleGate permission="categories.manage">
        <form className="inline-form" onSubmit={handleAddCategory}>
          <input placeholder="New category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
          <button className="btn btn--secondary" type="submit">Add category</button>
          {categoryError && <div className="alert alert--error">{categoryError}</div>}
        </form>
      </RoleGate>

      {isLoading && <p>Loading…</p>}

      <table className="data-table">
        <thead>
          <tr><th>Category</th><th>Allocated</th><th>Spent</th><th>Remaining</th><RoleGate permission="budgets.manage"><th>Set allocation</th></RoleGate><RoleGate permission="categories.manage"><th /></RoleGate></tr>
        </thead>
        <tbody>
          {categories?.map((cat) => {
            const env = envelopeFor(cat.id)
            return (
              <tr key={cat.id}>
                <td>{cat.icon} {cat.name}</td>
                <td>Rs {(env?.allocated ?? 0).toLocaleString()}</td>
                <td>Rs {(env?.spent ?? 0).toLocaleString()}</td>
                <td className={(env?.remaining ?? 0) < 0 ? 'text-negative' : ''}>Rs {(env?.remaining ?? 0).toLocaleString()}</td>
                <RoleGate permission="budgets.manage">
                  <td>
                    <div className="inline-form inline-form--tight">
                      <input type="number" min="0" step="0.01" placeholder="Amount"
                        value={amounts[cat.id] ?? ''}
                        onChange={(e) => setAmounts({ ...amounts, [cat.id]: e.target.value })} />
                      <button className="btn btn--small" onClick={() => handleAllocate(cat.id)}>Save</button>
                    </div>
                  </td>
                </RoleGate>
                <RoleGate permission="categories.manage">
                  <td>
                    <button className="btn btn--ghost btn--small" onClick={() => handleDeleteCategory(cat.id)}>
                      Delete
                    </button>
                  </td>
                </RoleGate>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
