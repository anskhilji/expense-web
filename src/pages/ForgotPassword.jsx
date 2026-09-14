import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ForgotPassword() {
    const { forgotPassword } = useAuth()
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState(null)
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        setMessage(null)
        try {
            const data = await forgotPassword(email)
            setMessage(data.message)
        } catch (err) {
            setError(err.errors?.email?.[0] || err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Forgot password</h1>
                <p className="text-muted">Enter your account email and we'll send you a reset link.</p>

                {error && <div className="alert alert--error">{error}</div>}
                {message && <div className="alert alert--success">{message}</div>}

                <label>
                    Email
                    <input type="email" required value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                </label>

                <button className="btn btn--primary" disabled={submitting} type="submit">
                    {submitting ? 'Sending…' : 'Send reset link'}
                </button>

                <p className="text-muted"><Link to="/login">Back to sign in</Link></p>
            </form>
        </div>
    )
}