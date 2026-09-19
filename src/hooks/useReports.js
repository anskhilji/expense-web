import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import client from '../api/client'

export function useMonthSummary(month) {
  return useQuery({
    queryKey: ['reports-summary', month],
    queryFn: async () => (await client.get('/reports/summary', { params: { month } })).data,
  })
}

export function useLedger(perPage = 10) {
  return useInfiniteQuery({
    queryKey: ['reports-ledger', perPage],
    queryFn: async ({ pageParam = 1 }) =>
      (await client.get('/reports/ledger', { params: { page: pageParam, per_page: perPage } })).data,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_page : undefined),
  })
}
