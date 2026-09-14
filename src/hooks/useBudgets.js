import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

export function useBudgets(month) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: async () => (await client.get('/budgets', { params: { month } })).data,
  })
}

export function useAllocateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.post('/budgets', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      qc.invalidateQueries({ queryKey: ['reports-summary'] })
    },
  })
}
