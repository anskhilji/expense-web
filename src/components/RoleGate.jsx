import { useAuth } from '../auth/AuthContext'

/**
 * Hides an action a Viewer/Contributor shouldn't see — UI convenience only.
 * The real enforcement is the `permission:` middleware on the server; this
 * component just avoids showing a button that would 403 if clicked.
 */
export default function RoleGate({ permission, children }) {
  const { can } = useAuth()
  if (!can(permission)) return null
  return children
}
