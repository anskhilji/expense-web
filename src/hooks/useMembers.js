import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => (await client.get('/org/members')).data.data,
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