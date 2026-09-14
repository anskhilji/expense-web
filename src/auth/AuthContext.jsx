import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import client, { ensureCsrfCookie } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { data } = await client.get('/user')
      setUser(data.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function login(email, password) {
    await ensureCsrfCookie()
    const { data } = await client.post('/login', { email, password })
    setUser(data.data)
    return data.data
  }

  async function register(payload) {
    await ensureCsrfCookie()
    const { data } = await client.post('/register', payload)
    setUser(data.data)
    return data.data
  }

  async function acceptInvitation(token, payload) {
    await ensureCsrfCookie()
    const { data } = await client.post(`/invitations/${token}/accept`, payload)
    setUser(data.data)
    return data.data
  }

  async function logout() {
    await client.post('/logout')
    setUser(null)
  }

  async function forgotPassword(email) {
    await ensureCsrfCookie()
    const { data } = await client.post('/forgot-password', { email })
    return data
  }

  async function resetPassword(payload) {
    await ensureCsrfCookie()
    const { data } = await client.post('/reset-password', payload)
    return data
  }

  async function resendVerificationEmail() {
    const { data } = await client.post('/email/verification-notification')
    return data
  }

  // `role` and `permissions` come straight from the API (UserResource) —
  // this is what RoleGate reads to decide what to show. It is a UI
  // convenience only; every one of these actions is re-checked server-side
  // by the `permission:` middleware regardless of what's rendered here.
  const can = (permission) => user?.permissions?.includes(permission) ?? false

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, acceptInvitation, refresh, can,
      forgotPassword, resetPassword, resendVerificationEmail,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}