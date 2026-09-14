import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

export function useIncomes(month) {
  return useQuery({
    queryKey: ['incomes', month],
    queryFn: async () => (await client.get('/incomes', { params: { month } })).data,
  })
}

export function useLogIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.post('/incomes', payload),
    // Invalidate everything income touches: the income log itself, the
    // dashboard summary (total income changes), and the ledger — this is
    // the "no page reload" mechanism. React Query refetches in the
    // background and every screen showing these numbers re-renders itself.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['reports-summary'] })
      qc.invalidateQueries({ queryKey: ['reports-ledger'] })
    },
  })
}

export function useDeleteIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => client.delete(`/incomes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['reports-summary'] })
      qc.invalidateQueries({ queryKey: ['reports-ledger'] })
    },
  })
}
