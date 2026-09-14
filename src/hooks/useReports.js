import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

export function useMonthSummary(month) {
  return useQuery({
    queryKey: ['reports-summary', month],
    queryFn: async () => (await client.get('/reports/summary', { params: { month } })).data,
  })
}

export function useLedger(months = 3) {
  return useQuery({
    queryKey: ['reports-ledger', months],
    queryFn: async () => (await client.get('/reports/ledger', { params: { months } })).data.months,
  })
}
