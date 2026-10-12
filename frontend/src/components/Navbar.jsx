import { useAuth } from '../context/AuthContext.jsx'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <h1>Expense Tracker</h1>
      <div className="navbar-right">
        <span className="navbar-user">{user.name}</span>
        <button className="btn btn-secondary" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  )
}

export default Navbar
