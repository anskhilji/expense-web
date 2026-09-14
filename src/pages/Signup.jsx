import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const empty = { name: '', email: '', organization_name: '', password: '', password_confirmation: '' }

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setErrors(err.errors || { form: [err.message] })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your household</h1>
        <p className="text-muted">You'll be the Owner — invite others afterwards from Members.</p>

        {errors.form && <div className="alert alert--error">{errors.form[0]}</div>}

        <label>
          Your name
          <input required value={form.name} onChange={set('name')} />
        </label>
        <label>
          Email
          <input type="email" required value={form.email} onChange={set('email')} />
          {errors.email && <span className="field-error">{errors.email[0]}</span>}
        </label>
        <label>
          Organization name
          <input required placeholder="e.g. Khan Household" value={form.organization_name}
            onChange={set('organization_name')} />
          {errors.organization_name && <span className="field-error">{errors.organization_name[0]}</span>}
        </label>
        <label>
          Password
          <input type="password" required value={form.password} onChange={set('password')} />
          {errors.password && <span className="field-error">{errors.password[0]}</span>}
        </label>
        <label>
          Confirm password
          <input type="password" required value={form.password_confirmation}
            onChange={set('password_confirmation')} />
        </label>

        <button className="btn btn--primary" disabled={submitting} type="submit">
          {submitting ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-muted">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  )
}
