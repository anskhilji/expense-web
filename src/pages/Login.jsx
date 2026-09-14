import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.errors?.email?.[0] || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        <p className="text-muted">To your household's expense ledger.</p>

        {error && <div className="alert alert--error">{error}</div>}

        <label>
          Email
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          Password
          <input type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>

        <button className="btn btn--primary" disabled={submitting} type="submit">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-muted">No account yet? <Link to="/signup">Create one</Link></p>
        <p className="text-muted"><Link to="/forgot-password">Forgot your password?</Link></p>
      </form>
    </div>
  )
}
