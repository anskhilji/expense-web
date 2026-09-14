import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import client from '../api/client'

export default function AcceptInvite() {
  const { token } = useParams()
  const { user, acceptInvitation } = useAuth()
  const navigate = useNavigate()
  const [invite, setInvite] = useState(null)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', password: '', password_confirmation: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    client.get(`/invitations/${token}`)
      .then(({ data }) => setInvite(data))
      .catch((err) => setError(err.message))
  }, [token])

  async function handleAccept(e) {
    e?.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await acceptInvitation(token, user ? {} : form)
      navigate('/')
    } catch (err) {
      setError(err.errors?.name?.[0] || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !invite) return <div className="auth-page"><div className="alert alert--error">{error}</div></div>
  if (!invite) return <div className="page-loading">Loading…</div>

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>You're invited</h1>
        <p className="text-muted">
          <strong>{invite.organization_name}</strong> invited <strong>{invite.email}</strong> as a <strong>{invite.role}</strong>.
        </p>

        {error && <div className="alert alert--error">{error}</div>}

        {user ? (
          <>
            {user.email.toLowerCase() !== invite.email.toLowerCase() && (
              <div className="alert alert--error">
                You're signed in as {user.email}, but this invite is for {invite.email}. Log out first.
              </div>
            )}
            <button className="btn btn--primary" onClick={handleAccept} disabled={submitting}>
              Accept as {user.email}
            </button>
          </>
        ) : (
          <form onSubmit={handleAccept}>
            <label>
              Your name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Choose a password
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </label>
            <label>
              Confirm password
              <input type="password" required value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
            </label>
            <button className="btn btn--primary" type="submit" disabled={submitting}>
              {submitting ? 'Joining…' : 'Create account & join'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
