import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

export function useBudgets(month, search = '') {
  return useInfiniteQuery({
    queryKey: ['budgets', month, search],
    queryFn: async ({ pageParam = 1 }) =>
      (await client.get('/budgets', {
        params: { month, search, page: pageParam, per_page: 10 },
      })).data,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_page : undefined),
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

export function useUpdateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.put('/budgets', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      qc.invalidateQueries({ queryKey: ['reports-summary'] })
    },
  })
}
