import { useState } from 'react'
import {
  useMembers, useInviteMember, useChangeMemberRole, useRemoveMember,
  useBlockMember, useUnblockMember,
} from '../hooks/useMembers'
import { useAuth } from '../auth/AuthContext'

const ROLES = ['admin', 'editor', 'contributor', 'viewer']

export default function Members() {
  const { user } = useAuth()
  const { data: members, isLoading } = useMembers()
  const invite = useInviteMember()
  const changeRole = useChangeMemberRole()
  const removeMember = useRemoveMember()
  const blockMember = useBlockMember()
  const unblockMember = useUnblockMember()
  const [form, setForm] = useState({ email: '', role: 'contributor' })
  const [inviteLink, setInviteLink] = useState(null)
  const [invitedEmail, setInvitedEmail] = useState(null)
  const [error, setError] = useState(null)
  const [memberError, setMemberError] = useState(null)

  async function handleInvite(e) {
    e.preventDefault()
    setError(null)
    setInviteLink(null)
    try {
      const { data } = await invite.mutateAsync(form)
      setInviteLink(data.invite_link)
      setInvitedEmail(form.email)
      setForm({ email: '', role: 'contributor' })
    } catch (err) {
      setError(err.errors?.email?.[0] || err.message)
    }
  }

  async function handleRemove(userId) {
    setMemberError(null)
    try {
      await removeMember.mutateAsync(userId)
    } catch (err) {
      // Backend refuses when this member has expenses/incomes on record —
      // surface that message so the admin knows to block instead.
      setMemberError(err.errors?.user?.[0] || err.message)
    }
  }

  async function handleBlock(userId) {
    setMemberError(null)
    try {
      await blockMember.mutateAsync(userId)
    } catch (err) {
      setMemberError(err.errors?.user?.[0] || err.message)
    }
  }

  async function handleUnblock(userId) {
    setMemberError(null)
    try {
      await unblockMember.mutateAsync(userId)
    } catch (err) {
      setMemberError(err.errors?.user?.[0] || err.message)
    }
  }

  return (
    <div className="page">
      <h1>Members</h1>
      <p className="text-muted">Everyone with access to {user?.organization?.name}, and what each one can do.</p>

      <form className="inline-form" onSubmit={handleInvite}>
        <input type="email" required placeholder="Email to invite" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="btn btn--primary" type="submit" disabled={invite.isPending}>Invite</button>
      </form>
      {error && <div className="alert alert--error">{error}</div>}
      {inviteLink && (
        <div className="alert alert--info">
          Invite sent to <strong>{invitedEmail}</strong> by email. If it doesn't arrive, you can share this link
          directly instead: <code>{inviteLink}</code>
        </div>
      )}

      {memberError && <div className="alert alert--error">{memberError}</div>}

      {isLoading && <p>Loading…</p>}

      <table className="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th /></tr></thead>
        <tbody>
          {members?.map((m) => (
            <tr key={m.user_id}>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>
                {m.role === 'owner' ? (
                  <span className="pill">owner</span>
                ) : (
                  <select value={m.role} onChange={(e) => changeRole.mutate({ userId: m.user_id, role: e.target.value })}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
              </td>
              <td>
                {m.blocked ? <span className="pill pill--error">Blocked</span> : <span className="pill pill--ok">Active</span>}
              </td>
              <td>
                {m.role !== 'owner' && (
                  <div className="inline-actions">
                    {m.blocked ? (
                      <button className="btn btn--ghost btn--small" onClick={() => handleUnblock(m.user_id)}>
                        Unblock
                      </button>
                    ) : (
                      <button className="btn btn--ghost btn--small" onClick={() => handleBlock(m.user_id)}>
                        Block
                      </button>
                    )}
                    <button className="btn btn--ghost btn--small" onClick={() => handleRemove(m.user_id)}>
                      Remove
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}