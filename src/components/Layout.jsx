import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import RoleGate from './RoleGate'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__icon">🧾</span>
          <span>{user?.organization?.name}</span>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/income">Income</NavLink>
          <NavLink to="/budgets">Budgets</NavLink>
          <NavLink to="/expenses">Expenses</NavLink>
          <NavLink to="/reports">Reports</NavLink>
          <RoleGate permission="organization.manage">
            <NavLink to="/members">Members</NavLink>
          </RoleGate>
        </nav>
        <div className="app-header__user">
          <span>{user?.name} · <span className="pill">{user?.role}</span></span>
          <button onClick={logout} className="btn btn--ghost">Log out</button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
