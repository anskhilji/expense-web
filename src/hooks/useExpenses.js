import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

export function useExpenses({ month, categoryId } = {}) {
  return useQuery({
    queryKey: ['expenses', month, categoryId],
    queryFn: async () =>
      (await client.get('/expenses', { params: { month, category_id: categoryId } })).data.data,
  })
}

export function useLogExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.post('/expenses', payload),
    onSuccess: () => {
      // An expense touches its category's envelope, this month's expense
      // list, the dashboard summary, and the ledger — invalidate all four
      // so the whole app reflects it immediately, everywhere it's shown.
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      qc.invalidateQueries({ queryKey: ['reports-summary'] })
      qc.invalidateQueries({ queryKey: ['reports-ledger'] })
    },
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => client.delete(`/expenses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      qc.invalidateQueries({ queryKey: ['reports-summary'] })
      qc.invalidateQueries({ queryKey: ['reports-ledger'] })
    },
  })
}
