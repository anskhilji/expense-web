import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ResetPassword() {
    const { resetPassword } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') || ''
    const email = searchParams.get('email') || ''

    const [form, setForm] = useState({ password: '', password_confirmation: '' })
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        try {
            await resetPassword({ token, email, ...form })
            setDone(true)
            setTimeout(() => { window.location.href = '/login' }, 2000)
        } catch (err) {
            setError(err.errors?.email?.[0] || err.errors?.password?.[0] || err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (!token || !email) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <h1>Invalid link</h1>
                    <p className="text-muted">This password reset link is missing information. Request a new one.</p>
                    <p><Link to="/forgot-password">Request a new link</Link></p>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Reset password</h1>
                <p className="text-muted">Setting a new password for {email}</p>

                {error && <div className="alert alert--error">{error}</div>}
                {done && <div className="alert alert--success">Password reset — redirecting to sign in…</div>}

                <label>
                    New password
                    <input type="password" required minLength={8} value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </label>
                <label>
                    Confirm new password
                    <input type="password" required minLength={8} value={form.password_confirmation}
                        onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
                </label>

                <button className="btn btn--primary" disabled={submitting || done} type="submit">
                    {submitting ? 'Resetting…' : 'Reset password'}
                </button>
            </form>
        </div>
    )
}