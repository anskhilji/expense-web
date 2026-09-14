import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// `withCredentials: true` is required for Sanctum's cookie-based SPA auth —
// without it the session cookie never gets sent, and every request would
// look like a fresh, unauthenticated one.
const client = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
})

// Sanctum's CSRF cookie must be fetched once (from the root domain, not
// /api) before the first state-changing request in a session.
export async function ensureCsrfCookie() {
  await axios.get(`${baseURL}/sanctum/csrf-cookie`, { withCredentials: true })
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Surface Laravel's validation error shape ({ message, errors: {...} })
    // as a flat, predictable object every form can read the same way.
    const { response } = error
    if (response?.status === 422) {
      return Promise.reject({
        status: 422,
        message: response.data.message,
        errors: response.data.errors || {},
      })
    }
    if (response?.status === 403) {
      return Promise.reject({ status: 403, message: response.data.message || "You don't have permission to do that." })
    }
    return Promise.reject({ status: response?.status, message: response?.data?.message || 'Something went wrong.' })
  }
)

export default client
