import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

export function useMembers(search = '') {
  return useInfiniteQuery({
    queryKey: ['members', search],
    queryFn: async ({ pageParam = 1 }) =>
      (await client.get('/org/members', { params: { search, page: pageParam, per_page: 10 } })).data,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_page : undefined),
  })
}

export function useInviteMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => client.post('/org/invitations', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}

export function useChangeMemberRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }) => client.patch(`/org/members/${userId}`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}

export function useRemoveMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId) => client.delete(`/org/members/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}

export function useBlockMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId) => client.post(`/org/members/${userId}/block`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}

export function useUnblockMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId) => client.post(`/org/members/${userId}/unblock`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}
