import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await client.get('/categories')).data.data,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.post('/categories', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => client.delete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}