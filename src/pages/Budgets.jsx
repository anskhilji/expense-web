import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateCategory, useDeleteCategory } from '../hooks/useCategories'
import { useBudgets, useAllocateBudget, useUpdateBudget } from '../hooks/useBudgets'
import RoleGate from '../components/RoleGate'
import { currentMonth, formatMonthLabel } from '../utils/date'

export default function Budgets() {
  const [month, setMonth] = useState(currentMonth())
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const deleteCategory = useDeleteCategory()
  const allocate = useAllocateBudget()
  const updateBudget = useUpdateBudget()
  const createCategory = useCreateCategory()
  const [newCategory, setNewCategory] = useState('')
  const [amounts, setAmounts] = useState({})
  const [editing, setEditing] = useState({})
  const [editAmounts, setEditAmounts] = useState({})
  const [budgetErrors, setBudgetErrors] = useState({})
  const [categoryError, setCategoryError] = useState(null)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useBudgets(month, search)
  const sentinelRef = useRef(null)

  // Debounce the search box 350ms before it hits the API, same as
  // Expenses/Income, so it doesn't fire a request on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '0px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  const envelopes = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])

  async function handleAllocate(categoryId) {
    const amount = amounts[categoryId]
    if (amount === undefined || amount === '') return
    await allocate.mutateAsync({
      category_id: categoryId,
      month: `${month}-01`,
      allocated_amount: Number(amount),
    })
    setAmounts({ ...amounts, [categoryId]: '' })
  }

  function startEditing(env) {
    setBudgetErrors({ ...budgetErrors, [env.category_id]: null })
    setEditAmounts({ ...editAmounts, [env.category_id]: String(env.allocated) })
    setEditing({ ...editing, [env.category_id]: true })
  }

  function cancelEditing(categoryId) {
    setBudgetErrors({ ...budgetErrors, [categoryId]: null })
    setEditing({ ...editing, [categoryId]: false })
  }

  async function handleUpdate(categoryId) {
    const amount = editAmounts[categoryId]
    if (amount === undefined || amount === '') return

    setBudgetErrors({ ...budgetErrors, [categoryId]: null })
    try {
      await updateBudget.mutateAsync({
        category_id: categoryId,
        month: `${month}-01`,
        allocated_amount: Number(amount),
      })
      setEditing({ ...editing, [categoryId]: false })
    } catch (err) {
      setBudgetErrors({
        ...budgetErrors,
        [categoryId]: err.errors?.allocated_amount?.[0] || err.message,
      })
    }
  }

  async function handleDeleteCategory(id) {
    setCategoryError(null)
    try {
      await deleteCategory.mutateAsync(id)
      qc.invalidateQueries({ queryKey: ['budgets'] })
    } catch (err) {
      setCategoryError(err.errors?.category?.[0] || err.message)
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault()
    if (!newCategory.trim()) return
    await createCategory.mutateAsync({ name: newCategory.trim() })
    setNewCategory('')
    qc.invalidateQueries({ queryKey: ['budgets'] })
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

      <input
        type="text"
        className="search-input"
        placeholder="Search categories…"
        title="Search by category name"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      <table className="data-table">
        <thead>
          <tr><th>Category</th><th>Allocated</th><th>Spent</th><th>Remaining</th><RoleGate permission="budgets.manage"><th>Add to allocation</th><th>Edit allocation</th></RoleGate><RoleGate permission="categories.manage"><th /></RoleGate></tr>
        </thead>
        <tbody>
          {envelopes.map((env) => (
            <tr key={env.category_id}>
              <td>{env.icon} {env.category_name}</td>
              <td>Rs {env.allocated.toLocaleString()}</td>
              <td>Rs {env.spent.toLocaleString()}</td>
              <td className={env.remaining < 0 ? 'text-negative' : ''}>Rs {env.remaining.toLocaleString()}</td>
              <RoleGate permission="budgets.manage">
                <td>
                  <div className="inline-form inline-form--tight">
                    <input type="number" min="0" step="0.01" placeholder="Add amount"
                      value={amounts[env.category_id] ?? ''}
                      onChange={(e) => setAmounts({ ...amounts, [env.category_id]: e.target.value })} />
                    <button className="btn btn--small" onClick={() => handleAllocate(env.category_id)}>Save</button>
                  </div>
                </td>
                <td>
                  {editing[env.category_id] ? (
                    <div className="inline-form inline-form--tight">
                      <input type="number" min={env.spent} step="0.01" aria-label={`Final allocation for ${env.category_name}`}
                        value={editAmounts[env.category_id] ?? ''}
                        onChange={(e) => setEditAmounts({ ...editAmounts, [env.category_id]: e.target.value })} />
                      <button className="btn btn--small" type="button" onClick={() => handleUpdate(env.category_id)}>Save</button>
                      <button className="btn btn--ghost btn--small" type="button" onClick={() => cancelEditing(env.category_id)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="btn btn--ghost btn--small" type="button" onClick={() => startEditing(env)}>
                      Edit
                    </button>
                  )}
                  {budgetErrors[env.category_id] && <div className="alert alert--error">{budgetErrors[env.category_id]}</div>}
                </td>
              </RoleGate>
              <RoleGate permission="categories.manage">
                <td>
                  <button className="btn btn--ghost btn--small" onClick={() => handleDeleteCategory(env.category_id)}>
                    Delete
                  </button>
                </td>
              </RoleGate>
            </tr>
          ))}
          {!isLoading && envelopes.length === 0 && (
            <tr><td colSpan={7} className="text-muted">No categories match "{search}".</td></tr>
          )}
          <tr ref={sentinelRef}>
            <td colSpan={7} className="text-muted" style={{ textAlign: 'center' }}>
              {isFetchingNextPage ? 'Loading more…' : (!hasNextPage && envelopes.length > 0 ? 'End of list.' : '')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
